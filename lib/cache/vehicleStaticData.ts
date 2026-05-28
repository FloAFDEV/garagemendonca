/**
 * Cache centralisé pour les données quasi-statiques du catalogue véhicule.
 *
 * Problème résolu : chaque page de pagination (page 1, page 2, page 3…) appelait
 * indépendamment listBrands() et vehicleCategoryRepository.getAll() — données qui
 * changent rarement (< 1×/jour). En centralisant ici avec unstable_cache, toutes
 * les pages de listing partagent le même résultat pendant 5 minutes.
 *
 * TTL 300 s : suffisant pour l'UX, cohérent avec s-maxage CDN de /vehicules/*.
 */

import { unstable_cache } from "next/cache";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import type { VehicleListFilters } from "@/lib/db/vehicle.repository";
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import { VEHICLES_PER_PAGE } from "@/lib/vehicles/pagination";

/** Marques disponibles dans le catalogue public — TTL 5 min. */
export const listBrandsCached = unstable_cache(
  (garageId: string) => vehicleDb.listBrands(garageId),
  ["vehicle-brands"],
  { revalidate: 300 },
);

/** Toutes les catégories du garage — TTL 5 min. */
export const listCategoriesCached = unstable_cache(
  (garageId: string) => vehicleCategoryRepository.getAll(garageId),
  ["vehicle-categories"],
  { revalidate: 300 },
);

/** IDs des catégories ayant au moins un véhicule public — TTL 5 min. */
export const listActiveCategoryIdsCached = unstable_cache(
  (garageId: string) => vehicleDb.listActiveCategoryIds(garageId),
  ["vehicle-active-category-ids"],
  { revalidate: 300 },
);

/**
 * Nombre total de véhicules publics (pour la pagination) — TTL 60s.
 *
 * Remplace le React.cache() local dans les pages de listing.
 * React.cache() ne persiste que le temps d'un render (intra-request) ;
 * unstable_cache persiste cross-request → supprime le hit Supabase COUNT
 * sur chaque RSC re-fetch.
 */
export const countPublicCached = unstable_cache(
  (garageId: string, filters: Omit<VehicleListFilters, "limit" | "offset">) =>
    vehicleDb.countPublic(garageId, filters),
  ["vehicle-count-public"],
  { revalidate: 60, tags: ["vehicle-catalogue"] },
);

/**
 * Liste paginée du catalogue public — TTL 60s.
 *
 * Centralise le cache du listPaginated (utilisé par VehicleGridServer).
 * Sans cache, cette query Supabase SELECT+JOIN s'exécutait à chaque
 * RSC re-fetch → ~400ms sur le chemin critique du streaming.
 *
 * Tag "vehicle-catalogue" : invalidé immédiatement par revalidateTag()
 * dans les actions admin (create/update/delete véhicule).
 */
export const listPaginatedCached = unstable_cache(
  (garageId: string, page: number, filters: Omit<VehicleListFilters, "limit" | "offset">) =>
    vehicleDb.listPaginated(garageId, page, VEHICLES_PER_PAGE, filters),
  ["vehicle-list-paginated"],
  { revalidate: 60, tags: ["vehicle-catalogue"] },
);
