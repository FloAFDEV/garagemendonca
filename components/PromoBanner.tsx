import { bannerRepository } from "@/lib/repositories";
import { getStoragePublicUrl } from "@/lib/utils/storage";
import PromoBannerClient from "./PromoBannerClient";

export default async function PromoBanner() {
  const banner = await bannerRepository.get();
  if (!banner || !banner.is_active) return null;

  const imageUrl = banner.image_storage_path
    ? getStoragePublicUrl("banner-images", banner.image_storage_path)
    : banner.image_url ?? undefined;

  return <PromoBannerClient banner={banner} signedImageUrl={imageUrl} />;
}
