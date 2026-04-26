/**
 * Client Supabase browser (anon key) — pour les Client Components.
 *
 * Retourne un client typé avec Database générique.
 * Singleton géré par @supabase/ssr — safe pour Next.js.
 *
 * Usage dans un Client Component :
 *   const supabase = createSupabaseBrowserClient();
 *   const { data } = await supabase.from("vehicles").select("*");
 */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
