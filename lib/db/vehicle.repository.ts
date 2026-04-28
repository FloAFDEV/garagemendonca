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

import { createBrowserClient } from "@supabase/ssr";
import type { VehicleRow, VehicleInsert, VehicleUpdate } from "@/lib/supabase/database.types";
import { vehicleFromDb } from "@/lib/mappers/vehicle.mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Vehicle } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

function anonDb(): Q {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function adminDb(): Q {
  return createSupabaseAdminClient();
}

// Sélecteur commun : inclut toujours vehicle_images pour alt/order/is_primary
const SEL_WITH_IMAGES = "*, vehicle_images(id, url, alt, sort_order, is_primary)";

// ─── Filtres pour list() ──────────────────────────────────────────

export interface VehicleListFilters {
  status?:       VehicleRow["status"];
  brand?:        string;
  fuel?:         VehicleRow["fuel"];
  transmission?: VehicleRow["transmission"];
  minPrice?:     number;
  maxPrice?:     number;
  minYear?:      number;
  maxYear?:      number;
  maxMileage?:   number;
  category?:     string;
  featured?:     boolean;
  limit?:        number;
  offset?:       number;
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

    q = q.order("created_at", { ascending: false });

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
      .order("featured_order", { ascending: true, nullsFirst: false })
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

  async getRelated(vehicleId: string, garageId: string, limit = 3): Promise<Vehicle[]> {
    const current = await vehicleDb.getById(vehicleId);
    if (!current) return [];
    const { data, error } = await anonDb()
      .from("vehicles").select(SEL_WITH_IMAGES)
      .eq("garage_id", garageId)
      .neq("id", vehicleId)
      .in("status", ["published", "scheduled", "sold"])
      .or(`fuel.eq.${current.fuel},brand.ilike.${current.brand}`)
      .limit(limit);
    if (error) return [];
    return ((data ?? []) as VehicleRow[]).map(vehicleFromDb);
  },

  async listSlugs(garageId: string): Promise<{ slug: string }[]> {
    const { data, error } = await anonDb()
      .from("vehicles")
      .select("slug")
      .eq("garage_id", garageId)
      .not("slug", "is", null)
      .in("status", ["published", "scheduled", "sold"]);
    if (error) return [];
    return ((data ?? []) as { slug: string | null }[])
      .filter((r): r is { slug: string } => r.slug !== null);
  },

  async listAdmin(garageId: string): Promise<Vehicle[]> {
    const { data, error } = await adminDb()
      .from("vehicles").select(SEL_WITH_IMAGES).eq("garage_id", garageId)
      .order("created_at", { ascending: false });
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
};
