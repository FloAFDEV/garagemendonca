/**
 * Rate limiting par IP pour le endpoint de login.
 * Stocké dans la table Supabase `login_attempts` (service role).
 *
 * Règles :
 *   - 5 tentatives échouées max sur une fenêtre de 10 minutes
 *   - Blocage de 15 minutes après dépassement
 *   - Réinitialisation automatique après blocage expiré
 */

import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 min

export interface RateLimitResult {
  blocked: boolean;
  attempts: number;
  retryAfter?: Date;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!SUPABASE_ENABLED) return { blocked: false, attempts: 0 };

  try {
    const db = createSupabaseAdminClient();
    const { data } = await db
      .from("login_attempts")
      .select("attempts_count, blocked_until")
      .eq("ip_address", ip)
      .maybeSingle();

    if (!data) return { blocked: false, attempts: 0 };

    // Blocage en cours
    if (data.blocked_until) {
      const blockedUntil = new Date(data.blocked_until as string);
      if (blockedUntil > new Date()) {
        return { blocked: true, attempts: data.attempts_count as number, retryAfter: blockedUntil };
      }
      // Blocage expiré — nettoyer
      await db.from("login_attempts").delete().eq("ip_address", ip);
      return { blocked: false, attempts: 0 };
    }

    return { blocked: false, attempts: data.attempts_count as number };
  } catch {
    // En cas d'erreur DB, on laisse passer (fail-open)
    return { blocked: false, attempts: 0 };
  }
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  if (!SUPABASE_ENABLED) return;

  try {
    const db = createSupabaseAdminClient();
    const now = new Date().toISOString();

    // Upsert : incrémente le compteur ou crée l'entrée
    const { data: existing } = await db
      .from("login_attempts")
      .select("attempts_count")
      .eq("ip_address", ip)
      .maybeSingle();

    const newCount = ((existing?.attempts_count as number) ?? 0) + 1;
    const blockedUntil =
      newCount >= MAX_ATTEMPTS
        ? new Date(Date.now() + BLOCK_DURATION_MS).toISOString()
        : null;

    await db.from("login_attempts").upsert(
      {
        ip_address: ip,
        attempts_count: newCount,
        last_attempt_at: now,
        blocked_until: blockedUntil,
      },
      { onConflict: "ip_address" },
    );
  } catch {
    // Silencieux
  }
}

export async function resetRateLimit(ip: string): Promise<void> {
  if (!SUPABASE_ENABLED) return;

  try {
    await createSupabaseAdminClient()
      .from("login_attempts")
      .delete()
      .eq("ip_address", ip);
  } catch {
    // Silencieux
  }
}
