/**
 * Vehicle Repository — shadow mode Phase 2A.
 *
 * Lectures : Supabase en priorité (si NEXT_PUBLIC_SUPABASE_URL configuré),
 *            fallback automatique sur le store in-memory.
 * Écritures : toujours in-memory — aucun write Supabase en Phase 2A.
 * Admin     : toujours in-memory (pas d'auth Supabase en Phase 2A).
 *
 * -- SQL Supabase -----------------------------------------------------------
 * Voir lib/supabase/schema.sql → table vehicles
 * Mapping camelCase ↔ snake_case dans lib/supabase/mappers.ts → mapVehicle()
 * --------------------------------------------------------------------------
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
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapVehicle } from "@/lib/supabase/mappers";

const USE_SUPABASE_READ_ONLY = SUPABASE_ENABLED;

// ─── Lectures Supabase privées ───────────────────────────────────────────────

async function getAllSupabase(garageId?: string): Promise<Vehicle[]> {
  const db = getReadClient();
  // La RLS public_read filtre déjà : published | sold | (scheduled + published_at <= now())
  let q = db.from("vehicles").select("*").order("created_at", { ascending: false });
  if (garageId) q = q.eq("garage_id", garageId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapVehicle);
}

async function getByIdSupabase(id: string): Promise<Vehicle | null> {
  const db = getReadClient();
  const { data, error } = await db
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapVehicle(data) : null;
}

async function getFeaturedSupabase(limit: number, garageId?: string): Promise<Vehicle[]> {
  const db = getReadClient();
  let q = db
    .from("vehicles")
    .select("*")
    .eq("featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (garageId) q = q.eq("garage_id", garageId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapVehicle);
}

async function getRelatedSupabase(
  excludeId: string,
  limit: number,
  garageId?: string,
): Promise<Vehicle[]> {
  const db = getReadClient();
  let q = db
    .from("vehicles")
    .select("*")
    .neq("id", excludeId)
    .limit(limit);
  if (garageId) q = q.eq("garage_id", garageId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapVehicle);
}

// ─── Repository public ───────────────────────────────────────────────────────

export const vehicleRepository = {
  /** Véhicules visibles côté public (published + sold + scheduled passé). */
  getAll: async (garageId?: string): Promise<Vehicle[]> => {
    if (USE_SUPABASE_READ_ONLY) return getAllSupabase(garageId);
    return getAllVehicles(garageId);
  },

  /** Admin — toujours in-memory (pas d'auth en Phase 2A). */
  getAllAdmin: (garageId?: string): Promise<Vehicle[]> =>
    getAllVehiclesAdmin(garageId),

  getById: async (id: string): Promise<Vehicle | null> => {
    if (USE_SUPABASE_READ_ONLY) return getByIdSupabase(id);
    return getVehicleById(id);
  },

  getFeatured: async (limit = 3, garageId?: string): Promise<Vehicle[]> => {
    if (USE_SUPABASE_READ_ONLY) return getFeaturedSupabase(limit, garageId);
    return getFeaturedVehicles(limit, garageId);
  },

  getRelated: async (excludeId: string, limit = 3, garageId?: string): Promise<Vehicle[]> => {
    if (USE_SUPABASE_READ_ONLY) return getRelatedSupabase(excludeId, limit, garageId);
    return getRelatedVehicles(excludeId, limit, garageId);
  },

  /** Pour generateStaticParams — in-memory (build-time stable). */
  getStaticParams: (): Promise<{ id: string }[]> => getVehicleStaticParams(),

  // ── Écritures — toujours in-memory (aucun write Supabase en Phase 2A) ──

  create: (data: VehicleCreateInput & { id?: string }): Promise<Vehicle> =>
    createVehicle(data),

  update: (id: string, data: VehicleUpdateInput): Promise<Vehicle> =>
    updateVehicle(id, data),

  delete: (id: string): Promise<void> => deleteVehicle(id),
};
