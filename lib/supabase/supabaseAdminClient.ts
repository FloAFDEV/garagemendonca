/**
 * Client Supabase service-role — RÉSERVÉ aux Server Actions admin.
 *
 * Bypasse RLS. Ne jamais importer côté client.
 * La validation d'autorisation (auth + rôle) doit se faire AVANT d'appeler
 * ce client — typiquement dans la safe-action qui l'invoque.
 *
 * Usage dans une Server Action :
 *   import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
 *   const supabase = createSupabaseAdminClient();
 */

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
