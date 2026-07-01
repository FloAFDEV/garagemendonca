/**
 * Query keys factory — source de vérité pour tous les cache keys React Query.
 *
 * Hiérarchie intentionnelle : invalider "vehicles" invalide aussi
 * "vehicles.lists" et "vehicles.detail" par préfixe de tableau.
 *
 * Usage :
 *   queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
 *   queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(slug) })
 */

import type { UIVehicleFilters } from "@/types/ui";

export const vehicleKeys = {
  all:    ()                        => ["vehicles"]                    as const,
  lists:  ()                        => ["vehicles", "list"]            as const,
  list:   (filters?: UIVehicleFilters) => ["vehicles", "list", JSON.stringify(filters ?? null)] as const,
  admin:  (garageId: string)        => ["vehicles", "admin", garageId] as const,
  detail: (slug: string)            => ["vehicles", "detail", slug]    as const,
};

/** Filtres applicables à la liste paginée de messages. */
export interface MessageListFilters {
  status?:      string;
  search?:      string;
  has_vehicle?: boolean;
}

export const messageKeys = {
  all:    ()                 => ["messages"]                      as const,
  /** Préfixe pour invalider TOUTES les listes d'un garage (tous filtres confondus). */
  lists:  (garageId: string) => ["messages", "list", garageId]   as const,
  /** Clé complète incluant les filtres — utilisée par useInfiniteQuery. */
  list:   (garageId: string, filters?: MessageListFilters) =>
    ["messages", "list", garageId, JSON.stringify(filters ?? null)] as const,
  unread: (garageId: string) => ["messages", "unread", garageId] as const,
  stats:  (garageId: string) => ["messages", "stats", garageId]  as const,
  detail: (id: string)       => ["messages", "detail", id]       as const,
};

export const garageKeys = {
  all:    ()             => ["garages"]                  as const,
  detail: (id: string)   => ["garages", "detail", id]   as const,
  slug:   (slug: string) => ["garages", "slug", slug]   as const,
};

export const categoryKeys = {
  all:    ()                 => ["categories"]                   as const,
  list:   (garageId: string) => ["categories", "list", garageId] as const,
};

// ── P9 — Archives annuelles (préparation) ─────────────────────────────────────
// Chaque année est chargée indépendamment. Invalider "archive(garageId, year)"
// ne touche pas la liste active. Invalider "archives(garageId)" vide l'index.
// Implémentation future : useInfiniteQuery sur cette clé avec filter year.
export const messageArchiveKeys = {
  /** Index des années disponibles */
  index:  (garageId: string) =>
    ["messages", "archive", garageId] as const,
  /** Messages d'une année précise — charge indépendamment */
  year:   (garageId: string, year: number) =>
    ["messages", "archive", garageId, year] as const,
};

// ── P10 — Exports (préparation) ───────────────────────────────────────────────
// Conventions pour les clés des jobs d'export côté React Query.
// Format attendu : exportMessagesCsvAction(garageId, filters) → Blob
//                  exportMessagesPdfAction(garageId, filters) → Blob
//                  exportMessagesZipAction(garageId, filters) → Blob (emails .eml + pièces jointes)
// Chaque export doit respecter les filtres actifs (MessageListFilters) et
// ne jamais charger toute la table en mémoire côté client — chunking serveur obligatoire.
export type ExportFormat = "csv" | "pdf" | "zip";
export const messageExportKeys = {
  job: (garageId: string, format: ExportFormat, filters?: MessageListFilters) =>
    ["messages", "export", garageId, format, JSON.stringify(filters ?? null)] as const,
};
