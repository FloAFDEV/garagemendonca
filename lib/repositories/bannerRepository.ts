/**
 * Banner Repository — shadow mode Phase 2A.
 *
 * Lecture : Supabase en priorité (si configuré), fallback in-memory.
 * Écriture : toujours in-memory — aucun write Supabase en Phase 2A.
 *
 * La RLS Supabase gère la planification (scheduled_start / scheduled_end).
 * Le composant PromoBanner.tsx applique également ses propres vérifications —
 * les deux logiques sont compatibles.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * Voir lib/supabase/schema.sql → table banners
 * Mapping dans lib/supabase/mappers.ts → mapBanner()
 * --------------------------------------------------------------------------
 */

import type { Banner } from "@/types";
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapBanner } from "@/lib/supabase/mappers";

const USE_SUPABASE_READ_ONLY = SUPABASE_ENABLED;

const DEFAULT_BANNER: Banner = {
  id: "singleton",
  is_active: true,
  message: "Vidange boîte automatique — Offre spéciale printemps",
  sub_message:
    "Révision complète + vidange boîte auto à tarif préférentiel. Sur rendez-vous.",
  cta_label: "Prendre rendez-vous",
  cta_url: "/contact",
  bg_color: "#991B1B",
  display_pages: "all",
  is_dismissible: true,
};

let _banner: Banner = { ...DEFAULT_BANNER };

// ─── Lecture Supabase privée ─────────────────────────────────────────────────

async function getActiveSupabase(garageId: string): Promise<Banner | null> {
  const db = getReadClient();
  // La RLS filtre : is_active = true AND scheduled_start <= now() AND scheduled_end > now()
  const { data, error } = await db
    .from("banners")
    .select("*")
    .eq("garage_id", garageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBanner(data) : null;
}

// ─── Repository public ───────────────────────────────────────────────────────

export const bannerRepository = {
  /** Bannière active. Retourne null si aucune. */
  get: async (): Promise<Banner | null> => {
    if (USE_SUPABASE_READ_ONLY) {
      const garageId = process.env.NEXT_PUBLIC_GARAGE_ID;
      if (garageId) return getActiveSupabase(garageId);
    }
    return _banner.is_active && _banner.message ? _banner : null;
  },

  /** Crée ou met à jour la bannière — toujours in-memory en Phase 2A. */
  upsert: async (data: Partial<Banner>): Promise<Banner> => {
    _banner = { ..._banner, ...data, id: "singleton" };
    return _banner;
  },
};
