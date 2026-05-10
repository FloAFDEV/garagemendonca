"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { mapBanner } from "@/lib/supabase/mappers";
import type { Banner } from "@/types";

export async function getBannerAction(): Promise<Banner | null> {
  if (!SUPABASE_ENABLED) return null;
  const garageId = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
  const { data } = await createSupabaseAdminClient()
    .from("banners")
    .select("*")
    .eq("garage_id", garageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapBanner(data) : null;
}

export async function upsertBannerAction(
  data: Partial<Banner>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis pour modifier la bannière");
    const garageId = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
    const db = createSupabaseAdminClient();
    const payload = {
      ...data,
      garage_id: garageId,
      // Les champs datetime-local renvoient "" quand vides → convertir en null
      scheduled_start: data.scheduled_start || null,
      scheduled_end: data.scheduled_end || null,
      // id absent = INSERT (nouveau), id présent = UPDATE
    };
    const { error } = await db
      .from("banners")
      .upsert(payload, { onConflict: "id" });
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
