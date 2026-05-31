import { unstable_cache } from "next/cache";
import { bannerRepository } from "@/lib/repositories";
import { getStoragePublicUrl } from "@/lib/utils/storage";
import PromoBannerClient from "./PromoBannerClient";

// Bannière quasi-statique — évite 1 lecture Supabase par rendu dynamique. TTL 5 min.
const getBannerCached = unstable_cache(
  () => bannerRepository.get(),
  ["promo-banner"],
  { revalidate: 300, tags: ["banner"] },
);

export default async function PromoBanner() {
  const banner = await getBannerCached();
  if (!banner || !banner.is_active) return null;

  const imageUrl = banner.image_storage_path
    ? getStoragePublicUrl("banner-images", banner.image_storage_path)
    : banner.image_url ?? undefined;

  return <PromoBannerClient banner={banner} signedImageUrl={imageUrl} />;
}
