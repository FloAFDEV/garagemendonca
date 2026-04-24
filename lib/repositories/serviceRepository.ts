/**
 * Service Repository — shadow mode Phase 2A.
 *
 * Lectures : Supabase en priorité (si configuré), fallback in-memory.
 * Écritures : toujours in-memory — aucun write Supabase en Phase 2A.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * Voir lib/supabase/schema.sql → tables services + service_images
 * Mapping dans lib/supabase/mappers.ts → mapService()
 * --------------------------------------------------------------------------
 */

import type { Service } from "@/types";
import { services as seedServices } from "@/lib/data";
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapService } from "@/lib/supabase/mappers";

const USE_SUPABASE_READ_ONLY = SUPABASE_ENABLED;

/**
 * Transforme une ligne Supabase (snake_case) en type Service.
 * @deprecated Utiliser mapService() depuis lib/supabase/mappers.ts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapServiceFromDB(row: any, images: any[] = []): Service {
  return mapService({ ...row, service_images: images });
}

/** In-memory store — initialisé depuis lib/data.ts */
let _store: Service[] = seedServices.map((s) => ({ ...s }));

// ─── Lectures Supabase privées ───────────────────────────────────────────────

async function getAllSupabase(garageId: string): Promise<Service[]> {
  const db = getReadClient();
  const { data, error } = await db
    .from("services")
    .select("*, service_images(*)")
    .eq("garage_id", garageId)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapService);
}

async function getBySlugSupabase(slug: string, garageId: string): Promise<Service | null> {
  const db = getReadClient();
  const { data, error } = await db
    .from("services")
    .select("*, service_images(*)")
    .eq("slug", slug)
    .eq("garage_id", garageId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapService(data) : null;
}

// ─── Repository public ───────────────────────────────────────────────────────

export const serviceRepository = {
  /** Tous les services. */
  getAll: async (): Promise<Service[]> => {
    if (USE_SUPABASE_READ_ONLY) {
      const garageId = process.env.NEXT_PUBLIC_GARAGE_ID;
      if (garageId) {
        try {
          const data = await getAllSupabase(garageId);
          console.log(`[shadow] USING SUPABASE (READ ONLY) — services.getAll (${data.length})`);
          return data;
        } catch (err) {
          console.warn("[shadow] FALLBACK TO MEMORY STORE — services.getAll:", err);
        }
      }
    }
    return _store;
  },

  /** Service par slug. */
  getBySlug: async (slug: string): Promise<Service | null> => {
    if (USE_SUPABASE_READ_ONLY) {
      const garageId = process.env.NEXT_PUBLIC_GARAGE_ID;
      if (garageId) {
        try {
          const data = await getBySlugSupabase(slug, garageId);
          console.log(`[shadow] USING SUPABASE (READ ONLY) — services.getBySlug(${slug})`);
          return data;
        } catch (err) {
          console.warn("[shadow] FALLBACK TO MEMORY STORE — services.getBySlug:", err);
        }
      }
    }
    return _store.find((s) => s.slug === slug) ?? null;
  },

  /** Services d'un garage triés par order. */
  getByGarageId: async (garageId: string): Promise<Service[]> => {
    if (USE_SUPABASE_READ_ONLY) {
      try {
        const data = await getAllSupabase(garageId);
        console.log(`[shadow] USING SUPABASE (READ ONLY) — services.getByGarageId (${data.length})`);
        return data;
      } catch (err) {
        console.warn("[shadow] FALLBACK TO MEMORY STORE — services.getByGarageId:", err);
      }
    }
    return [..._store].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  },

  /** Mise à jour partielle — toujours in-memory en Phase 2A. */
  update: async (slug: string, data: Partial<Service>): Promise<Service> => {
    const idx = _store.findIndex((s) => s.slug === slug);
    if (idx === -1) throw new Error(`Service "${slug}" not found`);
    const updated: Service = { ..._store[idx], ...data };
    _store = _store.map((s, i) => (i === idx ? updated : s));
    return updated;
  },
};
