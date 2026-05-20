/**
 * Logos de marques automobiles — système complet avec alias & fallback.
 *
 * Architecture :
 *   Phase 1 (local) : SVG dans /public/logos/brands/ → servis par Next.js
 *   Phase 2 (Supabase) : même fichiers dans bucket "logos/brands/"
 *     → changer la `base` passée à getBrandLogoUrl(), rien d'autre à modifier
 */

// ─────────────────────────────────────────────────────────────────
//  Fichiers SVG par marque (clé = nom canonique exact)
// ─────────────────────────────────────────────────────────────────

export const BRAND_LOGO_FILENAMES: Partial<Record<string, string>> = {
  // ── Françaises ─────────────────────────────────────────────────
  Citroën:        "citroen.svg",
  DS:             "ds.svg",
  Peugeot:        "peugeot.svg",
  Renault:        "renault.svg",

  // ── Allemandes ─────────────────────────────────────────────────
  Audi:           "audi.svg",
  BMW:            "bmw.svg",
  Mercedes:       "mercedes.svg",
  Opel:           "opel.svg",
  Volkswagen:     "volkswagen.svg",
  Maybach:        "maybach.svg",
  Porsche:        "porsche.svg",

  // ── Japonaises ─────────────────────────────────────────────────
  Daihatsu:       "daihatsu.svg",
  Honda:          "honda.svg",
  Infiniti:       "infiniti.svg",
  Lexus:          "lexus.svg",
  Mazda:          "mazda.svg",
  Mitsubishi:     "mitsubishi.svg",
  Nissan:         "nissan.svg",
  Subaru:         "subaru.svg",
  Suzuki:         "suzuki.svg",
  Toyota:         "toyota.svg",

  // ── Coréennes ──────────────────────────────────────────────────
  Genesis:        "genesis.svg",
  Hyundai:        "hyundai.svg",
  Kia:            "kia.svg",
  KGM:            "kgm.svg",
  SsangYong:      "ssangyong.svg",

  // ── Espagnoles ─────────────────────────────────────────────────
  Cupra:          "cupra.svg",
  Seat:           "seat.svg",
  Skoda:          "skoda.svg",

  // ── Italiennes ─────────────────────────────────────────────────
  Abarth:         "abarth.svg",
  "Alfa Romeo":   "alfa_romeo.svg",
  Ferrari:        "ferrari.svg",
  Fiat:           "fiat.svg",
  Iveco:          "iveco.svg",
  Jeep:           "jeep.svg",
  Lamborghini:    "lamborghini.svg",
  Lancia:         "lancia.svg",
  Maserati:       "maserati.svg",

  // ── Britanniques ───────────────────────────────────────────────
  "Aston Martin": "aston_martin.svg",
  Bentley:        "bentley.svg",
  Jaguar:         "jaguar.svg",
  "Land Rover":   "land_rover.svg",
  Lotus:          "lotus.svg",
  McLaren:        "mclaren.svg",
  Mini:           "mini.svg",
  "Rolls-Royce":  "rolls_royce.svg",

  // ── Nordiques ──────────────────────────────────────────────────
  Polestar:       "polestar.svg",
  Saab:           "saab.svg",
  Volvo:          "volvo.svg",

  // ── Américaines ────────────────────────────────────────────────
  Chevrolet:      "chevrolet.svg",
  Dodge:          "dodge.svg",
  Ford:           "ford.svg",

  // ── Premium / Tech ─────────────────────────────────────────────
  Alpine:         "alpine.svg",
  Smart:          "smart.svg",
  Tesla:          "tesla.svg",

  // ── Chinoises & émergentes ─────────────────────────────────────
  Aiways:         "aiways.svg",
  BYD:            "byd.svg",
  DR:             "dr.svg",
  Evo:            "evo.svg",
  Hongqi:         "hongqi.svg",
  Leapmotor:      "leapmotor.svg",
  "Lynk & Co":    "lynk_co.svg",
  MG:             "mg.svg",
  Nio:            "nio.svg",
  Ora:            "ora.svg",
  Seres:          "seres.svg",
  VinFast:        "vinfast.svg",
  Xpeng:          "xpeng.svg",
  Zeekr:          "zeekr.svg",

  // ── Autres ─────────────────────────────────────────────────────
  Dacia:          "dacia.svg",
};

// ─────────────────────────────────────────────────────────────────
//  Alias → nom canonique (casse insensible après normalisation)
// ─────────────────────────────────────────────────────────────────

