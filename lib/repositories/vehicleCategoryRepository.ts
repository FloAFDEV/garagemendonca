/**
 * VehicleCategory Repository — shadow mode Phase 2A.
 *
 * Lectures : Supabase en priorité (si configuré), fallback in-memory.
 * Écritures : toujours in-memory — aucun write Supabase en Phase 2A.
 *
 * Règle absolue : aucune catégorie n'est hardcodée ici.
 * Le _store est initialisé vide — les catégories sont créées depuis le dashboard.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * Voir lib/supabase/schema.sql → table vehicle_categories
 * Mapping dans lib/supabase/mappers.ts → mapVehicleCategory()
 * --------------------------------------------------------------------------
 */

import type { VehicleCategory } from "@/types";
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapVehicleCategory } from "@/lib/supabase/mappers";

export type VehicleCategoryCreateInput = Pick<
  VehicleCategory,
  "slug" | "label" | "icon" | "color" | "description" | "sort_order"
>;

export type VehicleCategoryUpdateInput = Partial<
  VehicleCategoryCreateInput & { is_active: boolean }
>;

const USE_SUPABASE_READ_ONLY = SUPABASE_ENABLED;

let _store: VehicleCategory[] = [];

function now(): string {
  return new Date().toISOString();
}

// ─── Lectures Supabase privées ───────────────────────────────────────────────

async function getAllSupabase(garageId: string): Promise<VehicleCategory[]> {
  const db = getReadClient();
  const { data, error } = await db
    .from("vehicle_categories")
    .select("*")
    .eq("garage_id", garageId)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapVehicleCategory);
}

async function getBySlugSupabase(
  garageId: string,
  slug: string,
): Promise<VehicleCategory | null> {
  const db = getReadClient();
  const { data, error } = await db
    .from("vehicle_categories")
    .select("*")
    .eq("garage_id", garageId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapVehicleCategory(data) : null;
}

// ─── Repository public ───────────────────────────────────────────────────────

export const vehicleCategoryRepository = {
  /** Catégories actives d'un garage — usage public/filtres. */
  getAll: async (garageId: string): Promise<VehicleCategory[]> => {
    if (USE_SUPABASE_READ_ONLY) {
      try {
        const data = await getAllSupabase(garageId);
        console.log(`[shadow] USING SUPABASE (READ ONLY) — categories.getAll (${data.length})`);
        return data;
      } catch (err) {
        console.warn("[shadow] FALLBACK TO MEMORY STORE — categories.getAll:", err);
      }
    }
    return _store
      .filter((c) => c.garage_id === garageId && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  /** Toutes les catégories (actives + inactives) — usage admin dashboard. */
  getAllAdmin: async (garageId: string): Promise<VehicleCategory[]> => {
    // Admin toujours in-memory en Phase 2A
    return _store
      .filter((c) => c.garage_id === garageId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  /** Catégorie par slug. */
  getBySlug: async (
    garageId: string,
    slug: string,
  ): Promise<VehicleCategory | null> => {
    if (USE_SUPABASE_READ_ONLY) {
      try {
        const data = await getBySlugSupabase(garageId, slug);
        console.log(`[shadow] USING SUPABASE (READ ONLY) — categories.getBySlug(${slug})`);
        return data;
      } catch (err) {
        console.warn("[shadow] FALLBACK TO MEMORY STORE — categories.getBySlug:", err);
      }
    }
    return (
      _store.find((c) => c.garage_id === garageId && c.slug === slug) ?? null
    );
  },

  // ── Écritures — toujours in-memory en Phase 2A ──

  create: async (
    garageId: string,
    input: VehicleCategoryCreateInput,
  ): Promise<VehicleCategory> => {
    const category: VehicleCategory = {
      id: crypto.randomUUID(),
      garage_id: garageId,
      is_active: true,
      created_at: now(),
      updated_at: now(),
      ...input,
    };
    _store = [..._store, category];
    return category;
  },

  update: async (
    id: string,
    input: VehicleCategoryUpdateInput,
  ): Promise<VehicleCategory> => {
    const idx = _store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`VehicleCategory ${id} not found`);
    _store[idx] = { ..._store[idx], ...input, updated_at: now() };
    return _store[idx];
  },

  delete: async (id: string): Promise<void> => {
    _store = _store.filter((c) => c.id !== id);
  },
};
