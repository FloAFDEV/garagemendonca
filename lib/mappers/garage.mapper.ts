import type { Garage, GarageOpeningHours } from "@/types";
import type { GarageRow, GarageInsert, GarageUpdate } from "@/lib/supabase/database.types";
import type { GarageCreateInput, GarageUpdateInput } from "@/lib/validation/garage.schema";

// ─────────────────────────────────────────────────────────────────
//  DB → Domaine
// ─────────────────────────────────────────────────────────────────

export function garageFromDb(row: GarageRow): Garage {
  return {
    id:             row.id,
    name:           row.name,
    slug:           row.slug,
    address:        row.address ?? undefined,
    city:           row.city ?? undefined,
    postal_code:    row.postal_code ?? undefined,
    phone:          row.phone ?? undefined,
    email:          row.email ?? undefined,
    logo_url:       row.logo_url ?? undefined,
    description:    row.description ?? undefined,
    is_active:      row.is_active,
    plan:           row.plan,
    lat:            row.lat ?? undefined,
    lng:            row.lng ?? undefined,
    google_maps_url: row.google_maps_url ?? undefined,
    opening_hours:  (row.opening_hours as GarageOpeningHours) ?? undefined,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Domaine → Insert DB
// ─────────────────────────────────────────────────────────────────

export function garageToInsert(input: GarageCreateInput): GarageInsert {
  return {
    name:           input.name,
    slug:           input.slug,
    address:        input.address ?? null,
    city:           input.city ?? null,
    postal_code:    input.postal_code ?? null,
    phone:          input.phone ?? null,
    email:          input.email ?? null,
    logo_url:       input.logo_url ?? null,
    description:    input.description ?? null,
    is_active:      input.is_active ?? true,
    plan:           input.plan ?? "isolated",
    lat:            input.lat ?? null,
    lng:            input.lng ?? null,
    google_maps_url: input.google_maps_url ?? null,
    opening_hours:  input.opening_hours ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Domaine → Update DB
// ─────────────────────────────────────────────────────────────────

export function garageToUpdate(input: GarageUpdateInput): GarageUpdate {
  const update: GarageUpdate = {};

  if (input.name            !== undefined) update.name            = input.name;
  if (input.slug            !== undefined) update.slug            = input.slug;
  if (input.address         !== undefined) update.address         = input.address ?? null;
  if (input.city            !== undefined) update.city            = input.city ?? null;
  if (input.postal_code     !== undefined) update.postal_code     = input.postal_code ?? null;
  if (input.phone           !== undefined) update.phone           = input.phone ?? null;
  if (input.email           !== undefined) update.email           = input.email ?? null;
  if (input.logo_url        !== undefined) update.logo_url        = input.logo_url ?? null;
  if (input.description     !== undefined) update.description     = input.description ?? null;
  if (input.is_active       !== undefined) update.is_active       = input.is_active;
  if (input.plan            !== undefined) update.plan            = input.plan;
  if (input.lat             !== undefined) update.lat             = input.lat ?? null;
  if (input.lng             !== undefined) update.lng             = input.lng ?? null;
  if (input.google_maps_url !== undefined) update.google_maps_url = input.google_maps_url ?? null;
  if (input.opening_hours   !== undefined) update.opening_hours   = input.opening_hours ?? null;

  return update;
}
