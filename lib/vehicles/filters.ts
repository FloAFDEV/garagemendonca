/**
 * Helpers partagés pour le parsing des filtres URL → VehicleListFilters.
 * Utilisé par /vehicules et /vehicules/page/[page].
 */
import type { VehicleListFilters } from "@/lib/db/vehicle.repository";

export type PageSearchParams = Record<string, string | string[] | undefined>;

function str(sp: PageSearchParams, key: string): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function num(sp: PageSearchParams, key: string): number | undefined {
  const v = str(sp, key);
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}

export function parsePageFilters(
  sp: PageSearchParams,
): Omit<VehicleListFilters, "limit" | "offset"> {
  const brandsStr = str(sp, "brands");
  const brands = brandsStr
    ? brandsStr.split(",").map((b) => b.trim()).filter(Boolean)
    : undefined;

  return {
    brands:       brands?.length ? brands : undefined,
    search:       str(sp, "q"),
    fuel:         str(sp, "fuel") as VehicleListFilters["fuel"],
    transmission: str(sp, "transmission") as VehicleListFilters["transmission"],
    maxMileage:   num(sp, "maxKm"),
    maxPrice:     num(sp, "maxPrice"),
  };
}

/** Sérialise les filtres actifs en query string pour les liens de pagination. */
export function filtersToQs(sp: PageSearchParams): string {
  const keys = ["brands", "q", "fuel", "transmission", "maxKm", "maxPrice"];
  const params = new URLSearchParams();
  for (const k of keys) {
    const v = sp[k];
    if (typeof v === "string" && v.trim()) params.set(k, v.trim());
  }
  return params.toString();
}
