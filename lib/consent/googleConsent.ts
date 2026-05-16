/**
 * lib/consent/googleConsent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Google Consent Mode v2 — initialisation et mise à jour dynamique.
 *
 * Séquence correcte et obligatoire :
 *  1. GOOGLE_CONSENT_INIT_SCRIPT exécuté dans <head> AVANT tout tag tiers
 *     → pose les signaux "denied" sur le dataLayer vide
 *     → GTM/GA4 lisent ces signaux à leur chargement
 *  2. GTM / GA4 se chargent (uniquement après consentement analytics)
 *     → respectent automatiquement les valeurs initiales
 *  3. Après choix utilisateur → updateGoogleConsent() → signal "update"
 *     → GTM/GA activent ou désactivent la collecte sans rechargement
 *
 * Paramètres conformité maximale (RGPD + Google reco) :
 *  - url_passthrough:true     → mesure de conversion sans cookies (modélisation)
 *  - ads_data_redaction:true  → rédaction des identifiants publicitaires en "denied"
 *  - wait_for_update:500      → GTM attend 500ms le signal "update" avant d'envoyer
 *                               (évite la perte de données pour les choix rapides)
 *
 * Référence : https://developers.google.com/tag-platform/security/guides/consent
 */

import type { ConsentState } from "./cookieConsent";

// ─── Types internes ───────────────────────────────────────────────────────────

type GConsentValue = "granted" | "denied";

interface GConsentDefaultParams {
  analytics_storage:       GConsentValue;
  ad_storage:              GConsentValue;
  ad_user_data:            GConsentValue;
  ad_personalization:      GConsentValue;
  functionality_storage:   GConsentValue;
  personalization_storage: GConsentValue;
  security_storage:        GConsentValue;
  wait_for_update:         number;
  url_passthrough:         boolean;
  ads_data_redaction:      boolean;
}

interface GConsentUpdateParams {
  analytics_storage:       GConsentValue;
  ad_storage:              GConsentValue;
  ad_user_data:            GConsentValue;
  ad_personalization:      GConsentValue;
  functionality_storage:   GConsentValue;
  personalization_storage: GConsentValue;
  security_storage:        GConsentValue;
}

// ─── Déclarations globales ────────────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag:      (...args: unknown[]) => void;
  }
}

function gtagPush(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

// ─── Initialisation (script HEAD inline) ─────────────────────────────────────

/**
 * NE PAS appeler côté client React — géré exclusivement par GOOGLE_CONSENT_INIT_SCRIPT.
 * Cette fonction existe uniquement pour la documentation et les tests.
 *
 * Appelée une seule fois via le script inline dans <head> AVANT tout chargement
 * de tag tiers (GTM, GA4). Un double appel à 'consent','default' est incorrect.
 *
 * NON inclus : gtag('js', new Date()) — c'est un appel d'init GA4 spécifique,
 * appartenant au snippet gtag.js, pas au Consent Mode.
 */
export function initGoogleConsent(): void {
  gtagPush("consent", "default", {
    analytics_storage:       "denied",
    ad_storage:              "denied",
    ad_user_data:            "denied",
    ad_personalization:      "denied",
    functionality_storage:   "granted", // cookies auth nécessaires
    personalization_storage: "denied",
    security_storage:        "granted", // cookies session nécessaires
    wait_for_update:         500,       // réduit de 2000 → 500ms (Google reco)
    url_passthrough:         true,      // mesure campagnes sans cookies en denied
    ads_data_redaction:      true,      // rédaction max des identifiants publicitaires
  } satisfies GConsentDefaultParams);
}

// ─── Mise à jour après choix utilisateur ─────────────────────────────────────

/**
 * Signal "update" envoyé après chaque interaction utilisateur (accept/reject/custom).
 * GTM / GA4 activent ou désactivent la collecte en temps réel.
 *
 * Ne jamais appeler 'consent','default' ici — le default ne doit être posé qu'une fois.
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
  } satisfies GConsentUpdateParams);
}

// ─── Script inline <head> ─────────────────────────────────────────────────────

/**
 * Injecter dans <head> AVANT tout tag GTM/GA (et avant les scripts tiers).
 *
 * Ce script :
 *  1. Initialise window.dataLayer
 *  2. Définit la fonction gtag() (raccourci dataLayer.push)
 *  3. Pose les signaux "denied" par défaut (Consent Mode v2)
 *
 * Il NE contient PAS gtag('js', new Date()) — ce n'est pas un signal de consentement,
 * c'est un appel d'init GA4 qui appartient au snippet gtag.js chargé par Analytics.tsx.
 *
 * CSP compatibility :
 *  - Ce script est inline (dangerouslySetInnerHTML).
 *  - Avec 'unsafe-inline' dans script-src (actuel) : fonctionne.
 *  - Pour une CSP stricte sans 'unsafe-inline' (futur hardening) :
 *    Option A — Nonce : lire le nonce depuis headers() dans RootLayout (async),
 *      passer <script nonce={nonce}> + inclure 'nonce-{nonce}' dans middleware CSP.
 *      Inconvénient : RootLayout devient dynamique, perd la mise en cache Vercel Edge.
 *    Option B — Hash (recommandé pour ce cas) : pré-calculer le SHA-256 du script
 *      (immuable), ajouter 'sha256-{hash}' dans buildCsp() de middleware.ts.
 *      Avantage : pages statiques restent cachables, hash stable au fil des déploiements.
 *
 * Usage :
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
  wait_for_update:500,
  url_passthrough:true,
  ads_data_redaction:true
});
`.trim();
