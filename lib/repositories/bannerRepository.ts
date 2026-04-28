/**
 * Banner Repository — source de vérité unique.
 *
 * DEMO_MODE=true  → bannière statique embarquée.
 * SUPABASE_ENABLED → Supabase exclusif (RLS gère scheduling).
 * Ni l'un ni l'autre → erreur explicite.
 */

import type { Banner } from "@/types";
import { DEMO_MODE, SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapBanner } from "@/lib/supabase/mappers";

const DEMO_BANNER: Banner = {
  id: "demo-banner",
  is_active: true,
  message: "Vidange boîte automatique — Offre spéciale printemps",
  sub_message: "Révision complète + vidange boîte auto à tarif préférentiel. Sur rendez-vous.",
  cta_label: "Prendre rendez-vous",
  cta_url: "/contact",
  bg_color: "#991B1B",
  display_pages: "all",
  is_dismissible: true,
};

async function getActiveSupabase(garageId: string): Promise<Banner | null> {
  const { data, error } = await getReadClient()
    .from("banners")
    .select("*")
    .eq("garage_id", garageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBanner(data) : null;
}

export const bannerRepository = {
  get: async (): Promise<Banner | null> => {
    if (SUPABASE_ENABLED) {
      const garageId = process.env.NEXT_PUBLIC_GARAGE_ID;
      if (!garageId) return null;
      return getActiveSupabase(garageId);
    }
    if (DEMO_MODE) return DEMO_BANNER;
    throw new Error("[bannerRepository] Aucune source de données : configurer Supabase ou NEXT_PUBLIC_DEMO_MODE=true");
  },

  upsert: async (data: Partial<Banner>): Promise<Banner> => {
    return { ...DEMO_BANNER, ...data, id: "demo-banner" };
  },
};
