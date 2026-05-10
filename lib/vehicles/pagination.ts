/**
 * Helpers de pagination véhicules.
 * Utilisé par les pages /vehicules/page/[page] et les API internes.
 */

export const VEHICLES_PER_PAGE = 16;

export interface PaginationMeta {
  page: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPaginationMeta(
  page: number,
  totalCount: number,
  perPage = VEHICLES_PER_PAGE,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  return {
    page: clampedPage,
    totalPages,
    totalCount,
    perPage,
    hasNext: clampedPage < totalPages,
    hasPrev: clampedPage > 1,
  };
}

export function pageOffset(page: number, perPage = VEHICLES_PER_PAGE): number {
  return (Math.max(1, page) - 1) * perPage;
}

/** Génère les numéros de page à afficher avec "..." élidés */
export function paginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

/** Canonical URL pour une page de listing */
export function listingCanonical(page: number): string {
  return page === 1 ? "/vehicules" : `/vehicules/page/${page}`;
}

/** Titre SEO dynamique pour une page de listing */
export function listingTitle(page: number, totalPages: number): string {
  if (page === 1) return "Voitures d'occasion révisées & garanties | Garage Mendonça";
  return `Voitures d'occasion — Page ${page}/${totalPages} | Garage Mendonça`;
}

/** Meta description unique par page */
export function listingDescription(page: number, totalCount: number): string {
  if (page === 1) {
    return `Découvrez nos ${totalCount} voitures d'occasion à Drémil-Lafage (31). Chaque véhicule est inspecté en 160 points, révisé et garanti 6 à 12 mois. Boîte automatique, financement personnalisé.`;
  }
  return `Catalogue véhicules d'occasion — page ${page}. ${totalCount} voitures disponibles au Garage Mendonça, Drémil-Lafage. Garantie 6–12 mois, révision complète incluse.`;
}
