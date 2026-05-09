/**
 * Garage Content Repository — migration 007
 *
 * Lit les tables relationnelles créées par la migration 007 :
 *   garage_content, garage_stats, garage_trust_badges,
 *   garage_reassurances, garage_cta_guarantees, garage_vehicle_guarantees
 *
 * Fallback automatique sur garages.content JSONB si les nouvelles tables
 * sont vides (compatibilité installation partielle).
 *
 * Usage :
 *   const content = await garageContentRepository.getAll(ACTIVE_GARAGE_ID);
 *   // → remplace la lecture de garages.content dans Hero.tsx, ServicesOverview.tsx, etc.
 */

import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";

// ─── Types des nouvelles tables ──────────────────────────────────────────────

export interface GarageHeroContent {
  eyebrow?:           string;
  h1Prefix?:          string;
  h1City?:            string;
  subtitle?:          string;
  h3Prefix?:          string;
  h3Highlight?:       string;
  ctaPrimaryText?:    string;
  ctaPrimaryHref?:    string;
  ctaSecondaryText?:  string;
  ctaSecondaryHref?:  string;
  ctaH2Prefix?:       string;
  ctaH2Highlight?:    string;
  ctaParagraph?:      string;
}

export interface GarageStat {
  value:      string;
  label:      string;
  sort_order: number;
}

export interface GarageTrustBadge {
  icon:       string;
  text:       string;
  sort_order: number;
}

export interface GarageReassurance {
  label:       string;
  description?: string;
  sort_order:  number;
}

export interface GarageCTAGuarantee {
  label:      string;
  sort_order: number;
}

export interface GarageVehicleGuarantee {
  icon:       string;
  label:      string;
  sort_order: number;
}

export interface GarageFullContent {
  hero:              GarageHeroContent | null;
  stats:             GarageStat[];
  trustBadges:       GarageTrustBadge[];
  reassurances:      GarageReassurance[];
  ctaGuarantees:     GarageCTAGuarantee[];
  vehicleGuarantees: GarageVehicleGuarantee[];
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHeroContent(row: any): GarageHeroContent {
  return {
    eyebrow:          row.hero_eyebrow ?? undefined,
    h1Prefix:         row.hero_h1_prefix ?? undefined,
    h1City:           row.hero_h1_city ?? undefined,
    subtitle:         row.hero_subtitle ?? undefined,
    h3Prefix:         row.hero_h3_prefix ?? undefined,
    h3Highlight:      row.hero_h3_highlight ?? undefined,
    ctaPrimaryText:   row.hero_cta_primary_text ?? undefined,
    ctaPrimaryHref:   row.hero_cta_primary_href ?? undefined,
    ctaSecondaryText: row.hero_cta_secondary_text ?? undefined,
    ctaSecondaryHref: row.hero_cta_secondary_href ?? undefined,
    ctaH2Prefix:      row.cta_h2_prefix ?? undefined,
    ctaH2Highlight:   row.cta_h2_highlight ?? undefined,
    ctaParagraph:     row.cta_paragraph ?? undefined,
  };
}

// ─── Fallback JSONB (garages.content) ────────────────────────────────────────
// Utilisé si les nouvelles tables sont vides (installation pre-007).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromLegacyJsonb(content: any): GarageFullContent {
  const hero = content?.hero ?? {};
  const cta  = content?.cta_section ?? {};
  return {
    hero: {
      eyebrow:          hero.eyebrow,
      h1Prefix:         hero.h1_prefix,
      h1City:           hero.h1_city,
      subtitle:         hero.subtitle,
      h3Prefix:         hero.h3_prefix,
      h3Highlight:      hero.h3_highlight,
      ctaPrimaryText:   hero.cta_primary_text,
      ctaPrimaryHref:   hero.cta_primary_href,
      ctaSecondaryText: hero.cta_secondary_text,
      ctaSecondaryHref: hero.cta_secondary_href,
      ctaH2Prefix:      cta.h2_prefix,
      ctaH2Highlight:   cta.h2_highlight,
      ctaParagraph:     cta.paragraph,
    },
    stats: (hero.stats ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any, i: number): GarageStat => ({ value: s.value, label: s.label, sort_order: i }),
    ),
    trustBadges: (hero.trust_badges ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (b: any, i: number): GarageTrustBadge => ({ icon: b.icon, text: b.text, sort_order: i }),
    ),
    reassurances: (content?.reassurances ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any, i: number): GarageReassurance => ({ label: r.label, description: r.description, sort_order: i }),
    ),
    ctaGuarantees: (cta.guarantees ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (g: any, i: number): GarageCTAGuarantee => ({ label: typeof g === "string" ? g : g.label, sort_order: i }),
    ),
    vehicleGuarantees: (content?.vehicle_guarantees ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (g: any, i: number): GarageVehicleGuarantee => ({ icon: g.icon, label: g.label, sort_order: i }),
    ),
  };
}

