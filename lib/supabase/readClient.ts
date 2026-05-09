/**
 * SUPABASE_ENABLED → true si URL + clé présentes et NEXT_PUBLIC_SUPABASE_ENABLED≠false.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const _hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED: boolean =
  process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "false" &&
  _hasSupabaseEnv;

let _client: SupabaseClient | null = null;

/** Client Supabase anon (lecture publique via RLS). */
export function getReadClient(): SupabaseClient {
  if (!SUPABASE_ENABLED) {
    throw new Error(
      "[Supabase] Non configuré — définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  _client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return _client;
}
