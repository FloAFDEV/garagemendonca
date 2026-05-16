/**
 * lib/consent/cookieConsent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Source de vérité pour le stockage du consentement RGPD.
 *
 * Choix de stockage : COOKIE (pas localStorage)
 *  → peut être lu côté serveur (Server Components, middleware)
 *  → survit aux navigations cross-page sans hydratation JS
 *  → compatible `SameSite=Lax; Secure` pour la sécurité
 *  → Max-Age déclaratif = expiration garantie sans code JS côté client
 *
 * Versioning : cookieConsent_v1
 *  → en cas d'évolution des catégories, incrémenter CONSENT_VERSION
 *  → l'ancien cookie sera ignoré et la bannière réaffichée
 */

export const CONSENT_COOKIE_KEY  = "cookieConsent_v1" as const;
export const CONSENT_VERSION      = 1;
export const CONSENT_MAX_AGE_SEC  = 60 * 60 * 24 * 180; // 180 jours ≈ 6 mois

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConsentState {
  /** Version du schéma — pour invalider les anciens consentements */
  version: number;
  /** Toujours true — cookies techniques Supabase, Next.js */
  necessary: true;
  /** Google Analytics, mesure d'audience anonymisée */
  analytics: boolean;
  /** Google Ads, remarketing, pixels Meta */
  marketing: boolean;
  /** ISO 8601 — horodatage légal du consentement */
  timestamp: string;
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
 * Retourne `null` si absent, malformé ou version différente.
 * Appelable uniquement côté client (typeof document !== "undefined").
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

    // Invalide si version différente → force réaffichage de la bannière
    if (parsed.version !== CONSENT_VERSION) return null;

    return parsed;
  } catch {
    return null;
  }
}

// ─── Écriture ─────────────────────────────────────────────────────────────────

/**
 * Persiste le consentement dans document.cookie.
 * `Secure` uniquement en HTTPS (localhost reste fonctionnel).
 */
export function writeConsentCookie(state: ConsentState): void {
  if (typeof document === "undefined") return;

  const value  = encodeURIComponent(JSON.stringify(state));
  const secure = location.protocol === "https:" ? "; Secure" : "";

  document.cookie = [
    `${CONSENT_COOKIE_KEY}=${value}`,
    `Max-Age=${CONSENT_MAX_AGE_SEC}`,
    "Path=/",
    "SameSite=Lax",
    secure,
  ]
    .filter(Boolean)
    .join("; ");
}

// ─── Suppression (tests / reset) ──────────────────────────────────────────────

export function clearConsentCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_KEY}=; Max-Age=0; Path=/`;
}
