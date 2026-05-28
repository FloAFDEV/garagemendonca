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
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";

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
