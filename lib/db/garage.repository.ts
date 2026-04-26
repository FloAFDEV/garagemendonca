import { createBrowserClient } from "@supabase/ssr";
import type { GarageRow, GarageInsert, GarageUpdate } from "@/lib/supabase/database.types";
import { garageFromDb } from "@/lib/mappers/garage.mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Garage } from "@/types";

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

export const garageDb = {
  // ── Lectures publiques (RLS is_active = true) ─────────────────

  async list(): Promise<Garage[]> {
    const { data, error } = await anonDb()
      .from("garages").select("*").eq("is_active", true).order("name");
    if (error) throw error;
    return ((data ?? []) as GarageRow[]).map(garageFromDb);
  },

  async getById(id: string): Promise<Garage | null> {
    const { data, error } = await anonDb()
      .from("garages").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? garageFromDb(data as GarageRow) : null;
  },

  async getBySlug(slug: string): Promise<Garage | null> {
    const { data, error } = await anonDb()
      .from("garages").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? garageFromDb(data as GarageRow) : null;
  },

  // ── Lectures admin (voit garages inactifs) ────────────────────

  async listAdmin(): Promise<Garage[]> {
    const { data, error } = await adminDb()
      .from("garages").select("*").order("name");
    if (error) throw error;
    return ((data ?? []) as GarageRow[]).map(garageFromDb);
  },

  // ── Écritures ─────────────────────────────────────────────────

  async create(row: GarageInsert): Promise<Garage> {
    const { data, error } = await adminDb()
      .from("garages").insert(row).select().single();
    if (error) throw error;
    return garageFromDb(data as GarageRow);
  },

  async update(id: string, row: GarageUpdate): Promise<Garage> {
    const { data, error } = await adminDb()
      .from("garages").update(row).eq("id", id).select().single();
    if (error) throw error;
    return garageFromDb(data as GarageRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await adminDb().from("garages").delete().eq("id", id);
    if (error) throw error;
  },
};