// ─── Lectures Supabase ───────────────────────────────────────────────────────

async function fetchAllSupabase(garageId: string): Promise<GarageFullContent> {
  const db = getReadClient();

  const [
    contentRes, statsRes, badgesRes,
    reassurancesRes, ctaGuarRes, vehGuarRes,
    legacyRes,
  ] = await Promise.all([
    db.from("garage_content").select("*").eq("garage_id", garageId).maybeSingle(),
    db.from("garage_stats").select("value, label, sort_order").eq("garage_id", garageId).eq("is_active", true).order("sort_order"),
    db.from("garage_trust_badges").select("icon, text, sort_order").eq("garage_id", garageId).eq("is_active", true).order("sort_order"),
    db.from("garage_reassurances").select("label, description, sort_order").eq("garage_id", garageId).eq("is_active", true).order("sort_order"),
    db.from("garage_cta_guarantees").select("label, sort_order").eq("garage_id", garageId).eq("is_active", true).order("sort_order"),
    db.from("garage_vehicle_guarantees").select("icon, label, sort_order").eq("garage_id", garageId).eq("is_active", true).order("sort_order"),
    // Fallback JSONB : lu en parallèle, utilisé uniquement si tables vides
    db.from("garages").select("content").eq("id", garageId).maybeSingle(),
  ]);

  // Si les nouvelles tables sont peuplées, les utiliser
  const hasNewData =
    contentRes.data ||
    (statsRes.data?.length ?? 0) > 0 ||
    (badgesRes.data?.length ?? 0) > 0;

  if (hasNewData) {
    return {
      hero:              contentRes.data ? mapHeroContent(contentRes.data) : null,
      stats:             statsRes.data ?? [],
      trustBadges:       badgesRes.data ?? [],
      reassurances:      reassurancesRes.data ?? [],
      ctaGuarantees:     ctaGuarRes.data ?? [],
      vehicleGuarantees: vehGuarRes.data ?? [],
    };
  }

  // Fallback JSONB (pre-migration 007 ou tables encore vides)
  return extractFromLegacyJsonb(legacyRes.data?.content ?? {});
}

// ─── Repository public ───────────────────────────────────────────────────────

export const garageContentRepository = {
  /**
   * Retourne tout le contenu marketing du garage en une seule passe.
   * Utilise les tables relationnelles (migration 007) si disponibles,
   * sinon fallback sur garages.content JSONB.
   */
  getAll: async (garageId: string): Promise<GarageFullContent> => {
    if (!SUPABASE_ENABLED) {
      // Mode démo : retourne des valeurs vides — les composants hardcodés
      // prennent le relais jusqu'à la suppression de data.ts.
      return {
        hero: null,
        stats: [],
        trustBadges: [],
        reassurances: [],
        ctaGuarantees: [],
        vehicleGuarantees: [],
      };
    }
    return fetchAllSupabase(garageId);
  },

  getStats: async (garageId: string): Promise<GarageStat[]> => {
    if (!SUPABASE_ENABLED) return [];
    const { data } = await getReadClient()
      .from("garage_stats")
      .select("value, label, sort_order")
      .eq("garage_id", garageId)
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  },

  getTrustBadges: async (garageId: string): Promise<GarageTrustBadge[]> => {
    if (!SUPABASE_ENABLED) return [];
    const { data } = await getReadClient()
      .from("garage_trust_badges")
      .select("icon, text, sort_order")
      .eq("garage_id", garageId)
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  },

  getReassurances: async (garageId: string): Promise<GarageReassurance[]> => {
    if (!SUPABASE_ENABLED) return [];
    const { data } = await getReadClient()
      .from("garage_reassurances")
      .select("label, description, sort_order")
      .eq("garage_id", garageId)
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  },

  getVehicleGuarantees: async (garageId: string): Promise<GarageVehicleGuarantee[]> => {
    if (!SUPABASE_ENABLED) return [];
    const { data } = await getReadClient()
      .from("garage_vehicle_guarantees")
      .select("icon, label, sort_order")
      .eq("garage_id", garageId)
      .eq("is_active", true)
      .order("sort_order");
    return data ?? [];
  },
};
