/**
 * Mode d'exécution de l'application.
 *
 * DEMO_MODE=true  → données statiques (lib/data.ts), aucun appel Supabase.
 * DEMO_MODE=false → Supabase obligatoire. Erreur si non configuré.
 * DEMO_MODE auto  → si Supabase absent et DEMO_MODE non défini, bascule en démo.
 *
 * SUPABASE_ENABLED → true uniquement si URL + clé présentes ET DEMO_MODE=false.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const _hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const _explicitDemo = process.env.NEXT_PUBLIC_DEMO_MODE;

/**
 * Mode démo : données statiques, aucun appel DB.
 * true si :
 *   - NEXT_PUBLIC_DEMO_MODE=true explicitement, OU
 *   - Supabase non configuré ET NEXT_PUBLIC_DEMO_MODE ne vaut pas "false"
 */
export const DEMO_MODE: boolean =
  _explicitDemo === "true" ||
  (!_hasSupabaseEnv && _explicitDemo !== "false");

/**
 * Mode Supabase actif.
 * true si URL + clé présents, DEMO_MODE=false, et SUPABASE_ENABLED≠false.
 */
export const SUPABASE_ENABLED: boolean =
  !DEMO_MODE &&
  process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "false" &&
  _hasSupabaseEnv;

let _client: SupabaseClient | null = null;

/** Client Supabase anon (lecture publique via RLS). */
export function getReadClient(): SupabaseClient {
  if (!SUPABASE_ENABLED) {
    throw new Error(
      "[Supabase] Non configuré — définir NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY et NEXT_PUBLIC_DEMO_MODE=false",
    );
  }
  _client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return _client;
}
