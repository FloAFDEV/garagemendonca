import { bannerRepository } from "@/lib/repositories";
import PromoBannerClient from "./PromoBannerClient";

export default async function PromoBanner() {
  const banner = await bannerRepository.get();
  if (!banner || !banner.is_active) return null;

  const now = new Date();
  if (banner.scheduled_start && new Date(banner.scheduled_start) > now) return null;
  if (banner.scheduled_end && new Date(banner.scheduled_end) < now) return null;

  return <PromoBannerClient banner={banner} />;
}
