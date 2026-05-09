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
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined)             patch.title = data.title;
    if (data.short_description !== undefined) patch.short_description = data.short_description;
    if (data.long_description !== undefined)  patch.long_description = data.long_description;
    if (data.features !== undefined)          patch.features = data.features;
    if (data.is_active !== undefined)         patch.is_active = data.is_active;
    const { error } = await db
      .from("services")
      .update(patch)
      .eq("slug", slug)
      .eq("garage_id", garageId);
    if (error) throw error;
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
