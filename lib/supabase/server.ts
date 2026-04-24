/**
 * Client Supabase service-role — Server Actions admin uniquement.
 *
 * Utilise SUPABASE_SERVICE_ROLE_KEY pour bypasser RLS.
 * Ne jamais importer ce module côté client.
 *
 * Usage :
 *   import { createAdminClient } from "@/lib/supabase/server";
 *   const supabase = createAdminClient();
 *   const { data } = await supabase.from("vehicles").select("*");
 */

import { createClient } from "@supabase/supabase-js";

/** Client avec service-role — bypass RLS, réservé aux Server Actions admin. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
