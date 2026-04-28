/**
 * Vehicle Repository — source de vérité unique.
 *
 * DEMO_MODE=true  → données statiques (lib/data.ts), aucun appel Supabase.
 * SUPABASE_ENABLED → Supabase exclusif, aucun fallback silencieux.
 * Ni l'un ni l'autre → erreur explicite.
 */

import type { Vehicle, VehicleCreateInput, VehicleUpdateInput } from "@/types";
import {
  getAllVehicles,
  getAllVehiclesAdmin,
  getVehicleById,
  getFeaturedVehicles,
  getRelatedVehicles,
  getVehicleStaticParams,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/lib/vehicles";
import { DEMO_MODE, SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapVehicle } from "@/lib/supabase/mappers";

// ─── Lectures Supabase ───────────────────────────────────────────────────────

async function getAllSupabase(garageId?: string): Promise<Vehicle[]> {
  const db = getReadClient();
  let q = db.from("vehicles").select("*").order("created_at", { ascending: false });
  if (garageId) q = q.eq("garage_id", garageId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapVehicle);
}

async function getByIdSupabase(id: string): Promise<Vehicle | null> {
  const { data, error } = await getReadClient()
    .from("vehicles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapVehicle(data) : null;
}

async function getFeaturedSupabase(limit: number, garageId?: string): Promise<Vehicle[]> {
  let q = getReadClient()
    .from("vehicles").select("*")
    .eq("featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (garageId) q = q.eq("garage_id", garageId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapVehicle);
}

async function getRelatedSupabase(excludeId: string, limit: number, garageId?: string): Promise<Vehicle[]> {
  let q = getReadClient()
    .from("vehicles").select("*").neq("id", excludeId).limit(limit);
  if (garageId) q = q.eq("garage_id", garageId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapVehicle);
}

// ─── Repository public ───────────────────────────────────────────────────────

export const vehicleRepository = {
  getAll: async (garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(garageId);
    if (DEMO_MODE)        return getAllVehicles(garageId);
    throw new Error("[vehicleRepository] Aucune source de données : configurer Supabase ou NEXT_PUBLIC_DEMO_MODE=true");
  },

  getAllAdmin: async (garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(garageId);
    if (DEMO_MODE)        return getAllVehiclesAdmin(garageId);
    throw new Error("[vehicleRepository] Aucune source de données");
  },

  getById: async (id: string): Promise<Vehicle | null> => {
    if (SUPABASE_ENABLED) return getByIdSupabase(id);
    if (DEMO_MODE)        return getVehicleById(id);
    throw new Error("[vehicleRepository] Aucune source de données");
  },

  getFeatured: async (limit = 3, garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getFeaturedSupabase(limit, garageId);
    if (DEMO_MODE)        return getFeaturedVehicles(limit, garageId);
    throw new Error("[vehicleRepository] Aucune source de données");
  },

  getRelated: async (excludeId: string, limit = 3, garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getRelatedSupabase(excludeId, limit, garageId);
    if (DEMO_MODE)        return getRelatedVehicles(excludeId, limit, garageId);
    throw new Error("[vehicleRepository] Aucune source de données");
  },

  getStaticParams: (): Promise<{ id: string }[]> => getVehicleStaticParams(),

  // ── Écritures — in-memory (admin Phase 2A) ──
  create: (data: VehicleCreateInput & { id?: string }): Promise<Vehicle> => createVehicle(data),
  update: (id: string, data: VehicleUpdateInput): Promise<Vehicle> => updateVehicle(id, data),
  delete: (id: string): Promise<void> => deleteVehicle(id),
};
