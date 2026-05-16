"use client";

/**
 * contexts/CookieConsentContext.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Deux contextes séparés pour éviter les rerenders en cascade :
 *
 *  ┌─ ConsentStateCtx  ──────────────────────────────────────────────────┐
 *  │  consent, showBanner, isSettingsOpen                                │
 *  │  → change quand l'utilisateur interagit ou que le cookie est lu     │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ ConsentActionsCtx ─────────────────────────────────────────────────┐
 *  │  acceptAll, rejectAll, saveCustom, openSettings, closeSettings      │
 *  │  → callbacks stables (useCallback sans dépendances instables)       │
 *  │  → jamais recréés → composants qui consomment uniquement les actions│
 *  │    (ex: Footer "Gérer mes cookies") ne re-rendent jamais             │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 * Usage recommandé :
 *   const { showBanner }  = useConsentState();   // état uniquement
 *   const { openSettings } = useConsentActions(); // actions uniquement
 *   const { consent, acceptAll } = useConsent(); // les deux (composants complexes)
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  useCookieConsent,
  type ConsentStateSlice,
  type ConsentActionsSlice,
  type UseCookieConsentReturn,
} from "@/hooks/useCookieConsent";
import type { ConsentState } from "@/lib/consent/cookieConsent";

// ─── Contextes ────────────────────────────────────────────────────────────────

const ConsentStateCtx   = createContext<ConsentStateSlice   | null>(null);
const ConsentActionsCtx = createContext<ConsentActionsSlice | null>(null);

// ─── Hooks publics ────────────────────────────────────────────────────────────

export function useConsentState(): ConsentStateSlice {
  const ctx = useContext(ConsentStateCtx);
  if (!ctx) throw new Error("useConsentState() doit être utilisé dans <CookieConsentProvider>");
  return ctx;
}

export function useConsentActions(): ConsentActionsSlice {
  const ctx = useContext(ConsentActionsCtx);
  if (!ctx) throw new Error("useConsentActions() doit être utilisé dans <CookieConsentProvider>");
  return ctx;
}

/** Accès combiné état + actions (pour CookieBanner, CookieSettingsModal) */
export function useConsent(): UseCookieConsentReturn {
  const state   = useConsentState();
  const actions = useConsentActions();
  return { ...state, ...actions };
}

/** Lecture directe de l'état de consentement (pour Analytics) */
export function useConsent_stateOnly(): ConsentState {
  return useConsentState().consent;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const {
    consent, showBanner, isSettingsOpen,
    acceptAll, rejectAll, saveCustom, openSettings, closeSettings,
  } = useCookieConsent();

  // État mémoïsé : re-render seulement quand l'état change réellement
  const stateValue = useMemo<ConsentStateSlice>(
    () => ({ consent, showBanner, isSettingsOpen }),
    [consent, showBanner, isSettingsOpen],
  );

  // Actions mémoïsées : toutes stables (useCallback sans deps instables)
  // useMemo ici pour créer un objet stable entre les renders du Provider
  const actionsValue = useMemo<ConsentActionsSlice>(
    () => ({ acceptAll, rejectAll, saveCustom, openSettings, closeSettings }),
    [acceptAll, rejectAll, saveCustom, openSettings, closeSettings],
  );

  return (
    <ConsentStateCtx.Provider value={stateValue}>
      <ConsentActionsCtx.Provider value={actionsValue}>
        {children}
      </ConsentActionsCtx.Provider>
    </ConsentStateCtx.Provider>
  );
}
