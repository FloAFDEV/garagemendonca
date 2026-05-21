/**
 * Repository véhicule — couche DB unique, typée via mappers.
 *
 * Les clients Supabase sont utilisés sans le générique Database (contraintes
 * de type postgrest-js v12 incompatibles avec les types manuels).
 * Sécurité de type : mappers + Zod schemas, pas le query builder.
 *
 * Lectures publiques : client anon (RLS published/sold/scheduled).
 * Écritures admin    : client service-role (auth vérifiée en amont).
 */

import type { VehicleRow, VehicleInsert, VehicleUpdate } from "@/lib/supabase/database.types";
import { vehicleFromDb } from "@/lib/mappers/vehicle.mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getReadClient } from "@/lib/supabase/readClient";
import type { Vehicle } from "@/types";
import { VEHICLES_PER_PAGE, pageOffset } from "@/lib/vehicles/pagination";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

const anonDb = (): Q => getReadClient();

function adminDb(): Q {
  return createSupabaseAdminClient();
}

// Sélecteur commun : inclut vehicle_images avec storage_path pour signed URLs
const SEL_WITH_IMAGES = "*, vehicle_images(id, url, storage_path, alt, sort_order, is_primary)";

// ─── Filtres pour list() ──────────────────────────────────────────

export type VehicleSortBy = "created_at" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";

export interface VehicleListFilters {
  status?:       VehicleRow["status"];
  brand?:        string;        // filtre interne (single brand, ilike)
  brands?:       string[];      // multi-sélection catalogue public
  search?:       string;        // recherche texte sur brand + model
  fuel?:         VehicleRow["fuel"];
  transmission?: VehicleRow["transmission"];
  minPrice?:     number;
  maxPrice?:     number;
  minYear?:      number;
  maxYear?:      number;
  maxMileage?:   number;
  category?:     string;
  featured?:     boolean;
  sortBy?:       VehicleSortBy; // tri catalogue public
  limit?:        number;
  offset?:       number;
}

/** Supprime les diacritiques et met en minuscule pour l'ILIKE. */
function normalizeSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Applique les filtres publics communs (brands, search, fuel, transmission, km, price, year). */
function applyPublicFilters(q: Q, filters: Omit<VehicleListFilters, "limit" | "offset">): Q {
  if (filters.brands?.length) {
    q = q.in("brand", filters.brands);
  } else if (filters.brand) {
    q = q.ilike("brand", `%${filters.brand}%`);
  }

  if (filters.fuel)         q = q.eq("fuel", filters.fuel);
  if (filters.transmission) q = q.eq("transmission", filters.transmission);
  if (filters.minPrice)     q = q.gte("price", filters.minPrice);
  if (filters.maxPrice)     q = q.lte("price", filters.maxPrice);
  if (filters.minYear)      q = q.gte("year", filters.minYear);
  if (filters.maxYear)      q = q.lte("year", filters.maxYear);
  if (filters.maxMileage)   q = q.lte("mileage", filters.maxMileage);

  if (filters.search) {
    const tokens = normalizeSearch(filters.search)
      .split(/\s+/)
      .filter((t) => t.length >= 1)
      .map((t) => t.replace(/[%_\\]/g, "\\$&")); // escape LIKE wildcards

    for (const token of tokens) {
      q = q.or(`brand.ilike.%${token}%,model.ilike.%${token}%`);
    }
  }

  return q;
}

/** Tri par défaut : featured DESC → created_at DESC */
function applyDefaultSort(q: Q): Q {
  return q
    .order("featured",   { ascending: false })
    .order("created_at", { ascending: false });
}

/** Applique la clause ORDER BY selon le tri demandé (catalogue public). */
function applySort(q: Q, sortBy: VehicleSortBy | undefined): Q {
  switch (sortBy) {
    case "price_asc":   return q.order("price",    { ascending: true });
    case "price_desc":  return q.order("price",    { ascending: false });
    case "mileage_asc": return q.order("mileage",  { ascending: true });
    case "year_desc":   return q.order("year",     { ascending: false });
    default:            return applyDefaultSort(q);
  }
}

// ─────────────────────────────────────────────────────────────────
//  Repository
// ─────────────────────────────────────────────────────────────────

