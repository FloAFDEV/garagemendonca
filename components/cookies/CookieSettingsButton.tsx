"use client";

/**
 * CookieSettingsButton
 * ─────────────────────────────────────────────────────────────────────────
 * Micro composant client isolé — le seul bout "use client" du Footer.
 * Consomme uniquement ConsentActionsCtx (jamais re-render après le montage).
 */

import { useConsentActions } from "@/contexts/CookieConsentContext";

export default function CookieSettingsButton() {
  const { openSettings } = useConsentActions();

  return (
    <button
      type="button"
      onClick={openSettings}
      className="hover:text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500 rounded"
    >
      Gérer mes cookies
    </button>
  );
}
