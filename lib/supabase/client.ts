/**
 * Client Supabase — côté navigateur (Client Components).
 *
 * Usage :
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *
 * Installation :
 *   npm install @supabase/supabase-js @supabase/ssr
 *
 * Variables d'environnement requises (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
 */

// import { createBrowserClient } from "@supabase/ssr";
//
// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }

/** Stub — à décommenter après installation de @supabase/ssr */
export function createClient() {
  throw new Error(
    "Supabase client not configured. " +
    "Install @supabase/ssr, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, " +
    "then uncomment the implementation in lib/supabase/client.ts"
  );
}
