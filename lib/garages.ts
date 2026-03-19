/**
 * Service layer — Garages — Supabase-ready.
 *
 * Architecture multi-garages :
 *   - Table "garages" : liste des garages clients.
 *   - Table "garage_users" : utilisateurs liés à un garage + rôle.
 *   - Un véhicule appartient à UN seul garage (via garageId / garage_id).
 *   - Plan "isolated" : le garage voit uniquement ses véhicules.
 *   - Plan "shared"   : le garage voit tous les véhicules (catalogue commun).
 *
 * Migration Supabase :
 *   Remplacer les implémentations mock ci-dessous par :
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = createClient();
 */

import type { Garage } from "@/types";
import { garages as mockGarages } from "./data";

let _store: Garage[] = [...mockGarages];

function now(): string {
  return new Date().toISOString();
}

/* ──────────────────────────────────────────
   READ
────────────────────────────────────────── */

export async function getAllGarages(): Promise<Garage[]> {
  // Future Supabase:
  // const { data } = await supabase.from("garages").select("*").order("name");
  // return data ?? [];
  return _store;
}

export async function getGarageById(id: string): Promise<Garage | null> {
  // Future Supabase:
  // const { data } = await supabase.from("garages").select("*").eq("id", id).single();
  // return data ?? null;
  return _store.find((g) => g.id === id) ?? null;
}

export async function getGarageBySlug(slug: string): Promise<Garage | null> {
  // Future Supabase:
  // const { data } = await supabase.from("garages").select("*").eq("slug", slug).single();
  // return data ?? null;
  return _store.find((g) => g.slug === slug) ?? null;
}

/* ──────────────────────────────────────────
   CREATE
────────────────────────────────────────── */

export async function createGarage(input: Omit<Garage, "id" | "createdAt" | "updatedAt">): Promise<Garage> {
  // Future Supabase:
  // const { data, error } = await supabase
  //   .from("garages")
  //   .insert({ ...input, created_at: now(), updated_at: now() })
  //   .select().single();
  // if (error) throw error;
  // return data;

  const garage: Garage = {
    ...input,
    id: `garage-${Date.now()}`,
    createdAt: now(),
    updatedAt: now(),
  };
  _store = [..._store, garage];
  return garage;
}

/* ──────────────────────────────────────────
   UPDATE
────────────────────────────────────────── */

export async function updateGarage(
  id: string,
  input: Partial<Omit<Garage, "id" | "createdAt" | "updatedAt">>
): Promise<Garage> {
  // Future Supabase:
  // const { data, error } = await supabase
  //   .from("garages")
  //   .update({ ...input, updated_at: now() })
  //   .eq("id", id).select().single();
  // if (error) throw error;
  // return data;

  const idx = _store.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error(`Garage #${id} not found`);

  const updated: Garage = { ..._store[idx], ...input, updatedAt: now() };
  _store = _store.map((g) => (g.id === id ? updated : g));
  return updated;
}

/* ──────────────────────────────────────────
   DELETE
────────────────────────────────────────── */

export async function deleteGarage(id: string): Promise<void> {
  // Future Supabase:
  // const { error } = await supabase.from("garages").delete().eq("id", id);
  // if (error) throw error;

  _store = _store.filter((g) => g.id !== id);
}
