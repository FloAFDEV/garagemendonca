/**
 * Logos de marques automobiles.
 *
 * ── Architecture migration Supabase ──────────────────────────────────────────
 *
 *  Phase 1 (démo / local)
 *    Les fichiers SVG sont dans /public/logos/brands/<filename>
 *    → servis par Next.js comme assets statiques
 *    → getBrandLogoUrl(brand) retourne "/logos/brands/toyota.svg"
 *
 *  Phase 2 (Supabase Storage)
 *    Upload des mêmes fichiers dans le bucket "logos", dossier "brands/"
 *    → getBrandLogoUrl(brand, process.env.NEXT_PUBLIC_SUPABASE_LOGOS_URL)
 *      retourne "https://xxx.supabase.co/storage/v1/object/public/logos/brands/toyota.svg"
 *    → Aucune autre modification nécessaire
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Nom de fichier SVG (sans chemin) pour chaque marque. */
export const BRAND_LOGO_FILENAMES: Partial<Record<string, string>> = {
  // ── Françaises ─────────────────────────────────────────────────
  Citroën:       "citroen.svg",
  DS:            "ds.svg",
  Peugeot:       "peugeot.svg",
  Renault:       "renault.svg",

  // ── Allemandes ─────────────────────────────────────────────────
  Audi:          "audi.svg",
  BMW:           "bmw.svg",
  Mercedes:      "mercedes.svg",
  Opel:          "opel.svg",
  Volkswagen:    "volkswagen.svg",

  // ── Japonaises ─────────────────────────────────────────────────
  Honda:         "honda.svg",
  Lexus:         "lexus.svg",
  Mazda:         "mazda.svg",
  Mitsubishi:    "mitsubishi.svg",
  Nissan:        "nissan.svg",
  Subaru:        "subaru.svg",
  Suzuki:        "suzuki.svg",
  Toyota:        "toyota.svg",

  // ── Coréennes ──────────────────────────────────────────────────
  Hyundai:       "hyundai.svg",
  Kia:           "kia.svg",
  KGM:           "kgm.svg",

  // ── Espagnoles ─────────────────────────────────────────────────
  Cupra:         "cupra.svg",
  Seat:          "seat.svg",
  Skoda:         "skoda.svg",

  // ── Italiennes ─────────────────────────────────────────────────
  "Alfa Romeo":  "alfa_romeo.svg",
  Fiat:          "fiat.svg",
  Jeep:          "jeep.svg",

  // ── Britanniques ───────────────────────────────────────────────
  "Land Rover":  "land_rover.svg",
  Mini:          "mini.svg",

  // ── Nordiques ──────────────────────────────────────────────────
  Volvo:         "volvo.svg",

  // ── Premium / Luxe ─────────────────────────────────────────────
  Porsche:       "porsche.svg",
  Smart:         "smart.svg",
  Tesla:         "tesla.svg",

  // ── Autres ─────────────────────────────────────────────────────
  Dacia:         "dacia.svg",
  Ford:          "ford.svg",
};

/**
 * Retourne l'URL du logo pour une marque donnée.
 *
 * @param brand  - Nom exact de la marque (ex: "Toyota", "Alfa Romeo")
 * @param base   - Base URL :
 *     - Phase 1 (défaut) : "/logos/brands" → fichiers locaux dans /public/
 *     - Phase 2 (Supabase) : process.env.NEXT_PUBLIC_SUPABASE_LOGOS_URL
 *       ex: "https://xxx.supabase.co/storage/v1/object/public/logos/brands"
 * @returns URL complète ou null si la marque n'a pas de logo
 */
export function getBrandLogoUrl(
  brand: string,
  base = "/logos/brands",
): string | null {
  const filename = BRAND_LOGO_FILENAMES[brand];
  if (!filename) return null;
  return `${base}/${filename}`;
}

/**
 * Map brand → URL locale prête à l'emploi pour next/image.
 *
 * Utilisée côté client là où l'on n'a pas accès à une base URL dynamique.
 * En production Supabase, remplacer par getBrandLogoUrl(brand, supabaseBase).
 */
export const BRAND_LOGO_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_LOGO_FILENAMES)
    .filter((entry): entry is [string, string] => entry[1] != null)
    .map(([brand, filename]) => [brand, `/logos/brands/${filename}`]),
);
