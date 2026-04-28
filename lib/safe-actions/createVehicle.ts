"use server";

/**
 * Safe action — création d'un véhicule.
 *
 * Flux :
 *   1. Validation Zod (rejette les données invalides avant tout appel DB)
 *   2. Auth + rôle (doit être admin/superadmin du garage)
 *   3. Génération du slug si absent (unique par garage, case-insensitive)
 *   4. Mapping Zod → DB row
 *   5. Insert Supabase via vehicleDb
 *   6. Normalisation erreur Supabase → AppError
 *
 * Retour : { data: Vehicle } | { error: AppError | ZodFlattenedErrors }
 */

import { revalidatePath } from "next/cache";
import { vehicleCreateSchema, type VehicleCreateInput } from "@/lib/validation/vehicle.schema";
import { vehicleToInsert } from "@/lib/mappers/vehicle.mapper";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { generateUniqueVehicleSlug } from "@/lib/utils/slug";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import type { Vehicle } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateVehicleResult =
  | { data: Vehicle; error?: never }
  | { error: AppError | ZodFormattedError<VehicleCreateInput>; data?: never };

export async function createVehicleAction(
  rawInput: unknown,
): Promise<CreateVehicleResult> {
  // 1. Validation Zod
  const parsed = vehicleCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const input = parsed.data;

  // 2. Auth — doit être admin du garage concerné
  const authError = await requireAdminForGarage(input.garage_id);
  if (authError) return { error: authError };

  // 3. Génération du slug si non fourni
  if (!input.slug) {
    input.slug = await generateUniqueVehicleSlug(
      input.brand,
      input.model,
      input.year,
      (candidate) => vehicleDb.slugExists(input.garage_id, candidate),
    );
  }

  // 4. Mapping → DB row
  const row = vehicleToInsert(input);

  // 5. Insert
  try {
    const vehicle = await vehicleDb.create(row);
    revalidatePath("/vehicules");
    revalidatePath("/admin/vehicules");
    return { data: vehicle };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
