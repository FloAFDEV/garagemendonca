/**
 * lib/consent/googleConsent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Google Consent Mode v2 — initialisation et mise à jour dynamique.
 *
 * Séquence correcte :
 *  1. <head> exécute GOOGLE_CONSENT_INIT_SCRIPT (avant tout tag GTM/GA)
 *  2. GTM / GA4 se charge → respecte automatiquement les valeurs "denied"
 *  3. Après choix utilisateur → updateGoogleConsent() → signaux "update"
 *     → GTM/GA transmettent les données de façon conforme (modélisation)
 *
 * Référence : https://developers.google.com/tag-platform/security/guides/consent
 */

import type { ConsentState } from "./cookieConsent";

// ─── Types internes ───────────────────────────────────────────────────────────

type GConsentValue  = "granted" | "denied";

interface GConsentParams {
  analytics_storage:      GConsentValue;
  ad_storage:             GConsentValue;
  ad_user_data:           GConsentValue;
  ad_personalization:     GConsentValue;
  functionality_storage:  GConsentValue;
  personalization_storage: GConsentValue;
  security_storage:       GConsentValue;
  wait_for_update?:       number;
}

// ─── Déclarations globales (window.gtag / window.dataLayer) ──────────────────

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag:      (...args: unknown[]) => void;
  }
}

function gtagPush(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  // gtag utilise arguments — on push directement dans dataLayer
  window.dataLayer.push(args);
}

// ─── Initialisation (appelée UNE FOIS, avant chargement GTM) ─────────────────

/**
 * Définit le consentement initial à "denied" pour tout tracking.
 * `functionality_storage` et `security_storage` restent "granted"
 * car nécessaires au fonctionnement de l'app (Supabase auth, etc.).
 *
 * `wait_for_update: 2000` = GTM attend 2 s le signal `update` avant
 * d'envoyer les hits, ce qui évite la perte de données si l'utilisateur
 * donne son accord très rapidement.
 */
export function initGoogleConsent(): void {
  gtagPush("consent", "default", {
    analytics_storage:       "denied",
    ad_storage:              "denied",
    ad_user_data:            "denied",
    ad_personalization:      "denied",
    functionality_storage:   "granted", // nécessaires
    personalization_storage: "denied",
    security_storage:        "granted", // nécessaires
    wait_for_update:         2000,
  } satisfies GConsentParams);

  gtagPush("js", new Date());
}

// ─── Mise à jour après choix utilisateur ─────────────────────────────────────

/**
 * Envoie un signal "update" après le choix de l'utilisateur.
 * GTM / GA4 réactivent (ou non) la collecte selon les valeurs.
 */
export function updateGoogleConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;

  const analytics: GConsentValue = state.analytics ? "granted" : "denied";
  const marketing: GConsentValue = state.marketing  ? "granted" : "denied";

  gtagPush("consent", "update", {
    analytics_storage:       analytics,
    ad_storage:              marketing,
    ad_user_data:            marketing,
    ad_personalization:      marketing,
    functionality_storage:   "granted",
    personalization_storage: analytics,
    security_storage:        "granted",
  } satisfies GConsentParams);
}

// ─── Script inline <head> ─────────────────────────────────────────────────────

/**
 * Contenu du script inline à injecter dans <head> AVANT tout tag tiers.
 * Minifié pour limiter le blocking time.
 *
 * Utilisation :
 *   <script dangerouslySetInnerHTML={{ __html: GOOGLE_CONSENT_INIT_SCRIPT }} />
 */
export const GOOGLE_CONSENT_INIT_SCRIPT = /* js */ `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  functionality_storage:'granted',
  personalization_storage:'denied',
  security_storage:'granted',
  wait_for_update:2000
});
gtag('js',new Date());
`.trim();
