/**
 * lib/db/vehicle.helpers.ts — Helpers partagés pour la résolution d'un véhicule.
 *
 * Centralisé ici pour éviter la duplication entre :
 *   - app/vehicules/[slug]/page.tsx
 *   - app/occasions/[categorySlug]/[vehicleSlug]/page.tsx
 *
 * ⚠️  Usage : Server Components / route handlers uniquement.
 *     Ne pas importer dans des Client Components.
 */

import { vehicleDb } from "@/lib/db/vehicle.repository";
import { extractShortId } from "@/lib/utils/slug";
import type { Vehicle } from "@/types";

/** Regex UUID v4 — utilisée pour distinguer un UUID d'un slug textuel. */
export const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Résout un véhicule depuis un param de slug de route.
 *
 * Stratégie de résolution (priorité décroissante) :
 * 1. shortId extrait du slug (ex: "peugeot-308-2019-abc12345")
 * 2. UUID complet (param brut = UUID v4)
 * 3. Slug texte complet (lookup par slug exact)
 *
 * @param slugParam  - Valeur brute du param de route (slug ou UUID)
 * @param garageId   - Identifiant du garage actif
 */
export async function getVehicleBySlugParam(
	slugParam: string,
	garageId: string,
): Promise<Vehicle | null> {
	const shortId = extractShortId(slugParam);
	if (shortId) return vehicleDb.getByShortId(garageId, shortId).catch(() => null);
	if (UUID_RE.test(slugParam)) return vehicleDb.getById(slugParam).catch(() => null);
	return vehicleDb.getBySlug(garageId, slugParam).catch(() => null);
}
