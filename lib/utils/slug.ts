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
