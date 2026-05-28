"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { vehicleUpdateSchema, type VehicleUpdateInput } from "@/lib/validation/vehicle.schema";
import { vehicleToUpdate } from "@/lib/mappers/vehicle.mapper";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import type { Vehicle } from "@/types";
import type { ZodFormattedError } from "zod";

type UpdateVehicleResult =
  | { data: Vehicle; error?: never }
  | { error: AppError | ZodFormattedError<VehicleUpdateInput>; data?: never };

export async function updateVehicleAction(
  id: string,
  garageId: string,
  rawInput: unknown,
): Promise<UpdateVehicleResult> {
  const parsed = vehicleUpdateSchema.safeParse(rawInput);
  if (!parsed.success) return { error: parsed.error.format() };

  const authError = await requireAdminForGarage(garageId);
  if (authError) return { error: authError };

  const row = vehicleToUpdate(parsed.data);

  try {
    const vehicle = await vehicleDb.update(id, row);
    revalidatePath("/vehicules", "layout"); // invalide /vehicules + tous les /vehicules/[slug]
    revalidatePath("/admin/vehicules");
    revalidateTag("vehicle-catalogue"); // invalide countPublicCached + listPaginatedCached
    return { data: vehicle };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
