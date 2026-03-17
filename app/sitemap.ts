import type { MetadataRoute } from "next";
import { vehicles } from "@/lib/data";

const BASE_URL = "https://www.garagemendonca.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const vehicleEntries: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${BASE_URL}/vehicules/${v.id}`,
    lastModified: new Date(),
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
