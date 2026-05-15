"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import type { Service } from "@/types";

export async function updateServiceAction(
  slug: string,
  data: Partial<Service>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis pour modifier un service");
    const garageId = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
    const db = createSupabaseAdminClient();

    // ── Core fields update ─────────────────────────────────────────
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined)             patch.title = data.title;
    if (data.short_description !== undefined) patch.short_description = data.short_description;
    if (data.long_description !== undefined)  patch.long_description = data.long_description;
    if (data.features !== undefined)          patch.features = data.features;
    if (data.is_active !== undefined)         patch.is_active = data.is_active;

    const { data: svcRow, error: updateErr } = await db
      .from("services")
      .update(patch)
      .eq("slug", slug)
      .eq("garage_id", garageId)
      .select("id")
      .maybeSingle();
    if (updateErr) throw updateErr;

    // ── Image persistence (storage_path = source of truth) ─────────
    if (data.images !== undefined && svcRow?.id) {
      const serviceId = svcRow.id as string;
      await db.from("service_images").delete().eq("service_id", serviceId);
      if (data.images.length > 0) {
        const rows = data.images.map((img, i) => ({
          service_id:   serviceId,
          garage_id:    garageId,
          url:          img.url ?? "",
          storage_path: img.storage_path ?? null,
          alt:          img.alt ?? null,
          is_primary:   img.is_primary ?? i === 0,
          sort_order:   i,
        }));
        const { error: imgErr } = await db.from("service_images").insert(rows);
        if (imgErr) throw imgErr;
      }
    }

    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
