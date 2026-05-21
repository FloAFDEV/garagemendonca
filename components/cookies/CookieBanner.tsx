"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useConsentState, useConsentActions } from "@/contexts/CookieConsentContext";

/**
 * CookieBanner
 * ─────────────────────────────────────────────────────────────────────────
 * Bannière RGPD fixe en bas de page.
 *
 * UX :
 *  - Logo + nom du garage pour identifier la source du consentement
 *  - Safe-area iPhone via paddingBottom CSS max(1rem, env(safe-area-inset-bottom))
 *    → nécessite viewport-fit=cover dans le Viewport export de layout.tsx
 *  - z-[55] : au-dessus du header (z-50) et des dropdowns (z-50)
 *
 * Accessibilité (WCAG 2.1) :
 *  - role="region" + aria-label → identifiable dans les landmarks
 *  - Focus déplacé vers le bouton primaire à l'apparition (WCAG 2.4.3)
 *  - Ordre tab DOM cohérent avec l'ordre visuel desktop
 *
 * Performance :
 *  - Consomme ConsentStateCtx et ConsentActionsCtx séparément
 *    → pas de re-render si seulement isSettingsOpen change
 */
export default function CookieBanner() {
  const { showBanner }                          = useConsentState();
  const { acceptAll, rejectAll, openSettings }  = useConsentActions();
  const pathname                                = usePathname();

  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showBanner) {
      requestAnimationFrame(() => primaryBtnRef.current?.focus());
    }
  }, [showBanner]);

  // Pas de bannière RGPD sur les pages admin/auth — pas de tracking tiers
  if (!showBanner || pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  return (
    <div
      role="region"
      aria-label="Consentement cookies"
      className={clsx(
        "fixed bottom-0 inset-x-0 z-[55]",
        "px-3 sm:px-6",
        "animate-slide-up",
      )}
      // Safe-area iPhone : env(safe-area-inset-bottom) évite que la bannière
      // soit coupée par le home indicator. Requiert viewport-fit=cover.
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={clsx(
          "mx-auto max-w-3xl",
          "bg-white rounded-2xl shadow-2xl border border-slate-200/80",
          "px-4 py-4 sm:px-5 sm:py-4",
        )}
      >
        {/* Header de la bannière */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

          {/* Logo + identité */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-slate-200 flex-shrink-0">
              <Image
                src="/images/logo-gm.webp"
                alt="Garage Mendonça"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="font-medium text-sm text-slate-800 whitespace-nowrap">
              Garage Mendonca
            </span>
            {/* Séparateur vertical — visible uniquement sur sm+ */}
            <span className="hidden sm:block w-px h-4 bg-slate-200 flex-shrink-0" aria-hidden="true" />
          </div>

          {/* Texte informatif */}
          <p className="text-xs text-slate-500 leading-relaxed min-w-0">
            Nous utilisons des cookies pour améliorer votre expérience et
            analyser notre trafic.{" "}
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

        {/* Actions
            Ordre DOM (tab) : Tout refuser → Paramétrer → Tout accepter
            Ordre visuel mobile  : Tout accepter (order-1) · Paramétrer (order-2) · Tout refuser (order-3)
            Ordre visuel desktop : Tout refuser (order-1) · Paramétrer (order-2) · Tout accepter (order-3)
        */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
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
