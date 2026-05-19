/**
 * Détecte la couleur dominante d'un véhicule depuis son image principale.
 * Utilise sharp (déjà présent dans les deps) — s'exécute côté serveur uniquement.
 *
 * Résultat : couleur en français ("Gris métallisé", "Noir", "Blanc", etc.)
 * ou null si la détection échoue.
 *
 * Conçu pour être appelé dans un Server Component avec ISR :
 * le calcul est mis en cache et ne s'exécute qu'une fois par période de revalidation.
 */
import sharp from "sharp";

// ─────────────────────────────────────────────
//  RGB → HSL
// ─────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === rn)      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else                 h = ((rn - gn) / d + 4) / 6;

  return [h * 360, s, l];
}

// ─────────────────────────────────────────────
//  Mapping couleur → label français
// ─────────────────────────────────────────────

function mapToFrenchColor(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Achrome
  if (l < 0.12) return "Noir";
  if (l > 0.88) return "Blanc";
  if (s < 0.10) {
    if (l < 0.35) return "Gris anthracite";
    if (l < 0.55) return "Gris";
    return "Gris métallisé";
  }
  if (s < 0.20) return "Argent";

  // Chromatique
  if (h >= 340 || h < 15) return l < 0.35 ? "Bordeaux" : "Rouge";
  if (h < 40)  return l < 0.40 ? "Marron" : "Beige";
  if (h < 70)  return "Jaune";
  if (h < 165) return l < 0.30 ? "Vert foncé" : "Vert";
  if (h < 200) return "Bleu ciel";
  if (h < 260) return l < 0.28 ? "Bleu marine" : "Bleu";
  if (h < 295) return "Violet";
  return "Rose";
}

// ─────────────────────────────────────────────
//  Détection principale
// ─────────────────────────────────────────────

/** Valeurs qui signifient "couleur non connue" */
const UNKNOWN_VALUES = new Set(["", "inconnue", "non renseignée", "n/a", "autre"]);

export function isColorUnknown(color: string | null | undefined): boolean {
  if (!color) return true;
  return UNKNOWN_VALUES.has(color.trim().toLowerCase());
}

/**
 * Télécharge l'image, réduit à 50×50 px, échantillonne le centre
 * (évite ciel/sol) et retourne le label de couleur français.
 * Timeout : 4 s — retourne null en cas d'échec.
 */
export async function detectDominantColor(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());

    // Redimensionner + crop centre (60 % vertical) pour éviter ciel/sol
    const { dominant } = await sharp(buffer)
      .resize(60, 60, { fit: "cover", position: "centre" })
      .extract({ left: 10, top: 12, width: 40, height: 36 }) // centre ≈ 67% de surface
      .stats();

    return mapToFrenchColor(dominant.r, dominant.g, dominant.b);
  } catch {
    return null;
  }
}
