import type { MetadataRoute } from "next";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";

const BASE_URL = "https://www.garagemendonca.com";
const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	let vehicleEntries: MetadataRoute.Sitemap = [];

	if (SUPABASE_ENABLED && GARAGE_ID) {
		const slugs = await vehicleDb.listSlugs(GARAGE_ID).catch(() => []);
		vehicleEntries = slugs.map(({ slug, updated_at }) => ({
			url: `${BASE_URL}/vehicules/${slug}`,
			lastModified: updated_at ? new Date(updated_at) : new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		}));
	}

	return [
		{ url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
		{ url: `${BASE_URL}/vehicules`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
		{ url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
		{ url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
		{ url: `${BASE_URL}/produit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
		...vehicleEntries,
	];
}
