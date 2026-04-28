/**
 * Client Supabase read-only (anon key) — partagé entre tous les repositories.
 *
 * Utilise @supabase/supabase-js directement (pas SSR) car les lectures
 * publiques ne nécessitent pas de cookies — la RLS anon key suffit.
 *
 * SUPABASE_ENABLED est false si les variables d'environnement sont absentes :
 * le shadow mode se désactive automatiquement et les repositories basculent
 * sur le store in-memory sans intervention manuelle.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_SUPABASE_ENABLED=false désactive explicitement Supabase même si
// l'URL et la clé sont présentes (utile pour forcer le mode mock en preview).
// Par défaut (non définie) : activé si URL + clé présentes.
export const SUPABASE_ENABLED =
  process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "false" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

/** Retourne un client singleton anon-key. Lance une erreur si non configuré. */
export function getReadClient(): SupabaseClient {
  if (!SUPABASE_ENABLED) {
    throw new Error(
      "Supabase non configuré — définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  _client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return _client;
}