const BRAND_ALIASES: Record<string, string> = {
  // Mercedes
  "mercedes-benz":      "Mercedes",
  "mercedes benz":      "Mercedes",
  "mercedes_benz":      "Mercedes",
  "mercedesbenz":       "Mercedes",

  // Volkswagen
  "vw":                 "Volkswagen",

  // Land Rover
  "land-rover":         "Land Rover",
  "land_rover":         "Land Rover",

  // Alfa Romeo
  "alfa-romeo":         "Alfa Romeo",
  "alfa_romeo":         "Alfa Romeo",
  "alfaromeo":          "Alfa Romeo",

  // Rolls-Royce
  "rolls royce":        "Rolls-Royce",
  "rolls-royce":        "Rolls-Royce",
  "rolls_royce":        "Rolls-Royce",
  "rollsroyce":         "Rolls-Royce",
  "rr":                 "Rolls-Royce",

  // Aston Martin
  "aston-martin":       "Aston Martin",
  "aston_martin":       "Aston Martin",
  "astonmartin":        "Aston Martin",
  "am":                 "Aston Martin",

  // Lynk & Co
  "lynk & co":          "Lynk & Co",
  "lynk and co":        "Lynk & Co",
  "lynk_co":            "Lynk & Co",
  "lynkco":             "Lynk & Co",
  "lynk-co":            "Lynk & Co",

  // MG
  "mg motor":           "MG",
  "mg motors":          "MG",

  // VinFast
  "vinfast":            "VinFast",
  "vin fast":           "VinFast",

  // Autres raccourcis courants
  "bmw m":              "BMW",
  "citroen":            "Citroën",
  "citroën":            "Citroën",
  "peugeot":            "Peugeot",
  "renault":            "Renault",
  "ds automobiles":     "DS",
  "seat":               "Seat",
  "cupra":              "Cupra",
  "skoda":              "Skoda",
  "škoda":              "Skoda",
  "ssangyong":          "SsangYong",
  "ssang yong":         "SsangYong",
  "ssang-yong":         "SsangYong",
  "kgm":                "KGM",
  "kia motors":         "Kia",
  "hyundai motor":      "Hyundai",
};

// ─────────────────────────────────────────────────────────────────
//  Normalisation
// ─────────────────────────────────────────────────────────────────

/**
 * Normalise un nom de marque saisi librement vers son nom canonique.
 * Ordre : alias exact → alias toLowerCase → nom canonique direct → entrée brute
 */
export function normalizeBrand(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();

  // 1. Correspondance directe avec les noms canoniques (casse exacte)
  if (BRAND_LOGO_FILENAMES[trimmed] !== undefined) return trimmed;

  // 2. Correspondance via alias (insensible à la casse)
  const lower = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // suppression accents

  const alias = BRAND_ALIASES[lower];
  if (alias) return alias;

  // 3. Correspondance insensible à la casse sur les noms canoniques
  const canonical = Object.keys(BRAND_LOGO_FILENAMES).find(
    (k) =>
      k.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") === lower,
  );
  if (canonical) return canonical;

  return trimmed;
}

// ─────────────────────────────────────────────────────────────────
//  URL du logo
// ─────────────────────────────────────────────────────────────────

const FALLBACK_LOGO = "/logos/brands/default.svg";

/**
 * Retourne l'URL du logo pour une marque donnée.
 * Applique la normalisation automatiquement.
 * Retourne `/logos/brands/default.svg` si aucun logo connu.
 *
 * @param brand  Nom de la marque (peut être un alias ou une saisie libre)
 * @param base   Base URL (Phase 1 = "/logos/brands", Phase 2 = URL Supabase)
 */
export function getBrandLogoUrl(
  brand: string,
  base = "/logos/brands",
): string {
  const canonical = normalizeBrand(brand);
  const filename = BRAND_LOGO_FILENAMES[canonical];
  if (!filename) return `${base.replace(/\/$/, "")}/default.svg`;
  return `${base.replace(/\/$/, "")}/${filename}`;
}

/**
 * Map brand → URL locale prête à l'emploi pour next/image.
 * Inclut uniquement les marques avec un logo réel (pas le fallback).
 * Utilisez getBrandLogoUrl() pour obtenir le fallback automatiquement.
 */
export const BRAND_LOGO_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_LOGO_FILENAMES)
    .filter((entry): entry is [string, string] => entry[1] != null)
    .map(([brand, filename]) => [brand, `/logos/brands/${filename}`]),
);

/** Retourne l'URL du logo avec fallback sur default.svg — jamais null. */
export function getLogoSrc(brand: string): string {
  return BRAND_LOGO_MAP[normalizeBrand(brand)] ?? FALLBACK_LOGO;
}
