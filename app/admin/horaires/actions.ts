"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { garageDb } from "@/lib/db/garage.repository";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { logAudit } from "@/lib/audit/logAction";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import type { GarageOpeningHours, Garage } from "@/types";

const GARAGE_ID = () => process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

async function assertAdmin() {
  await assertSameOrigin();
  const err = await requireAdminForGarage(GARAGE_ID());
  if (err) throw new Error(err.message);
}

export async function getGarageAction(): Promise<Garage | null> {
  if (!SUPABASE_ENABLED) return null;
  return garageDb.getById(GARAGE_ID());
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
      .eq("id", GARAGE_ID());
    if (error) throw error;
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin/horaires");
    await logAudit({ action: "update", resourceType: "garage", resourceId: GARAGE_ID(), details: { field: "opening_hours" } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
