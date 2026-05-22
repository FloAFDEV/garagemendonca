/**
 * Helpers métier véhicules — source de vérité centralisée.
 * Importé partout pour éviter les conditions dupliquées.
 */
import type { VehicleStatus } from "@/types/index";

// ─── Visibilité publique ───────────────────────────────────────────

/**
 * Un véhicule est visible publiquement si :
 *  - status === "published" ou "sold" (toujours visible)
 *  - status === "scheduled" ET published_at est passé (RLS identique)
 */
export function isPubliclyVisible(
  status: VehicleStatus,
  published_at?: string | null,
): boolean {
  if (status === "published" || status === "sold") return true;
  if (status === "scheduled") {
    return !!published_at && new Date(published_at) <= new Date();
  }
  return false; // draft
}

// ─── Configuration statut ─────────────────────────────────────────

export const STATUS_CONFIG = {
  published: {
    label:   "Publié",
    badge:   "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot:     "bg-emerald-500",
  },
  draft: {
    label:   "Brouillon",
    badge:   "bg-slate-100 text-slate-500 border-slate-200",
    dot:     "bg-slate-400",
  },
  scheduled: {
    label:   "Programmé",
    badge:   "bg-blue-100 text-blue-700 border-blue-200",
    dot:     "bg-blue-400",
  },
  sold: {
    label:   "Vendue",
    badge:   "bg-red-100 text-red-600 border-red-200",
    dot:     "bg-red-500",
  },
} satisfies Record<VehicleStatus, { label: string; badge: string; dot: string }>;

export function getStatusConfig(status: VehicleStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
}

// ─── Badge marketing (arrivage / préparation) ─────────────────────

export type MarketingBadge = {
  label:   string;
  variant: "arrivage" | "preparation";
};

/**
 * Extrait le badge marketing depuis les features du véhicule.
 * Indépendant du statut — l'affichage est conditionné par la visibilité publique.
 */
export function getMarketingBadge(
  features: Record<string, unknown> | undefined | null,
): MarketingBadge | null {
  const val = features?.["ScheduledLabel"] as string | undefined;
  if (val === "en_arrivage")    return { label: "En cours d'arrivage", variant: "arrivage" };
  if (val === "en_preparation") return { label: "En préparation",      variant: "preparation" };
  return null;
}

// ─── Filtre actif (compteur public) ───────────────────────────────

/**
 * Détermine si au moins un filtre catalogue est actif (hors pagination).
 * Utilisé pour conditionner l'affichage du compteur de résultats.
 */
export function hasActiveFilters(
  sp: Record<string, string | string[] | undefined>,
): boolean {
  const FILTER_KEYS = ["brands", "q", "fuel", "transmission", "maxKm", "minPrice", "maxPrice", "minYear", "maxYear", "sort"];
  return FILTER_KEYS.some((k) => {
    const v = sp[k];
    return typeof v === "string" && v.trim().length > 0;
  });
}
