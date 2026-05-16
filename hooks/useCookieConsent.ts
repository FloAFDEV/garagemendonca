"use client";

/**
 * hooks/useCookieConsent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Hook interne — utilisé uniquement par CookieConsentProvider.
 *
 * Architecture :
 *  - État et actions exposés via deux interfaces séparées (split de contexte)
 *  - saveCustom utilise un consentRef pour accéder au state courant sans
 *    mettre consent en dépendance de useCallback → action stable
 *  - Aucun side-effect dans un setState updater (React StrictMode safe)
 *  - initGoogleConsent() N'est PAS appelé ici — il est géré exclusivement
 *    par le script inline dans <head> (GOOGLE_CONSENT_INIT_SCRIPT).
 *    Appeler initGoogleConsent() ici provoquerait un double gtag('consent','default').
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  readConsentCookie,
  writeConsentCookie,
  DEFAULT_CONSENT,
  CONSENT_VERSION,
  type ConsentState,
} from "@/lib/consent/cookieConsent";
import { updateGoogleConsent } from "@/lib/consent/googleConsent";

// ─── Interfaces publiques ─────────────────────────────────────────────────────

export interface ConsentStateSlice {
  consent:        ConsentState;
  /** true uniquement après montage ET si aucun choix n'a jamais été effectué */
  showBanner:     boolean;
  isSettingsOpen: boolean;
}

export interface ConsentActionsSlice {
  acceptAll:     () => void;
  rejectAll:     () => void;
  saveCustom:    (partial: Partial<Pick<ConsentState, "analytics" | "marketing">>) => void;
  openSettings:  () => void;
  closeSettings: () => void;
}

export interface UseCookieConsentReturn extends ConsentStateSlice, ConsentActionsSlice {}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCookieConsent(): UseCookieConsentReturn {
  const [consent,        setConsent]        = useState<ConsentState>(DEFAULT_CONSENT);
  const [mounted,        setMounted]        = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /**
   * consentRef : référence stable vers le consent courant.
   * Utilisé par saveCustom pour éviter une dépendance sur consent dans useCallback.
   * Mis à jour via useEffect synchronisé avec le state.
   */
  const consentRef = useRef<ConsentState>(DEFAULT_CONSENT);

  // Sync ref avec state
  useEffect(() => {
    consentRef.current = consent;
  }, [consent]);

  // ── Lecture du cookie au montage ──────────────────────────────────────────
  useEffect(() => {
    // NE PAS appeler initGoogleConsent() ici.
    // Le script inline GOOGLE_CONSENT_INIT_SCRIPT dans <head> l'a déjà fait
    // avant même le chargement de React. Un double appel enverrait deux
    // gtag('consent','default') ce qui est incorrect.

    const stored = readConsentCookie();
    if (stored) {
      setConsent(stored);
      // Restaure les signaux Google si l'utilisateur avait déjà consenti
      if (stored.consentGiven) {
        updateGoogleConsent(stored);
      }
    }
    setMounted(true);
  }, []);

  // ── saveConsent : helper interne — écriture atomique ─────────────────────
  /**
   * Gère atomiquement : cookie + state + signal Google.
   * Stable car aucune dépendance externe.
   */
  const saveConsent = useCallback((next: ConsentState) => {
    const withTs: ConsentState = { ...next, timestamp: new Date().toISOString() };
    writeConsentCookie(withTs);
    setConsent(withTs);
    updateGoogleConsent(withTs);
  }, []);

  // ── Actions exposées ──────────────────────────────────────────────────────

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
   * saveCustom :
   *  - Lit le consent courant via consentRef.current (pas de dépendance state)
   *  - Side-effects (cookie + Google signal) HORS du setState updater
   *    → safe en React StrictMode (updaters appelés 2x en dev)
   *  - Référence stable ([] en deps)
   */
  const saveCustom = useCallback(
    (partial: Partial<Pick<ConsentState, "analytics" | "marketing">>) => {
      const next: ConsentState = {
        ...consentRef.current,  // lecture via ref → pas de dépendance instable
        ...partial,
        version:      CONSENT_VERSION,
        necessary:    true,
        consentGiven: true,
        timestamp:    new Date().toISOString(),
      };
      // Side-effects en dehors du setState updater (StrictMode safe)
      writeConsentCookie(next);
      setConsent(next);
      updateGoogleConsent(next);
      setIsSettingsOpen(false);
    },
    [], // stable — accès au consent courant via consentRef
  );

  const openSettings  = useCallback(() => setIsSettingsOpen(true),  []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  // ── Consent Debug Mode (dev uniquement) ──────────────────────────────────
  /**
   * En développement :
   *  - Log chaque changement de consentement dans la console
   *  - Expose window.__consentDebug pour inspection via DevTools
   *  - Expose window.__consentSignals pour vérifier les signaux Google
   *
   * Utilisation pendant QA / debug GTM :
   *   Dans la console Chrome → window.__consentDebug
   *   → voir analytics, marketing, consentGiven, timestamp
   *
   * Ce bloc est entièrement tree-shaken en production (dead code elimination
   * sur process.env.NODE_ENV = 'production' au build Next.js).
   */
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!mounted) return;

    const signals = {
      analytics_storage:       consent.analytics ? "granted" : "denied",
      ad_storage:              consent.marketing  ? "granted" : "denied",
      ad_user_data:            consent.marketing  ? "granted" : "denied",
      ad_personalization:      consent.marketing  ? "granted" : "denied",
      functionality_storage:   "granted",
      personalization_storage: consent.analytics  ? "granted" : "denied",
      security_storage:        "granted",
    };

    console.groupCollapsed(
      `%c[Consent Mode v2] %c${consent.consentGiven ? "Choix effectué" : "En attente"}`,
      "color:#c8102e;font-weight:bold;",
      consent.consentGiven ? "color:green" : "color:orange",
    );
    console.table(signals);
    console.log("État complet :", consent);
    console.groupEnd();

    // Exposition globale pour debug GTM/GA dans DevTools
    const win = window as typeof window & {
      __consentDebug?:   typeof consent;
      __consentSignals?: typeof signals;
    };
    win.__consentDebug   = consent;
    win.__consentSignals = signals;
  }, [consent, mounted]);

  return {
    consent,
    showBanner:    mounted && !consent.consentGiven,
    isSettingsOpen,
    acceptAll,
    rejectAll,
    saveCustom,
    openSettings,
    closeSettings,
  };
}
