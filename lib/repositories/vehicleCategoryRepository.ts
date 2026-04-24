/**
 * VehicleCategory Repository — implémentation in-memory.
 *
 * Interface stable : les signatures ne changent pas lors du branchement Supabase.
 * Chaque méthode porte un commentaire TODO: Supabase avec la requête exacte.
 *
 * Règle absolue : aucune catégorie n'est hardcodée ici.
 * Le _store est initialisé vide — les catégories sont créées depuis le dashboard.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * Voir lib/supabase/schema.sql → table vehicle_categories
 * --------------------------------------------------------------------------
 */

import type { VehicleCategory } from "@/types";

export type VehicleCategoryCreateInput = Pick<
  VehicleCategory,
  "slug" | "label" | "icon" | "color" | "description" | "sort_order"
>;

export type VehicleCategoryUpdateInput = Partial<
  VehicleCategoryCreateInput & { is_active: boolean }
>;

let _store: VehicleCategory[] = [];

function now(): string {
  return new Date().toISOString();
}

export const vehicleCategoryRepository = {
  /** Catégories actives d'un garage, triées par sort_order — usage public/filtres. */
  getAll: async (garageId: string): Promise<VehicleCategory[]> => {
    // TODO: Supabase →
    // const { data } = await supabase
    //   .from("vehicle_categories")
    //   .select("*")
    //   .eq("garage_id", garageId)
    //   .eq("is_active", true)
    //   .order("sort_order");
    // return data ?? [];
    return _store
      .filter((c) => c.garage_id === garageId && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  /** Toutes les catégories (actives + inactives) — usage admin dashboard. */
  getAllAdmin: async (garageId: string): Promise<VehicleCategory[]> => {
    // TODO: Supabase →
    // const { data } = await supabase
    //   .from("vehicle_categories")
    //   .select("*")
    //   .eq("garage_id", garageId)
    //   .order("sort_order");
    // return data ?? [];
    return _store
      .filter((c) => c.garage_id === garageId)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  /** Catégorie par slug — usage filtre public. */
  getBySlug: async (
    garageId: string,
    slug: string,
  ): Promise<VehicleCategory | null> => {
    // TODO: Supabase →
    // const { data } = await supabase
    //   .from("vehicle_categories")
    //   .select("*")
    //   .eq("garage_id", garageId)
    //   .eq("slug", slug)
    //   .single();
    // return data ?? null;
    return (
      _store.find((c) => c.garage_id === garageId && c.slug === slug) ?? null
    );
  },

  /** Crée une nouvelle catégorie. */
  create: async (
    garageId: string,
    input: VehicleCategoryCreateInput,
  ): Promise<VehicleCategory> => {
    // TODO: Supabase →
    // const { data, error } = await supabase
    //   .from("vehicle_categories")
    //   .insert({ garage_id: garageId, ...input })
    //   .select()
    //   .single();
    // if (error) throw error;
    // return data;
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

  /** Mise à jour partielle. */
  update: async (
    id: string,
    input: VehicleCategoryUpdateInput,
  ): Promise<VehicleCategory> => {
    // TODO: Supabase →
    // const { data, error } = await supabase
    //   .from("vehicle_categories")
    //   .update({ ...input, updated_at: new Date().toISOString() })
    //   .eq("id", id)
    //   .select()
    //   .single();
    // if (error) throw error;
    // return data;
    const idx = _store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`VehicleCategory ${id} not found`);
    _store[idx] = { ..._store[idx], ...input, updated_at: now() };
    return _store[idx];
  },

  /** Supprime une catégorie. Vérifier l'absence de véhicules liés avant d'appeler. */
  delete: async (id: string): Promise<void> => {
    // TODO: Supabase →
    // const { error } = await supabase
    //   .from("vehicle_categories")
    //   .delete()
    //   .eq("id", id);
    // if (error) throw error;
    _store = _store.filter((c) => c.id !== id);
  },
};
