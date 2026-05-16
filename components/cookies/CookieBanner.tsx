"use client";

import { useEffect, useRef } from "react";
import { Cookie } from "lucide-react";
import clsx from "clsx";
import { useConsentState, useConsentActions } from "@/contexts/CookieConsentContext";

/**
 * CookieBanner
 * ─────────────────────────────────────────────────────────────────────────
 * Bannière RGPD fixe en bas de page.
 *
 * Accessibilité :
 *  - role="region" + aria-label pour être identifiable dans les landmarks
 *  - Focus déplacé vers le bouton primaire à l'apparition (WCAG 2.4.3)
 *  - Tous les boutons ont du texte visible + focus-visible ring
 *
 * Performance :
 *  - useConsentState() et useConsentActions() consomment deux contextes séparés
 *    → pas de re-render si seul isSettingsOpen change (ouverture modale)
 */
export default function CookieBanner() {
  const { showBanner }                     = useConsentState();
  const { acceptAll, rejectAll, openSettings } = useConsentActions();

  // Focus management : déplace le focus vers le bouton primaire à l'apparition
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showBanner) {
      // requestAnimationFrame garantit que le DOM est peint avant le focus
      requestAnimationFrame(() => primaryBtnRef.current?.focus());
    }
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Consentement cookies"
      className={clsx(
        "fixed bottom-0 inset-x-0 z-50",
        "px-4 pb-4 sm:px-6 sm:pb-6",
        "animate-slide-up",
      )}
    >
      <div
        className={clsx(
          "mx-auto max-w-3xl",
          "bg-white rounded-2xl shadow-2xl border border-slate-200/80",
          "px-5 py-5 sm:px-6",
        )}
      >
        {/* Contenu */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Icône décorative */}
          <div
            className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-500/10 items-center justify-center flex-shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <Cookie size={18} className="text-brand-500" />
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 mb-1">
              Ce site utilise des cookies
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience,
              analyser notre trafic et diffuser des annonces personnalisées.
              Vous pouvez choisir les catégories que vous acceptez.{" "}
              <button
                type="button"
                onClick={openSettings}
                className={clsx(
                  "underline underline-offset-2 hover:text-brand-500 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded",
                )}
              >
                En savoir plus
              </button>
            </p>
          </div>
        </div>

        {/* Actions
            Ordre DOM = ordre de tab (lisible) : Refuser → Paramétrer → Accepter
            Ordre visuel mobile : Accepter en haut (order-1), Refuser en bas (order-3)
            Ordre visuel desktop : Refuser | Paramétrer | Accepter (order-1/2/3)
        */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={rejectAll}
            className={clsx(
              "order-3 sm:order-1 py-2.5 px-4 rounded-xl text-xs font-medium",
              "border border-slate-200 text-slate-500",
              "hover:bg-slate-50 hover:border-slate-300",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            )}
          >
            Tout refuser
          </button>

          <button
            type="button"
            onClick={openSettings}
            className={clsx(
              "order-2 py-2.5 px-4 rounded-xl text-xs font-medium",
              "border border-slate-300 text-slate-700",
              "hover:bg-slate-50",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            )}
          >
            Paramétrer
          </button>

          <button
            ref={primaryBtnRef}
            type="button"
            onClick={acceptAll}
            className={clsx(
              "order-1 sm:order-3 py-2.5 px-5 rounded-xl text-xs font-medium",
              "bg-brand-500 text-white hover:bg-brand-600",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            )}
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
