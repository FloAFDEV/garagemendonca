/**
 * Client Supabase — côté serveur (Server Components, Server Actions, Route Handlers).
 *
 * Usage :
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("vehicles").select("*");
 *
 * Installation :
 *   npm install @supabase/supabase-js @supabase/ssr
 *
 * Variables d'environnement requises (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  ← pour les opérations admin
 */

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
//
// export function createClient() {
//   const cookieStore = cookies();
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return cookieStore.getAll(); },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           );
//         },
//       },
//     }
//   );
// }

/** Stub — à décommenter après installation de @supabase/ssr */
export function createClient() {
  throw new Error(
    "Supabase server client not configured. " +
    "Install @supabase/ssr, set environment variables, " +
    "then uncomment the implementation in lib/supabase/server.ts"
  );
}
