/**
 * Client Supabase — décommenter quand le projet Supabase est créé.
 * Voir lib/supabase/README.md pour les étapes complètes.
 */

// import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
// import { createServerClient as _createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
//
// export function createBrowserClient() {
//   return _createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//   );
// }
//
// export async function createServerClient() {
//   const cookieStore = await cookies();
//   return _createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return cookieStore.getAll(); },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options),
//           );
//         },
//       },
//     },
//   );
// }

export {}; // placeholder — remove once Supabase is configured
