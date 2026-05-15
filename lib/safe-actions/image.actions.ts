"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { revalidatePath } from "next/cache";
import { extractStoragePath } from "@/lib/utils/storage";

// ─────────────────────────────────────────────────────────────────
//  syncVehicleImages
//  Synchronise la table vehicle_images avec la liste d'URLs courante.
//  - Supprime du storage les images retirées (si storage_path connu)
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

  if (pathsToDelete.length > 0) {
    await db.storage.from("vehicle-images").remove(pathsToDelete);
  }

  // Remplace toutes les entrées
  await db.from("vehicle_images").delete().eq("vehicle_id", vehicleId);

  if (imageUrls.length > 0) {
    const altBase = brandModel ? `${brandModel} occasion` : null;
    const rows = imageUrls.map((url, i) => ({
      vehicle_id:   vehicleId,
      garage_id:    garageId,
      url,
      storage_path: extractStoragePath(url) ?? null,
      sort_order:   i,
      is_primary:   i === 0,
      alt: altBase ? `${altBase}${i === 0 ? " — photo principale" : ` — photo ${i + 1}`}` : null,
      mime_type: url.includes(".webp") ? "image/webp" : "image/jpeg",
    }));

    const { error } = await db.from("vehicle_images").insert(rows);
    if (error) throw error;
  }

  // Met aussi à jour vehicles.images[] (légacy — fallback)
  await db
    .from("vehicles")
    .update({ images: imageUrls, thumbnail_url: imageUrls[0] ?? null })
    .eq("id", vehicleId);

  revalidatePath("/vehicules");
  revalidatePath(`/vehicules/${vehicleId}`);
}

// ─────────────────────────────────────────────────────────────────
//  deleteStorageImage
//  Supprime un objet du storage Supabase depuis son chemin.
// ─────────────────────────────────────────────────────────────────

export async function deleteStorageImage(
  bucket: "vehicle-images" | "service-images" | "banner-images",
  storagePath: string,
): Promise<void> {
  const db = createSupabaseAdminClient();
  await db.storage.from(bucket).remove([storagePath]);
}
