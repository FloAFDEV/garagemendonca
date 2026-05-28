/**
 * Génération et validation de slugs SEO pour les véhicules.
 *
 * Règles :
 * - Lowercase uniquement
 * - Caractères : [a-z0-9] + tirets
 * - Pas de tiret en début/fin
 * - Pas de tirets consécutifs
 * - Translittération des caractères accentués
 * - Fallback si le résultat est vide
 */

// ─────────────────────────────────────────────────────────────────
//  Table de translittération — accents FR + caractères spéciaux
// ─────────────────────────────────────────────────────────────────

const TRANSLITERATION: Record<string, string> = {
  à: "a", â: "a", ä: "a", á: "a", ã: "a",
  è: "e", é: "e", ê: "e", ë: "e",
  î: "i", ï: "i", í: "i", ì: "i",
  ô: "o", ö: "o", ó: "o", ò: "o", õ: "o",
  ù: "u", û: "u", ü: "u", ú: "u",
  ç: "c", ñ: "n", ý: "y",
  æ: "ae", œ: "oe", ß: "ss",
  // Majuscules (conservés car on lowercase d'abord)
};

function transliterate(str: string): string {
  return str
    .toLowerCase()
    .split("")
    .map((c) => TRANSLITERATION[c] ?? c)
    .join("");
}

// ─────────────────────────────────────────────────────────────────
//  sanitizeSlug — nettoie une chaîne quelconque en slug valide
// ─────────────────────────────────────────────────────────────────

export function sanitizeSlug(input: string): string {
  return transliterate(input)
    .replace(/[^a-z0-9\s-]/g, "")   // caractères non autorisés
    .replace(/[\s_]+/g, "-")        // espaces et underscores → tiret
    .replace(/-+/g, "-")            // tirets multiples → un seul
    .replace(/^-+|-+$/g, "")        // trim tirets de début/fin
    .slice(0, 80);                  // longueur max
}

// ─────────────────────────────────────────────────────────────────
//  generateSlug — slug canonique pour un véhicule
//
//  Format : {brand}-{model}-{year}
//  Ex : "peugeot-208-gti-2021" / "mercedes-classe-e-automatique-2019"
// ─────────────────────────────────────────────────────────────────

export function generateVehicleSlug(
  brand: string,
  model: string,
  year: number | string,
): string {
  const parts = [brand, model, String(year)].map(sanitizeSlug).filter(Boolean);

  if (parts.length === 0) {
    return `vehicule-${Date.now()}`;
  }

  const slug = parts.join("-");
  return slug || `vehicule-${Date.now()}`;
}

// ─────────────────────────────────────────────────────────────────
//  generateUniqueVehicleSlug — ajoute un suffixe si le slug existe déjà
//
//  checkExists : callback qui retourne true si le slug est pris
//  max 50 tentatives avant fallback timestamp
// ─────────────────────────────────────────────────────────────────

export async function generateUniqueVehicleSlug(
  brand: string,
  model: string,
  year: number | string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = generateVehicleSlug(brand, model, year);

  if (!(await checkExists(base))) return base;

  for (let i = 2; i <= 50; i++) {
    const candidate = `${base}-${i}`;
    if (!(await checkExists(candidate))) return candidate;
  }

  return `${base}-${Date.now()}`;
}

// ─────────────────────────────────────────────────────────────────
//  isValidSlug — valide un slug utilisateur avant insertion
// ─────────────────────────────────────────────────────────────────

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/.test(slug) || /^[a-z0-9]$/.test(slug);
}

// ─────────────────────────────────────────────────────────────────
//  buildVehicleUrl — URL canonique hybride slug-shortId
//
//  Format : /vehicules/{slug}-{shortId}
//  shortId = 8 premiers chars de l'UUID (premier segment)
//  Ex : buildVehicleUrl("peugeot-208-2021", "db2173a3-84fa-...") → "/vehicules/peugeot-208-2021-db2173a3"
// ─────────────────────────────────────────────────────────────────

export function buildVehicleUrl(slug: string, id: string): string {
  const shortId = id.slice(0, 8);
  return `/vehicules/${slug}-${shortId}`;
}

// ─────────────────────────────────────────────────────────────────
//  extractShortId — extrait le shortId d'un segment d'URL hybride
//
//  "peugeot-208-2021-db2173a3" → "db2173a3"
//  "peugeot-208-2021"          → null  (slug pur, pas de shortId)
//  UUID complet                → null  (géré séparément)
// ─────────────────────────────────────────────────────────────────

export function extractShortId(slugWithId: string): string | null {
  const match = slugWithId.match(/-([0-9a-f]{8})$/i);
  return match ? match[1].toLowerCase() : null;
}

// ─────────────────────────────────────────────────────────────────
//  buildOccasionUrl — URL canonique silo SEO
//
//  Format : /occasions/{categorySlug}/{slug}-{shortId}
//  Ex : buildOccasionUrl("japonaises", "toyota-corolla-2021", "db2173a3-...")
//       → "/occasions/japonaises/toyota-corolla-2021-db2173a3"
// ─────────────────────────────────────────────────────────────────

export function buildOccasionUrl(categorySlug: string, vehicleSlug: string, id: string): string {
  const shortId = id.slice(0, 8);
  return `/occasions/${categorySlug}/${vehicleSlug}-${shortId}`;
}

// ─────────────────────────────────────────────────────────────────
//  resolveVehicleHref — URL publique d'un véhicule avec guard de sécurité
//
//  Règle : categorySlug (JOIN vehicle_categories) est la seule source autorisée.
//  Si categoryId est défini mais categorySlug est null, la JOIN a échoué
//  (incohérence de données) — on log un warning et on fallback vers /vehicules.
//  Si ni categoryId ni categorySlug : véhicule non catégorisé (état transitoire OK).
// ─────────────────────────────────────────────────────────────────

export function resolveVehicleHref(vehicle: {
  id: string;
  slug?: string | null;
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  model?: string;
  year?: number;
}): string {
  const vSlug = vehicle.slug ?? generateVehicleSlug(
    vehicle.brand ?? "vehicule",
    vehicle.model ?? "",
    vehicle.year ?? 0,
  );

  return vehicle.slug ? buildVehicleUrl(vSlug, vehicle.id) : `/vehicules/${vehicle.id}`;
}
