"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { revalidatePath } from "next/cache";
import {
  extractStoragePath,
  extractBasePath,
  isLegacyPath,
  getVariantPaths,
} from "@/lib/utils/storage";

const VEHICLE_BUCKET = "vehicle-images";

// ─────────────────────────────────────────────────────────────────
//  deleteVehicleStoragePaths
//  Removes storage files for a given storage_path, handling both:
//  - Legacy single file (path ends with image extension)
//  - New multi-variant format (basePath → deletes all 3 variants)
// ─────────────────────────────────────────────────────────────────

async function deleteVehicleStoragePaths(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  storagePath: string,
): Promise<void> {
  if (isLegacyPath(storagePath)) {
    // Legacy: single WebP/JPEG file
    await supabase.storage.from(VEHICLE_BUCKET).remove([storagePath]);
  } else {
    // New format: delete all 3 variants (basePath has no extension)
    const basePath = extractBasePath(storagePath);
    const variants = getVariantPaths(basePath);
    const paths = Object.values(variants);
    await supabase.storage.from(VEHICLE_BUCKET).remove(paths);
  }
}

// ─────────────────────────────────────────────────────────────────
//  syncVehicleImages
//  Synchronise la table vehicle_images avec la liste d'URLs courante.
//  - Supprime du storage les images retirées (legacy ou multi-variant)
//  - Supprime tous les enregistrements existants, réinsère dans l'ordre
// ─────────────────────────────────────────────────────────────────

export async function syncVehicleImages(
  vehicleId: string,
  garageId: string,
  imageUrls: string[],
  brandModel?: string,
): Promise<void> {
  const db = createSupabaseAdminClient();

  // Récupère les images existantes pour trouver les storage_paths à nettoyer
  const { data: existing } = await db
    .from("vehicle_images")
    .select("url, storage_path")
    .eq("vehicle_id", vehicleId);

  const urlsToKeep = new Set(imageUrls);
  const pathsToDelete = (existing ?? [])
    .filter((img) => !urlsToKeep.has(img.url) && img.storage_path)
    .map((img) => img.storage_path as string);

  // Delete storage files (handles both legacy single-file and multi-variant)
  for (const storagePath of pathsToDelete) {
    await deleteVehicleStoragePaths(db, storagePath).catch((err) => {
      console.warn("[syncVehicleImages] storage delete failed:", storagePath, err);
    });
  }

  // Remplace toutes les entrées
  await db.from("vehicle_images").delete().eq("vehicle_id", vehicleId);

  if (imageUrls.length > 0) {
    const altBase = brandModel ? `${brandModel} occasion` : null;
    const rows = imageUrls.map((url, i) => {
      // For new-format images: storagePath is the basePath (no extension)
      // For legacy images: storagePath is extracted from URL
      const rawPath = extractStoragePath(url) ?? null;
      const storagePath = rawPath ? extractBasePath(rawPath) : null;

      // Detect mime type: new format is always webp; legacy may vary
      const isWebp = url.includes(".webp") || (rawPath && !isLegacyPath(rawPath));

      return {
        vehicle_id:   vehicleId,
        garage_id:    garageId,
        url,
        storage_path: storagePath,
        sort_order:   i,
        is_primary:   i === 0,
        alt: altBase ? `${altBase}${i === 0 ? " — photo principale" : ` — photo ${i + 1}`}` : null,
        mime_type: isWebp ? "image/webp" : "image/jpeg",
      };
    });

    const { error } = await db.from("vehicle_images").insert(rows);
    if (error) throw error;
  }

  // Met aussi à jour vehicles.images[] (légacy — fallback)
  const { error: legacyErr } = await db
    .from("vehicles")
    .update({ images: imageUrls, thumbnail_url: imageUrls[0] ?? null })
    .eq("id", vehicleId);
  if (legacyErr) {
    console.warn("[syncVehicleImages] legacy vehicles.images update failed:", legacyErr.message);
  }

  revalidatePath("/vehicules");
  revalidatePath(`/vehicules/${vehicleId}`);
}

// ─────────────────────────────────────────────────────────────────
//  deleteStorageImage
//  Supprime un ou plusieurs objets du storage Supabase.
//  Pour vehicle-images avec basePath (no extension) → supprime 3 variants.
// ─────────────────────────────────────────────────────────────────

export async function deleteStorageImage(
  bucket: "vehicle-images" | "service-images" | "banner-images",
  storagePath: string,
): Promise<void> {
  const db = createSupabaseAdminClient();

  if (bucket === VEHICLE_BUCKET) {
    await deleteVehicleStoragePaths(db, storagePath);
  } else {
    await db.storage.from(bucket).remove([storagePath]);
  }
}
