/**
 * Service Repository — source de vérité unique.
 *
 * DEMO_MODE=true  → données statiques (lib/data.ts).
 * SUPABASE_ENABLED → Supabase exclusif, aucun fallback silencieux.
 *
 * Migration 007 : lecture prioritaire depuis les tables relationnelles
 * (service_steps, service_pricing, service_faq, testimonials.service_id).
 * Fallback automatique sur les colonnes JSONB si les tables sont vides.
 */

import type { Service } from "@/types";
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapService } from "@/lib/supabase/mappers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapServiceFromDB(row: any, images: any[] = []): Service {
  return mapService({ ...row, service_images: images });
}

// ─── Sélecteur commun (tables relationnelles migration 007) ─────────────────

const SERVICE_SELECT = `
  *,
  service_images(*),
  service_steps(sort_order, title, description),
  service_pricing(sort_order, label, price, note),
  service_faq(sort_order, question, answer)
` as const;

// ─── Fetch groupé des témoignages par service (évite N+1) ────────────────────

async function fetchServiceTestimonials(
  serviceIds: string[],
): Promise<Record<string, any[]>> {
  if (!serviceIds.length) return {};
  const { data } = await getReadClient()
    .from("testimonials")
    .select("service_id, author, location, date_label, rating, comment, sort_order")
    .in("service_id", serviceIds)
    .eq("is_active", true)
    .order("sort_order");
  const map: Record<string, any[]> = {};
  for (const t of data ?? []) {
    (map[t.service_id] ??= []).push(t);
  }
  return map;
}

// ─── Lectures Supabase ───────────────────────────────────────────────────────

async function getAllSupabase(garageId: string, activeOnly = true): Promise<Service[]> {
  let query = getReadClient()
    .from("services")
    .select(SERVICE_SELECT)
    .eq("garage_id", garageId);
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query.order("sort_order");
  if (error) throw error;

  const rows = data ?? [];
  const testimonialsMap = await fetchServiceTestimonials(rows.map((r) => r.id));

  return rows.map((row) =>
    mapService({ ...row, _testimonials: testimonialsMap[row.id] ?? [] }),
  );
}

async function getBySlugSupabase(slug: string, garageId: string): Promise<Service | null> {
  const { data, error } = await getReadClient()
    .from("services")
    .select(SERVICE_SELECT)
    .eq("slug", slug)
    .eq("garage_id", garageId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const testimonialsMap = await fetchServiceTestimonials([data.id]);
  return mapService({ ...data, _testimonials: testimonialsMap[data.id] ?? [] });
}

// ─── Repository public ───────────────────────────────────────────────────────

const GARAGE_ID = () => process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export const serviceRepository = {
  getAll: async (): Promise<Service[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(GARAGE_ID());
    return [];
  },

  getAllForAdmin: async (): Promise<Service[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(GARAGE_ID(), false);
    return [];
  },

  getBySlug: async (slug: string): Promise<Service | null> => {
    if (SUPABASE_ENABLED) return getBySlugSupabase(slug, GARAGE_ID());
    return null;
  },

  getByGarageId: async (garageId: string): Promise<Service[]> => {
    if (SUPABASE_ENABLED) return getAllSupabase(garageId);
    return [];
  },
};
