import type { MetadataRoute } from "next";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getActiveGarageId } from "@/lib/config/garage";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.garagemendonca.com";
const GARAGE_ID = getActiveGarageId();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	let vehicleEntries: MetadataRoute.Sitemap = [];
	let categoryEntries: MetadataRoute.Sitemap = [];

	if (SUPABASE_ENABLED && GARAGE_ID) {
		const [slugs, categories] = await Promise.all([
			vehicleDb.listSlugsWithCategory(GARAGE_ID).catch(() => []),
			vehicleCategoryRepository.getAll(GARAGE_ID).catch(() => []),
		]);

		// Sitemap : uniquement les véhicules catégorisés (URL /occasions/ indexable)
		// Les véhicules sans category_id sont noindex → exclus du sitemap
		vehicleEntries = slugs
			.filter(({ categorySlug }) => !!categorySlug)
			.map(({ slug, id, updated_at, categorySlug }) => ({
				url: `${BASE_URL}/occasions/${categorySlug}/${slug}-${id.slice(0, 8)}`,
				lastModified: updated_at ? new Date(updated_at) : new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.9,
			}));

		categoryEntries = categories.map((cat) => ({
			url: `${BASE_URL}/occasions/${cat.slug}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.85,
		}));
	}

	return [
		{ url: BASE_URL,                              lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
		{ url: `${BASE_URL}/occasions`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
		{ url: `${BASE_URL}/vehicules`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.6 },
		{ url: `${BASE_URL}/services`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
		{ url: `${BASE_URL}/contact`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
		{ url: `${BASE_URL}/produit`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
		{ url: `${BASE_URL}/faq`,                     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
		{ url: `${BASE_URL}/cgu`,                     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
		{ url: `${BASE_URL}/mentions-legales`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
		{ url: `${BASE_URL}/politique-confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
		...categoryEntries,
		...vehicleEntries,
	];
}
