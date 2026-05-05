import type { MetadataRoute } from "next";
import { vehicleRepository } from "@/lib/repositories/vehicleRepository";

const BASE_URL = "https://www.garagemendonca.com";
const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const vehicles = await vehicleRepository.getAll(GARAGE_ID);

	const vehicleEntries: MetadataRoute.Sitemap = vehicles.map((v) => ({
		url: `${BASE_URL}/vehicules/${v.slug}`,
		lastModified: new Date(v.updatedAt ?? Date.now()),
		changeFrequency: "weekly",
		priority: 0.8,
	}));

	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/vehicules`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/services`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/produit`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		...vehicleEntries,
	];
}
