/**
 * Repository images véhicule.
 *
 * Invariant Supabase : une seule is_primary = true par vehicle_id
 * (partial unique index : uniq_primary_image_per_vehicle).
 * setPrimary() exécute deux updates séquentiels pour respecter la contrainte.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { VehicleImageRow, VehicleImageInsert, VehicleImageUpdate } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { VehicleImage } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

function anonDb(): Q {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function adminDb(): Q {
  return createSupabaseAdminClient();
}

function rowToImage(row: VehicleImageRow): VehicleImage {
  return {
    id:         row.id,
    vehicle_id: row.vehicle_id,
    garage_id:  row.garage_id,
    url:        row.url,
    alt:        row.alt ?? undefined,
    sort_order: row.sort_order,
    is_primary: row.is_primary,
    created_at: row.created_at ?? undefined,
  };
}

export const imageDb = {
  async listByVehicle(vehicleId: string): Promise<VehicleImage[]> {
    const { data, error } = await anonDb()
      .from("vehicle_images").select("*").eq("vehicle_id", vehicleId).order("sort_order");
    if (error) throw error;
    return ((data ?? []) as VehicleImageRow[]).map(rowToImage);
  },

  async getById(id: string): Promise<VehicleImage | null> {
    const { data, error } = await anonDb()
      .from("vehicle_images").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? rowToImage(data as VehicleImageRow) : null;
  },

  async getPrimary(vehicleId: string): Promise<VehicleImage | null> {
    const { data, error } = await anonDb()
      .from("vehicle_images").select("*").eq("vehicle_id", vehicleId).eq("is_primary", true).maybeSingle();
    if (error) throw error;
    return data ? rowToImage(data as VehicleImageRow) : null;
  },

  async create(row: VehicleImageInsert): Promise<VehicleImage> {
    const { data, error } = await adminDb()
      .from("vehicle_images").insert(row).select().single();
    if (error) throw error;
    return rowToImage(data as VehicleImageRow);
  },

  async update(id: string, row: VehicleImageUpdate): Promise<VehicleImage> {
    const { data, error } = await adminDb()
      .from("vehicle_images").update(row).eq("id", id).select().single();
    if (error) throw error;
    return rowToImage(data as VehicleImageRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await adminDb().from("vehicle_images").delete().eq("id", id);
    if (error) throw error;
  },

  async reorder(items: Array<{ id: string; sort_order: number }>): Promise<void> {
    const db = adminDb();
    for (const item of items) {
      const { error } = await db.from("vehicle_images").update({ sort_order: item.sort_order }).eq("id", item.id);
      if (error) throw error;
    }
  },

  async setPrimary(vehicleId: string, imageId: string): Promise<void> {
    const db = adminDb();
    // 1. Retire l'image principale existante (contrainte partielle unique)
    const { error: clearErr } = await db
      .from("vehicle_images").update({ is_primary: false })
      .eq("vehicle_id", vehicleId).eq("is_primary", true);
    if (clearErr) throw clearErr;
    // 2. Pose la nouvelle image principale
    const { error: setErr } = await db
      .from("vehicle_images").update({ is_primary: true }).eq("id", imageId);
    if (setErr) throw setErr;
  },
};
