/**
 * Mapping centralisé Vehicle — DB row ↔ domaine TypeScript.
 *
 * Règle : aucun mapping inline dans les composants ou actions.
 * Tout passe par vehicleFromDb() et vehicleToDb().
 */

import type { Vehicle, VehicleFeatures, VehicleOptions, VehicleImage } from "@/types";
import type { VehicleRow, VehicleInsert, VehicleUpdate } from "@/lib/supabase/database.types";
import type { VehicleCreateInput, VehicleUpdateInput } from "@/lib/validation/vehicle.schema";

// ─────────────────────────────────────────────────────────────────
//  DB → Domaine
//
//  La ligne peut inclure vehicle_images[] via LEFT JOIN PostgREST :
//    .select("*, vehicle_images(id, url, alt, sort_order, is_primary)")
//  Si présentes, elles priment sur vehicles.images[] (legacy).
// ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VehicleRowWithImages = VehicleRow & { vehicle_images?: any[] };

function mapVehicleImages(raw: unknown[]): VehicleImage[] {
  return (raw as VehicleImage[])
    .map((img) => ({
      id:         img.id,
      vehicle_id: img.vehicle_id ?? "",
      garage_id:  img.garage_id ?? "",
      url:        img.url,
      alt:        img.alt ?? undefined,
      sort_order: img.sort_order ?? 0,
      is_primary: img.is_primary ?? false,
      created_at: img.created_at ?? undefined,
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function vehicleFromDb(row: VehicleRowWithImages): Vehicle {
  const joinedImages =
    Array.isArray(row.vehicle_images) && row.vehicle_images.length > 0
      ? mapVehicleImages(row.vehicle_images)
      : undefined;

  // Si vehicle_images jointes, elles deviennent la source canonique des URLs
  const images       = joinedImages ? joinedImages.map((i) => i.url) : (row.images ?? []);
  const primaryImage = joinedImages?.find((i) => i.is_primary) ?? joinedImages?.[0];
  const thumbnailUrl = primaryImage?.url ?? row.thumbnail_url ?? undefined;

  return {
    id:               row.id,
    garageId:         row.garage_id,
    brand:            row.brand,
    model:            row.model,
    year:             row.year,
    mileage:          row.mileage,
    fuel:             row.fuel,
    transmission:     row.transmission,
    power:            row.power ?? 0,
    price:            row.price,
    color:            row.color,
    doors:            row.doors ?? 5,
    critAir:          row.crit_air ?? undefined,
    description:      row.description ?? "",
    images,
    thumbnailUrl,
    vehicleImages:    joinedImages,
    status:           row.status,
    published_at:     row.published_at ?? undefined,
    sold_at:          row.sold_at ?? undefined,
    featured:         row.featured,
    featuredOrder:    row.featured_order ?? undefined,
    categories:       row.categories ?? [],
    features:         (row.features as VehicleFeatures) ?? {},
    options:          (row.options as VehicleOptions) ?? {},
    slug:             row.slug ?? undefined,
    meta_description: row.meta_description ?? undefined,
    export_leboncoin: row.export_leboncoin,
    external_id:      row.external_id ?? undefined,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Domaine → Insert DB
// ─────────────────────────────────────────────────────────────────

export function vehicleToInsert(input: VehicleCreateInput): VehicleInsert {
  return {
    garage_id:        input.garage_id,
    brand:            input.brand,
    model:            input.model,
    year:             input.year,
    mileage:          input.mileage,
    fuel:             input.fuel,
    transmission:     input.transmission,
    power:            input.power ?? null,
    price:            input.price,
    color:            input.color,
    doors:            input.doors ?? null,
    crit_air:         input.crit_air ?? null,
    description:      input.description ?? null,
    images:           input.images ?? [],
    thumbnail_url:    input.thumbnail_url ?? null,
    status:           input.status ?? "draft",
    published_at:     input.published_at ?? null,
    sold_at:          input.sold_at ?? null,
    featured:         input.featured ?? false,
    featured_order:   input.featured_order ?? null,
    categories:       input.categories ?? [],
    features:         (input.features as VehicleFeatures) ?? {},
    options:          input.options ?? {},
    slug:             input.slug ?? null,
    meta_description: input.meta_description ?? null,
    export_leboncoin: input.export_leboncoin ?? false,
    external_id:      input.external_id ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Domaine → Update DB (champs partiel)
// ─────────────────────────────────────────────────────────────────

export function vehicleToUpdate(input: VehicleUpdateInput): VehicleUpdate {
  const update: VehicleUpdate = {};

  if (input.brand           !== undefined) update.brand            = input.brand;
  if (input.model           !== undefined) update.model            = input.model;
  if (input.year            !== undefined) update.year             = input.year;
  if (input.mileage         !== undefined) update.mileage          = input.mileage;
  if (input.fuel            !== undefined) update.fuel             = input.fuel;
  if (input.transmission    !== undefined) update.transmission     = input.transmission;
  if (input.power           !== undefined) update.power            = input.power ?? null;
  if (input.price           !== undefined) update.price            = input.price;
  if (input.color           !== undefined) update.color            = input.color;
  if (input.doors           !== undefined) update.doors            = input.doors ?? null;
  if (input.crit_air        !== undefined) update.crit_air         = input.crit_air ?? null;
  if (input.description     !== undefined) update.description      = input.description ?? null;
  if (input.images          !== undefined) update.images           = input.images ?? [];
  if (input.thumbnail_url   !== undefined) update.thumbnail_url    = input.thumbnail_url ?? null;
  if (input.status          !== undefined) update.status           = input.status;
  if (input.published_at    !== undefined) update.published_at     = input.published_at ?? null;
  if (input.sold_at         !== undefined) update.sold_at          = input.sold_at ?? null;
  if (input.featured        !== undefined) update.featured         = input.featured;
  if (input.featured_order  !== undefined) update.featured_order   = input.featured_order ?? null;
  if (input.categories      !== undefined) update.categories       = input.categories ?? [];
  if (input.features        !== undefined) update.features         = input.features as VehicleFeatures;
  if (input.options         !== undefined) update.options          = input.options ?? {};
  if (input.slug            !== undefined) update.slug             = input.slug ?? null;
  if (input.meta_description !== undefined) update.meta_description = input.meta_description ?? null;
  if (input.export_leboncoin !== undefined) update.export_leboncoin = input.export_leboncoin;
  if (input.external_id     !== undefined) update.external_id      = input.external_id ?? null;

  return update;
}
