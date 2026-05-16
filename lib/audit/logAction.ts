"use server";

/**
 * Système d'audit des actions admin.
 * Fire-and-forget : ne throw jamais, n'interrompt pas l'action principale.
 *
 * Usage :
 *   await logAudit({ action: 'create', resourceType: 'vehicle', resourceId: id })
 */

import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getUser } from "@/lib/auth/getSession";
import { headers } from "next/headers";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";

export type AuditAction = "create" | "update" | "delete" | "login" | "logout";
export type AuditResource =
  | "vehicle"
  | "service"
  | "banner"
  | "session"
  | "message";

export interface AuditParams {
  action: AuditAction;
  resourceType: AuditResource;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export async function logAudit(params: AuditParams): Promise<void> {
  if (!SUPABASE_ENABLED) return;

  try {
    const [user, headersList] = await Promise.all([getUser(), headers()]);

    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;

    await createSupabaseAdminClient()
      .from("admin_audit_logs")
      .insert({
        garage_id: process.env.NEXT_PUBLIC_GARAGE_ID ?? null,
        user_id: user?.id ?? null,
        user_email: user?.email ?? "unknown",
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId ?? null,
        details: params.details ?? null,
        ip_address: ip,
      });
  } catch {
    // Audit silencieux — ne jamais bloquer l'action principale
  }
}
