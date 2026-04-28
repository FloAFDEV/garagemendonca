"use server";

import { revalidatePath } from "next/cache";
import { garageCreateSchema, type GarageCreateInput } from "@/lib/validation/garage.schema";
import { garageToInsert } from "@/lib/mappers/garage.mapper";
import { garageDb } from "@/lib/db/garage.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { requireSuperAdmin } from "@/lib/auth/getSession";
import type { Garage } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateGarageResult =
  | { data: Garage; error?: never }
  | { error: AppError | ZodFormattedError<GarageCreateInput>; data?: never };

export async function createGarageAction(rawInput: unknown): Promise<CreateGarageResult> {
  const parsed = garageCreateSchema.safeParse(rawInput);
  if (!parsed.success) return { error: parsed.error.format() };

  // Seul un superadmin peut créer un garage
  const authError = await requireSuperAdmin();
  if (authError) return { error: authError };

  const row = garageToInsert(parsed.data);

  try {
    const garage = await garageDb.create(row);
    revalidatePath("/admin");
    return { data: garage };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
