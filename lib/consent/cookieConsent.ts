/**
 * lib/consent/cookieConsent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Source de vérité pour le stockage du consentement RGPD.
 *
 * Stockage : cookie (pas localStorage)
 *  → lisible côté serveur (Server Components, middleware)
 *  → survit aux navigations cross-page sans hydratation JS
 *  → compatible SameSite=Lax; Secure
 *  → Max-Age déclaratif = expiration garantie sans JS côté client
 *
 * Versioning : CONSENT_VERSION = 1
 *  → stocker dans le payload JSON (pas dans le nom du cookie)
 *  → incrémenter ici quand les catégories évoluent
 *  → l'ancien cookie est invalidé et la bannière réaffichée automatiquement
 */

export const CONSENT_COOKIE_KEY  = "cookieConsent" as const;
export const CONSENT_VERSION      = 1;
export const CONSENT_MAX_AGE_SEC  = 60 * 60 * 24 * 180; // 180 jours = 6 mois (CNIL max)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConsentState {
  /** Version du schéma — invalide les anciens consentements si incrémenté */
  version:      number;
  /** Toujours true — cookies techniques Supabase, Next.js, session */
  necessary:    true;
  /** Google Analytics 4, mesure d'audience anonymisée */
  analytics:    boolean;
  /** Google Ads, remarketing, pixels publicitaires */
  marketing:    boolean;
  /** ISO 8601 — horodatage légal du consentement */
  timestamp:    string;
  /** false = bannière jamais interagie ; true = choix effectué */
  consentGiven: boolean;
}

/** Consentement par défaut (état initial avant toute interaction) */
export const DEFAULT_CONSENT: ConsentState = {
  version:      CONSENT_VERSION,
  necessary:    true,
  analytics:    false,
  marketing:    false,
  timestamp:    "",
  consentGiven: false,
};

// ─── Lecture ──────────────────────────────────────────────────────────────────

/**
 * Lit le consentement depuis document.cookie.
 * Retourne `null` si absent, malformé, ou version différente.
 * Client-side uniquement.
 */
export function readConsentCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_COOKIE_KEY}=`));
    if (!match) return null;

    const raw    = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(raw) as ConsentState;

    // Version différente → force réaffichage de la bannière
    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed;
  } catch {
    return null;
  }
}

// ─── Écriture ─────────────────────────────────────────────────────────────────

/**
 * Persiste le consentement dans document.cookie.
 *
 * Format correct :
 *   cookieConsent=<json>; Max-Age=15552000; Path=/; SameSite=Lax; Secure
 *
 * FIX : "Secure" sans le "; " préfixé pour éviter le double séparateur
 *       dans le .join("; ") → "SameSite=Lax; ; Secure" était le bug.
 */
export function writeConsentCookie(state: ConsentState): void {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(state));

  // "Secure" (sans "; " préfixé) — le .join("; ") ci-dessous ajoute le séparateur
  const secure = location.protocol === "https:" ? "Secure" : "";

  document.cookie = [
    `${CONSENT_COOKIE_KEY}=${value}`,
    `Max-Age=${CONSENT_MAX_AGE_SEC}`,
    "Path=/",
    "SameSite=Lax",
    secure,
  ]
    .filter(Boolean) // supprime "" (Secure absent en HTTP/localhost)
    .join("; ");
}

// ─── Suppression ──────────────────────────────────────────────────────────────

/** Efface le cookie de consentement (tests, reset RGPD) */
export function clearConsentCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_KEY}=; Max-Age=0; Path=/`;
}
