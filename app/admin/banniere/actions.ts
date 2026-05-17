"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { logAudit } from "@/lib/audit/logAction";
import { mapBanner } from "@/lib/supabase/mappers";
import { getActiveGarageId } from "@/lib/config/garage";
import type { Banner } from "@/types";

async function assertAdmin() {
  await assertSameOrigin();
  const garageId = getActiveGarageId();
  const err = await requireAdminForGarage(garageId);
  if (err) throw new Error(err.message);
}

export async function getBannerAction(): Promise<Banner | null> {
  if (!SUPABASE_ENABLED) return null;
  const garageId = getActiveGarageId();
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
    await assertAdmin();
    const garageId = getActiveGarageId();
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
    await logAudit({ action: "update", resourceType: "banner" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
