/**
 * Vehicle Repository — source de vérité unique.
 *
 * DEMO_MODE=true  → données statiques (lib/data.ts), aucun appel Supabase.
 * SUPABASE_ENABLED → Supabase exclusif, aucun fallback silencieux.
 * Ni l'un ni l'autre → erreur explicite.
 */

import type { Vehicle } from "@/types";
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
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
    return [];
  },

  getAllAdmin: async (garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(garageId);
    return [];
  },

  getById: async (id: string): Promise<Vehicle | null> => {
    if (SUPABASE_ENABLED) return getByIdSupabase(id);
    return null;
  },

  getFeatured: async (limit = 3, garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getFeaturedSupabase(limit, garageId);
    return [];
  },

  getRelated: async (excludeId: string, limit = 3, garageId?: string): Promise<Vehicle[]> => {
    if (SUPABASE_ENABLED) return getRelatedSupabase(excludeId, limit, garageId);
    return [];
  },

};
