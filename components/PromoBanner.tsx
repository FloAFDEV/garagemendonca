import { bannerRepository } from "@/lib/repositories";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { extractStoragePath } from "@/lib/utils/storage";
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

  // Les vérifications de dates et display_pages sont gérées côté client
  // (PromoBannerClient) pour éviter le problème de cache Next.js :
  // ce Server Component est mis en cache et "now" ne changerait pas
  // tant qu'un revalidatePath n'est pas déclenché.

  const signedImageUrl = banner.image_url
    ? await signBannerImage(banner.image_url)
    : undefined;

  return <PromoBannerClient banner={banner} signedImageUrl={signedImageUrl} />;
}
