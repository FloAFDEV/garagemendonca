/**
 * Data access layer — Supabase-ready.
 *
 * To connect Supabase, replace the mock implementations below with:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("vehicles").select("*")...
 *
 * The page code (vehicules/[id]/page.tsx) calls ONLY these functions
 * and never imports from lib/data.ts directly — zero refactor needed.
 */

import type { Vehicle } from "@/types";
import { vehicles as mockVehicles } from "./data";

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
  // return data ?? null;
  return mockVehicles.find((v) => v.id === id) ?? null;
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
  // return data ?? [];
  return mockVehicles;
}

export async function getFeaturedVehicles(limit = 3): Promise<Vehicle[]> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("*").eq("featured", true).limit(limit);
  // return data ?? [];
  return mockVehicles.filter((v) => v.featured).slice(0, limit);
}

export async function getRelatedVehicles(excludeId: string, limit = 3): Promise<Vehicle[]> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("*").neq("id", excludeId).limit(limit);
  // return data ?? [];
  return mockVehicles.filter((v) => v.id !== excludeId).slice(0, limit);
}

export async function getVehicleStaticParams(): Promise<{ id: string }[]> {
  // Future Supabase:
  // const { data } = await supabase.from("vehicles").select("id");
  // return data?.map((v) => ({ id: v.id })) ?? [];
  return mockVehicles.map((v) => ({ id: v.id }));
}
