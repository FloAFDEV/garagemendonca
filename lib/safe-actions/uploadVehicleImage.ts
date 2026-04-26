"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { imageDb } from "@/lib/db/image.repository";
import { vehicleImageCreateSchema } from "@/lib/validation/image.schema";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { parseSupabaseError } from "@/lib/errors/supabaseErrorParser";
import type { VehicleImage } from "@/types";

const BUCKET = "vehicle-images";

interface CreateUploadUrlResult {
  signedUrl?: string;
  publicUrl:  string;
  error?:     string;
}

/**
 * Étape 1 — génère une URL signée pour un PUT direct depuis le navigateur.
 * Retourne aussi l'URL publique finale (utilisée pour enregistrer le record DB).
 */
export async function createUploadUrlAction(
  garageId: string,
  vehicleId: string,
  fileName: string,
  contentType: string,
): Promise<CreateUploadUrlResult> {
  const authError = await requireAdminForGarage(garageId);
  if (authError) return { publicUrl: "", error: authError.message };

  // Chemin : garages/{garageId}/vehicles/{vehicleId}/{timestamp}-{fileName}
  const ext  = fileName.split(".").pop() ?? "jpg";
  const path = `garages/${garageId}/vehicles/${vehicleId}/${Date.now()}.${ext}`;

  const db = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any).storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { contentType });

  if (error) return { publicUrl: "", error: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: urlData } = (db as any).storage.from(BUCKET).getPublicUrl(path);
  return { signedUrl: data.signedUrl, publicUrl: urlData.publicUrl };
}

/**
 * Étape 3 — enregistre le VehicleImage en DB après upload.
 */
export async function saveVehicleImageAction(input: {
  vehicleId:  string;
  garageId:   string;
  url:        string;
  isPrimary?: boolean;
}): Promise<{ data: VehicleImage } | { error: { message: string } }> {
  const authError = await requireAdminForGarage(input.garageId);
  if (authError) return { error: { message: authError.message } };

  const parsed = vehicleImageCreateSchema.safeParse({
    vehicle_id: input.vehicleId,
    garage_id:  input.garageId,
    url:        input.url,
    is_primary: input.isPrimary ?? false,
  });
  if (!parsed.success) {
    return { error: { message: "Données d'image invalides." } };
  }

  try {
    const image = await imageDb.create({ ...parsed.data, alt: parsed.data.alt ?? null });
    return { data: image };
  } catch (err) {
    return { error: { message: parseSupabaseError(err).message } };
  }
}
