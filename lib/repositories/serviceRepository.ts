/**
 * Service Repository — source de vérité unique.
 *
 * DEMO_MODE=true  → données statiques (lib/data.ts).
 * SUPABASE_ENABLED → Supabase exclusif, aucun fallback silencieux.
 */

import type { Service } from "@/types";
import { services as demoServices } from "@/lib/data";
import { DEMO_MODE, SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapService } from "@/lib/supabase/mappers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapServiceFromDB(row: any, images: any[] = []): Service {
  return mapService({ ...row, service_images: images });
}

// ─── Lectures Supabase ───────────────────────────────────────────────────────

async function getAllSupabase(garageId: string): Promise<Service[]> {
  const { data, error } = await getReadClient()
    .from("services")
    .select("*, service_images(*)")
    .eq("garage_id", garageId)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapService);
}

async function getBySlugSupabase(slug: string, garageId: string): Promise<Service | null> {
  const { data, error } = await getReadClient()
    .from("services")
    .select("*, service_images(*)")
    .eq("slug", slug)
    .eq("garage_id", garageId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapService(data) : null;
}

// ─── Repository public ───────────────────────────────────────────────────────

const GARAGE_ID = () => process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export const serviceRepository = {
  getAll: async (): Promise<Service[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(GARAGE_ID());
    if (DEMO_MODE)        return [...demoServices];
    throw new Error("[serviceRepository] Aucune source de données : configurer Supabase ou NEXT_PUBLIC_DEMO_MODE=true");
  },

  getBySlug: async (slug: string): Promise<Service | null> => {
    if (SUPABASE_ENABLED) return getBySlugSupabase(slug, GARAGE_ID());
    if (DEMO_MODE)        return demoServices.find((s) => s.slug === slug) ?? null;
    throw new Error("[serviceRepository] Aucune source de données");
  },

  getByGarageId: async (garageId: string): Promise<Service[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(garageId);
    if (DEMO_MODE)        return [...demoServices].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    throw new Error("[serviceRepository] Aucune source de données");
  },

  // Écriture — in-memory uniquement (admin Phase 2A)
  update: async (slug: string, data: Partial<Service>): Promise<Service> => {
    const store = [...demoServices];
    const idx = store.findIndex((s) => s.slug === slug);
    if (idx === -1) throw new Error(`Service "${slug}" not found`);
    return { ...store[idx], ...data };
  },
};
