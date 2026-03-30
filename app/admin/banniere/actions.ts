"use server";

import { revalidatePath } from "next/cache";
import { bannerRepository } from "@/lib/repositories";
import type { Banner } from "@/types";

export async function upsertBannerAction(
  data: Partial<Banner>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await bannerRepository.upsert(data);
    revalidatePath("/");
    revalidatePath("/vehicules");
    revalidatePath("/services");
    revalidatePath("/contact");
    revalidatePath("/admin/banniere");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