export const vehicleDb = {
  async list(garageId: string, filters: VehicleListFilters = {}): Promise<Vehicle[]> {
    let q = anonDb().from("vehicles").select(SEL_WITH_IMAGES).eq("garage_id", garageId);

    if (filters.status)       q = q.eq("status", filters.status);
    if (filters.brand)        q = q.ilike("brand", `%${filters.brand}%`);
    if (filters.fuel)         q = q.eq("fuel", filters.fuel);
    if (filters.transmission) q = q.eq("transmission", filters.transmission);
    if (filters.minPrice)     q = q.gte("price", filters.minPrice);
    if (filters.maxPrice)     q = q.lte("price", filters.maxPrice);
    if (filters.minYear)      q = q.gte("year", filters.minYear);
    if (filters.maxYear)      q = q.lte("year", filters.maxYear);
    if (filters.maxMileage)   q = q.lte("mileage", filters.maxMileage);
    if (filters.featured)     q = q.eq("featured", true);
    if (filters.category)     q = q.contains("categories", [filters.category]);
    if (filters.limit)        q = q.limit(filters.limit);
    if (filters.offset)       q = q.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);

    q = applyDefaultSort(q);

    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as VehicleRow[]).map(vehicleFromDb);
  },

  async getById(id: string): Promise<Vehicle | null> {
    const { data, error } = await anonDb()
      .from("vehicles").select(SEL_WITH_IMAGES).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? vehicleFromDb(data as VehicleRow) : null;
  },

  async getBySlug(garageId: string, slug: string): Promise<Vehicle | null> {
    const { data, error } = await anonDb()
      .from("vehicles").select(SEL_WITH_IMAGES).eq("garage_id", garageId).ilike("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? vehicleFromDb(data as VehicleRow) : null;
  },

  async getFeatured(garageId: string, limit = 6): Promise<Vehicle[]> {
    const { data, error } = await anonDb()
      .from("vehicles").select(SEL_WITH_IMAGES)
      .eq("garage_id", garageId).eq("featured", true)
      .in("status", ["published", "sold"])
      .order("featured_order",  { ascending: true, nullsFirst: false })
      .order("created_at",      { ascending: false })
      .limit(limit);
    if (error) throw error;
    return ((data ?? []) as VehicleRow[]).map(vehicleFromDb);
  },

  async slugExists(garageId: string, slug: string): Promise<boolean> {
    const { count, error } = await anonDb()
      .from("vehicles").select("id", { count: "exact", head: true })
      .eq("garage_id", garageId).ilike("slug", slug);
    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async getByShortId(garageId: string, shortId: string): Promise<Vehicle | null> {
    // Plage UUID native : tous les UUIDs dont les 8 premiers chars hex = shortId.
    // PostgreSQL compare les UUID comme des entiers 128-bit, donc gte/lte sur
    // {shortId}-0000... / {shortId}-ffff... capture exactement le bon véhicule.
    // Plus fiable que `id::text like 'prefix%'` (cast non supporté par le client JS).
    const minId = `${shortId}-0000-0000-0000-000000000000`;
    const maxId = `${shortId}-ffff-ffff-ffff-ffffffffffff`;
    const { data, error } = await anonDb()
      .from("vehicles")
      .select(SEL_WITH_IMAGES)
      .eq("garage_id", garageId)
      .gte("id", minId)
      .lte("id", maxId)
      .maybeSingle();
    if (error) throw error;
    return data ? vehicleFromDb(data as VehicleRow) : null;
  },

  async getRelated(vehicleId: string, garageId: string, limit = 3): Promise<Vehicle[]> {
    const current = await vehicleDb.getById(vehicleId);
    if (!current) return [];
    let q = anonDb()
      .from("vehicles").select(SEL_WITH_IMAGES)
      .eq("garage_id", garageId)
      .neq("id", vehicleId)
      .in("status", ["published", "scheduled", "sold"])
      .or(`fuel.eq.${current.fuel},brand.ilike.${current.brand}`)
      .limit(limit);
    q = applyDefaultSort(q);
    const { data, error } = await q;
    if (error) return [];
    return ((data ?? []) as VehicleRow[]).map(vehicleFromDb);
  },

  /** Marques distinctes ayant des véhicules publics (published / scheduled / sold), triées. */
  async listBrands(garageId: string): Promise<string[]> {
    const { data, error } = await anonDb()
      .from("vehicles")
      .select("brand")
      .eq("garage_id", garageId)
      .in("status", ["published", "scheduled", "sold"]);
    if (error) return [];
    const brands = [...new Set((data ?? []).map((r: { brand: string }) => r.brand))]
      .filter((b): b is string => typeof b === "string" && b.length > 0)
      .sort((a, b) => a.localeCompare(b, "fr"));
    return brands;
  },

  async listSlugs(garageId: string): Promise<{ slug: string; id: string; updated_at: string | null }[]> {
    const { data, error } = await anonDb()
      .from("vehicles")
      .select("id, slug, updated_at")
      .eq("garage_id", garageId)
      .not("slug", "is", null)
      .in("status", ["published", "scheduled", "sold"]);
    if (error) return [];
    return ((data ?? []) as { slug: string | null; id: string; updated_at: string | null }[])
      .filter((r): r is { slug: string; id: string; updated_at: string | null } => r.slug !== null);
  },

  async listAdmin(garageId: string): Promise<Vehicle[]> {
    let q = adminDb()
      .from("vehicles").select(SEL_WITH_IMAGES).eq("garage_id", garageId);
    q = applyDefaultSort(q);
    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as VehicleRow[]).map(vehicleFromDb);
  },

  async create(row: VehicleInsert): Promise<Vehicle> {
    const { data, error } = await adminDb()
      .from("vehicles").insert(row).select().single();
    if (error) throw error;
    return vehicleFromDb(data as VehicleRow);
  },

  async update(id: string, row: VehicleUpdate): Promise<Vehicle> {
    const { data, error } = await adminDb()
      .from("vehicles").update(row).eq("id", id).select().single();
    if (error) throw error;
    return vehicleFromDb(data as VehicleRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await adminDb().from("vehicles").delete().eq("id", id);
    if (error) throw error;
  },

  /** Compte les véhicules publics (published + scheduled + sold), avec filtres optionnels */
  async countPublic(garageId: string, filters: Omit<VehicleListFilters, "limit" | "offset"> = {}): Promise<number> {
    let q = anonDb()
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("garage_id", garageId)
      .in("status", ["published", "scheduled", "sold"]);

    q = applyPublicFilters(q, filters);

    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  },

  /** Liste paginée pour les pages /vehicules et /vehicules/page/[page], avec filtres optionnels */
  async listPaginated(
    garageId: string,
    page: number,
    perPage = VEHICLES_PER_PAGE,
    filters: Omit<VehicleListFilters, "limit" | "offset"> = {},
  ): Promise<Vehicle[]> {
    const offset = pageOffset(page, perPage);
    let q = anonDb()
      .from("vehicles")
      .select(SEL_WITH_IMAGES)
      .eq("garage_id", garageId)
      .in("status", ["published", "scheduled", "sold"]);

    q = applyPublicFilters(q, filters);
    q = applySort(q, filters.sortBy);
    q = q.range(offset, offset + perPage - 1);

    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as VehicleRow[]).map(vehicleFromDb);
  },
};
