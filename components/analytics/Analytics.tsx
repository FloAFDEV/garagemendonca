"use client";

/**
 * components/analytics/Analytics.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Charge GTM OU GA4 après consentement analytics — JAMAIS les deux.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  RÈGLE ABSOLUE : GTM ET GA4 simultanés = double tracking              │
 * │                                                                         │
 * │  Problèmes si GTM + GA4 standalone coexistent :                         │
 * │   - page_view envoyé 2× (GTM fire + gtag config)                        │
 * │   - events dupliqués dans GA4 DebugView                                 │
 * │   - signaux Consent Mode incohérents (deux sources)                     │
 * │   - attribution revenue x2 dans Google Ads                             │
 * │                                                                         │
 * │  Règle de priorité (configurée dans .env.local) :                       │
 * │   1. GTM_ID défini → GTM chargé, GA4 ignoré même si GA_ID présent     │
 * │   2. GA_ID défini, GTM_ID absent → GA4 direct chargé                  │
 * │   3. Aucun → rien chargé                                                │
 * │                                                                         │
 * │  Recommandation : utiliser GTM uniquement.                              │
 * │  GA4 est configuré dans GTM (tag "Google Analytics: GA4 Config").       │
 * │  Avantages GTM : pixels futurs, Ads, conversion tracking, A/B tests,   │
 * │  tout sans toucher au code.                                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Ordre d'exécution dans le HEAD (vérifié dans app/layout.tsx) :
 *   1. Script inline Consent Mode → gtag('consent','default', {denied})
 *   2. [React hydration]
 *   3. useEffect → readConsentCookie → si consent: updateGoogleConsent('update')
 *   4. afterInteractive → GTM script chargé (si analytics accepté)
 *   5. GTM → charge GA4 tag si analytics_storage='granted'
 *
 * Cas "JS désactivé" :
 *   - Aucun script ne charge → aucun cookie non nécessaire → conforme RGPD ✓
 *   - Le noscript GTM iframe (tracking sans JS) n'est PAS injecté ici car :
 *     (a) Next.js App Router ne permet pas d'injecter après <body> depuis layout
 *     (b) Le noscript contourne le consentement → non conforme RGPD
 *     (c) < 0.5% des visiteurs ont JS désactivé
 *
 * CSP requise (voir middleware.ts) :
 *   script-src  : https://www.googletagmanager.com
 *   connect-src : https://www.google-analytics.com https://analytics.google.com
 *                 https://stats.g.doubleclick.net https://www.googletagmanager.com
 *   img-src     : https://www.google-analytics.com
 */

import Script from "next/script";
import { useEffect, useRef } from "react";
import { useConsentState } from "@/contexts/CookieConsentContext";
import { updateGoogleConsent } from "@/lib/consent/googleConsent";

// ─── Configuration ────────────────────────────────────────────────────────────

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || null;
const GA_ID  = process.env.NEXT_PUBLIC_GA_ID?.trim()  || null;
const CONSENT_MODE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_CONSENT_MODE !== "false";

/**
 * Détermine la stratégie de chargement à la compilation.
 * GTM est prioritaire — si GTM_ID est défini, GA_ID est ignoré.
 *
 * Cette constante est évaluée une seule fois au niveau module (stable).
 */
const STRATEGY = GTM_ID
  ? ("gtm" as const)
  : GA_ID
    ? ("ga4" as const)
    : ("none" as const);

// ─── Warning de configuration en développement ────────────────────────────────

if (process.env.NODE_ENV === "development" && GTM_ID && GA_ID) {
  console.warn(
    "[Analytics] ⚠️ GTM_ID et GA_ID sont tous les deux définis.\n" +
    "  GTM est prioritaire — GA_ID sera IGNORÉ.\n" +
    "  Pour éviter ce warning : retirer NEXT_PUBLIC_GA_ID de .env.local\n" +
    "  et configurer GA4 directement dans GTM (tag GA4 Configuration).",
  );
}

if (process.env.NODE_ENV === "development" && STRATEGY !== "none") {
  console.info(
    `[Analytics] Stratégie : ${STRATEGY === "gtm" ? `GTM (${GTM_ID})` : `GA4 direct (${GA_ID})`}`,
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { consent } = useConsentState();

  // Refs pour éviter les appels redondants à updateGoogleConsent
  const prevAnalytics = useRef<boolean | null>(null);
  const prevMarketing = useRef<boolean | null>(null);

  /**
   * Synchronise les signaux Google Consent Mode à chaque changement.
   * Dépendances primitives → effet relancé uniquement si une valeur change,
   * pas sur chaque re-render (évite les doublons avec saveConsent).
   */
  useEffect(() => {
    if (!CONSENT_MODE_ENABLED) return;
    if (!consent.consentGiven)  return;

    const analyticsChanged = prevAnalytics.current !== consent.analytics;
    const marketingChanged  = prevMarketing.current !== consent.marketing;
    if (!analyticsChanged && !marketingChanged) return;

    prevAnalytics.current = consent.analytics;
    prevMarketing.current = consent.marketing;
    updateGoogleConsent(consent);
  }, [consent.analytics, consent.marketing, consent.consentGiven]);

  // Aucun provider configuré → rien à charger (stable : constante build-time)
  if (STRATEGY === "none") return null;

  // ── Toujours retourner le même fragment container ─────────────────────────
  //
  // NE PAS utiliser `if (!consent.analytics) return null;` ici.
  // Basculer entre null et <></> change la structure des enfants dans l'arbre
  // React, ce qui déclenche l'erreur de réconciliation :
  // "The children should not have changed if we pass in the same set."
  //
  // Solution : retourner toujours <></> (container stable), et conditionner
  // le chargement des scripts DANS le fragment via l'opérateur &&.
  // Quand consent.analytics=false, le fragment est vide mais stable.
  return (
    <>
      {/* ── Stratégie GTM (recommandée) ───────────────────────────────────── */}
      {consent.analytics && STRATEGY === "gtm" && (
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){
w[l]=w[l]||[];
w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      )}

      {/* ── Stratégie GA4 direct (fallback sans GTM) ─────────────────────── */}
      {consent.analytics && STRATEGY === "ga4" && (
        <Script
          id="ga4-lib"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
      )}
      {consent.analytics && STRATEGY === "ga4" && (
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_ID}');`.trim(),
          }}
        />
      )}
    </>
  );
}
