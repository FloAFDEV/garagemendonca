/**
 * Data access layer — Supabase-ready.
 *
 * Architecture multi-garages :
 *   - Chaque véhicule porte un `garageId`.
 *   - Les fonctions acceptent un `garageId` optionnel pour filtrer par garage.
 *   - Un garage avec plan "shared" peut voir tous les véhicules.
 *
 * Pour connecter Supabase, remplacez les implémentations mock par :
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("vehicles").select("*")...
 *
 * Le code des pages n'importe JAMAIS depuis lib/data.ts directement —
 * uniquement via ce fichier — ce qui garantit zéro refactoring lors
 * de la migration Supabase.
 */

import type { Vehicle, VehicleCreateInput, VehicleUpdateInput } from "@/types";
import { vehicles as mockVehicles } from "./data";

/* ─── helpers mock ─── */
let _store: Vehicle[] = [...mockVehicles];

function now(): string {
  return new Date().toISOString();
}

/* ──────────────────────────────────────────
   READ
────────────────────────────────────────── */

/**
 * Récupère tous les véhicules.
 * @param garageId  Si fourni, filtre par garage (mode isolated).
 *                  Si omis, retourne tous les véhicules (mode shared / superadmin).
 */
export async function getAllVehicles(garageId?: string): Promise<Vehicle[]> {
  // Future Supabase:
  // let q = supabase.from("vehicles").select("*").order("created_at", { ascending: false });
  // if (garageId) q = q.eq("garage_id", garageId);
  // const { data } = await q;
  // return data ?? [];

  if (garageId) return _store.filter((v) => v.garageId === garageId);
  return _store;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
  // return data ?? null;
  return _store.find((v) => v.id === id) ?? null;
}

/**
 * Véhicules mis en avant (homepage).
 * @param garageId  Optionnel — filtre par garage.
 */
export async function getFeaturedVehicles(limit = 3, garageId?: string): Promise<Vehicle[]> {
  // Future Supabase:
  // let q = supabase.from("vehicles").select("*").eq("featured", true).order("featured_order").limit(limit);
  // if (garageId) q = q.eq("garage_id", garageId);
  // const { data } = await q;
  // return data ?? [];
  const base = garageId ? _store.filter((v) => v.garageId === garageId) : _store;
  return base.filter((v) => v.featured).slice(0, limit);
}

export async function getRelatedVehicles(excludeId: string, limit = 3, garageId?: string): Promise<Vehicle[]> {
  // Future Supabase:
  // let q = supabase.from("vehicles").select("*").neq("id", excludeId).limit(limit);
  // if (garageId) q = q.eq("garage_id", garageId);
  // const { data } = await q;
  // return data ?? [];
  const base = garageId ? _store.filter((v) => v.garageId === garageId) : _store;
  return base.filter((v) => v.id !== excludeId).slice(0, limit);
}

export async function getVehicleStaticParams(): Promise<{ id: string }[]> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("id");
  // return data?.map((v) => ({ id: v.id })) ?? [];
  return _store.map((v) => ({ id: v.id }));
}

/* ──────────────────────────────────────────
   CREATE
────────────────────────────────────────── */

export async function createVehicle(input: VehicleCreateInput): Promise<Vehicle> {
  // Future Supabase:
  // const { data, error } = await supabase
  //   .from("vehicles")
  //   .insert({ ...input, created_at: now(), updated_at: now() })
  //   .select()
  //   .single();
  // if (error) throw error;
  // return data;

  const vehicle: Vehicle = {
    ...input,
    id: Date.now().toString(),
    createdAt: now(),
    updatedAt: now(),
  };
  _store = [..._store, vehicle];
  return vehicle;
}

/* ──────────────────────────────────────────
   UPDATE
────────────────────────────────────────── */

export async function updateVehicle(id: string, input: VehicleUpdateInput): Promise<Vehicle> {
  // Future Supabase:
  // const { data, error } = await supabase
  //   .from("vehicles")
  //   .update({ ...input, updated_at: now() })
  //   .eq("id", id)
  //   .select()
  //   .single();
  // if (error) throw error;
  // return data;

  const idx = _store.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error(`Vehicle #${id} not found`);

  const updated: Vehicle = { ..._store[idx], ...input, updatedAt: now() };
  _store = _store.map((v) => (v.id === id ? updated : v));
  return updated;
}

/* ──────────────────────────────────────────
   DELETE
────────────────────────────────────────── */

export async function deleteVehicle(id: string): Promise<void> {
  // Future Supabase:
  // const { error } = await supabase.from("vehicles").delete().eq("id", id);
  // if (error) throw error;

  _store = _store.filter((v) => v.id !== id);
}
