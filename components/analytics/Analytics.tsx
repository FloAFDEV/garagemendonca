"use client";

/**
 * components/analytics/Analytics.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Charge GTM et/ou GA4 uniquement APRÈS consentement analytics.
 *
 * Comportement :
 *  - Rien n'est chargé si les ENV vars sont absentes (dev / staging sans tracking)
 *  - Réactif en session : si l'utilisateur accepte après refus initial,
 *    les scripts se chargent immédiatement (sans rechargement page)
 *  - En cas de révocation : Consent Mode update envoie analytics_storage="denied"
 *    → GTM/GA arrêtent d'envoyer des hits sans rechargement (RGPD conforme)
 *  - Google Consent Mode v2 est initialisé dans app/layout.tsx (inline script HEAD)
 *    Ce composant envoie uniquement le signal "update" après choix utilisateur
 *
 * Note CSP : si une CSP script-src est ajoutée, ajouter les domaines :
 *   *.googletagmanager.com *.google-analytics.com *.analytics.google.com
 *
 * Note next/script : une fois qu'un script avec un `id` donné est exécuté,
 *   next/script ne le rechargera pas même si le composant est re-monté.
 *   Les scripts GTM/GA restent actifs en mémoire — Consent Mode les contrôle.
 */

import Script from "next/script";
import { useEffect, useRef } from "react";
import { useConsentState } from "@/contexts/CookieConsentContext";
import { updateGoogleConsent } from "@/lib/consent/googleConsent";

const GA_ID  = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CONSENT_MODE_ENABLED =
  process.env.NEXT_PUBLIC_GOOGLE_CONSENT_MODE !== "false";

export default function Analytics() {
  const { consent } = useConsentState();

  // Ref pour tracker la dernière valeur connue et éviter les appels redondants
  const prevAnalytics = useRef<boolean | null>(null);
  const prevMarketing = useRef<boolean | null>(null);

  /**
   * Synchronise Google Consent Mode à chaque changement de consentement.
   * Dépendances primitives (bool + bool + bool) → effet relancé uniquement
   * si une valeur change réellement, pas sur chaque re-render.
   */
  useEffect(() => {
    if (!CONSENT_MODE_ENABLED) return;
    if (!consent.consentGiven) return;

    const analyticsChanged = prevAnalytics.current !== consent.analytics;
    const marketingChanged = prevMarketing.current !== consent.marketing;
    if (!analyticsChanged && !marketingChanged) return;

    prevAnalytics.current = consent.analytics;
    prevMarketing.current = consent.marketing;
    updateGoogleConsent(consent);
  }, [consent.analytics, consent.marketing, consent.consentGiven]); // primitives, pas l'objet entier

  // Rien à charger si aucune clé configurée
  if (!GA_ID && !GTM_ID) return null;

  // Scripts trackants bloqués jusqu'au consentement analytics
  if (!consent.analytics) return null;

  return (
    <>
      {/* ── Google Tag Manager ────────────────────────────────────────────── */}
      {GTM_ID && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      )}

      {/* ── Google Analytics 4 direct (sans GTM) ─────────────────────────── */}
      {GA_ID && !GTM_ID && (
        <>
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              // Note : anonymize_ip est une option UA obsolète, ignorée par GA4.
              // GA4 anonymise l'IP par défaut — aucun flag requis.
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
            }}
          />
        </>
      )}
    </>
  );
}
