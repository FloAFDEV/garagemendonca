"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { garageDb } from "@/lib/db/garage.repository";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { logAudit } from "@/lib/audit/logAction";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getActiveGarageId } from "@/lib/config/garage";
import type { GarageOpeningHours, Garage, ClosureNotice } from "@/types";

async function assertAdmin() {
  await assertSameOrigin();
  const err = await requireAdminForGarage(getActiveGarageId());
  if (err) throw new Error(err.message);
}

export async function getGarageAction(): Promise<Garage | null> {
  if (!SUPABASE_ENABLED) return null;
  return garageDb.getById(getActiveGarageId());
}

export async function updateOpeningHoursAction(
  hours: GarageOpeningHours,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis");
    await assertAdmin();
    const db = createSupabaseAdminClient();
    const { error } = await db
      .from("garages")
      .update({ opening_hours: hours, updated_at: new Date().toISOString() })
      .eq("id", getActiveGarageId());
    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin/horaires");
    await logAudit({ action: "update", resourceType: "garage", resourceId: getActiveGarageId(), details: { field: "opening_hours" } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateClosureAction(
  closure: ClosureNotice,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis");
    await assertAdmin();
    const db = createSupabaseAdminClient();
    // Merge dans garages.content en préservant les autres clés
    const { data: existing } = await db
      .from("garages")
      .select("content")
      .eq("id", getActiveGarageId())
      .single();
    const currentContent = (existing?.content as Record<string, unknown>) ?? {};
    const { error } = await db
      .from("garages")
      .update({
        content: { ...currentContent, closure },
        updated_at: new Date().toISOString(),
      })
      .eq("id", getActiveGarageId());
    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin/horaires");
    await logAudit({ action: "update", resourceType: "garage", resourceId: getActiveGarageId(), details: { field: "closure_notice" } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
