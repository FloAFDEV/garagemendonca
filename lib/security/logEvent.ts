"use server";

/**
 * Logs de sécurité — distincts des audit logs métier.
 *
 * Événements tracés :
 *   login_failed        — échec de connexion (email/password incorrect)
 *   rate_limited        — IP bloquée par le rate limiter
 *   access_denied       — session valide mais rôle insuffisant
 *   csrf_violation      — requête cross-origin bloquée
 *   unauthorized_action — appel d'une action admin sans session
 *   mfa_failed          — code TOTP invalide
 *
 * Fire-and-forget : ne throw jamais, ne bloque jamais l'action principale.
 */

import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getActiveGarageId } from "@/lib/config/garage";

export type SecurityEventType =
  | "login_failed"
  | "rate_limited"
  | "access_denied"
  | "csrf_violation"
  | "unauthorized_action"
  | "mfa_failed";

export interface SecurityEventParams {
  eventType: SecurityEventType;
  ip?: string | null;
  userEmail?: string | null;
  userId?: string | null;
  details?: Record<string, unknown>;
}

export async function logSecurityEvent(
  params: SecurityEventParams,
): Promise<void> {
  if (!SUPABASE_ENABLED) return;

  try {
    await createSupabaseAdminClient()
      .from("security_events")
      .insert({
        event_type: params.eventType,
        ip_address: params.ip ?? null,
        user_email: params.userEmail ?? null,
        user_id: params.userId ?? null,
        garage_id: getActiveGarageId() || null,
        details: params.details ?? null,
      });
  } catch {
    // Silencieux — les logs de sécurité ne doivent jamais bloquer
  }
}
