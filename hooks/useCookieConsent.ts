"use client";

/**
 * hooks/useCookieConsent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Hook interne — utilisé uniquement par CookieConsentProvider.
 *
 * Architecture :
 *  - État et actions exposés via deux interfaces séparées pour permettre
 *    un split de contexte (évite les rerenders en cascade).
 *  - saveCustom utilise un functional updater setState pour ne pas dépendre
 *    de `consent` → actions stables entre les renders.
 */

import { useState, useCallback, useEffect } from "react";
import {
  readConsentCookie,
  writeConsentCookie,
  DEFAULT_CONSENT,
  CONSENT_VERSION,
  type ConsentState,
} from "@/lib/consent/cookieConsent";
import { initGoogleConsent, updateGoogleConsent } from "@/lib/consent/googleConsent";

// ─── Interfaces publiques ─────────────────────────────────────────────────────

export interface ConsentStateSlice {
  consent:        ConsentState;
  /** true uniquement après montage ET si aucun choix n'a été effectué */
  showBanner:     boolean;
  isSettingsOpen: boolean;
}

export interface ConsentActionsSlice {
  acceptAll:    () => void;
  rejectAll:    () => void;
  saveCustom:   (partial: Partial<Pick<ConsentState, "analytics" | "marketing">>) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

/** Retour complet du hook — utilisé par le Provider pour alimenter les deux contexts */
export interface UseCookieConsentReturn extends ConsentStateSlice, ConsentActionsSlice {}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCookieConsent(): UseCookieConsentReturn {
  const [consent,        setConsent]        = useState<ConsentState>(DEFAULT_CONSENT);
  const [mounted,        setMounted]        = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Lecture du cookie au montage ──────────────────────────────────────────
  useEffect(() => {
    initGoogleConsent(); // signaux "denied" avant tout tag tiers

    const stored = readConsentCookie();
    if (stored) {
      setConsent(stored);
      if (stored.consentGiven) {
        updateGoogleConsent(stored); // restaure les signaux si déjà consenti
      }
    }
    setMounted(true);
  }, []);

  // ── saveConsent : écriture cookie + mise à jour état + signaux Google ─────
  const saveConsent = useCallback((next: ConsentState) => {
    const withTs: ConsentState = { ...next, timestamp: new Date().toISOString() };
    writeConsentCookie(withTs);
    setConsent(withTs);
    updateGoogleConsent(withTs);
  }, []); // stable — aucune dépendance externe

  // ── Actions ───────────────────────────────────────────────────────────────

  const acceptAll = useCallback(() => {
    saveConsent({
      version:      CONSENT_VERSION,
      necessary:    true,
      analytics:    true,
      marketing:    true,
      timestamp:    "",
      consentGiven: true,
    });
    setIsSettingsOpen(false);
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({
      version:      CONSENT_VERSION,
      necessary:    true,
      analytics:    false,
      marketing:    false,
      timestamp:    "",
      consentGiven: true,
    });
    setIsSettingsOpen(false);
  }, [saveConsent]);

  /**
   * saveCustom utilise un functional updater pour lire le state courant
   * sans le mettre en dépendance de useCallback → la référence est stable.
   */
  const saveCustom = useCallback(
    (partial: Partial<Pick<ConsentState, "analytics" | "marketing">>) => {
      setConsent((prev) => {
        const next: ConsentState = {
          ...prev,
          ...partial,
          version:      CONSENT_VERSION,
          necessary:    true,
          consentGiven: true,
          timestamp:    new Date().toISOString(),
        };
        writeConsentCookie(next);
        updateGoogleConsent(next);
        return next;
      });
      setIsSettingsOpen(false);
    },
    [], // ← stable : pas de dépendance sur consent
  );

  const openSettings  = useCallback(() => setIsSettingsOpen(true),  []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return {
    // state
    consent,
    showBanner:    mounted && !consent.consentGiven,
    isSettingsOpen,
    // actions
    acceptAll,
    rejectAll,
    saveCustom,
    openSettings,
    closeSettings,
  };
}
