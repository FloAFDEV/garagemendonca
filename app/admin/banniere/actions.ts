"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import type { Banner } from "@/types";

export async function upsertBannerAction(
  data: Partial<Banner>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis pour modifier la bannière");
    const garageId = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
    const db = createSupabaseAdminClient();
    const { error } = await db
      .from("banners")
      .upsert({ ...data, garage_id: garageId }, { onConflict: "id" });
    if (error) throw error;
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
