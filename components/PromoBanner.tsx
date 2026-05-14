import { bannerRepository } from "@/lib/repositories";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { extractStoragePath } from "@/lib/hooks/useVehicleImage";
import PromoBannerClient from "./PromoBannerClient";

async function signBannerImage(imageUrl: string): Promise<string> {
  const path = extractStoragePath(imageUrl);
  if (!path) return imageUrl; // URL externe, usage direct
  const { data } = await createSupabaseAdminClient()
    .storage.from("banner-images")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? imageUrl;
}

export default async function PromoBanner() {
  const banner = await bannerRepository.get();
  if (!banner || !banner.is_active) return null;

  const now = new Date();
  if (banner.scheduled_start && new Date(banner.scheduled_start) > now) return null;
  if (banner.scheduled_end && new Date(banner.scheduled_end) < now) return null;

  const signedImageUrl = banner.image_url
    ? await signBannerImage(banner.image_url)
    : undefined;

  return <PromoBannerClient banner={banner} signedImageUrl={signedImageUrl} />;
}
