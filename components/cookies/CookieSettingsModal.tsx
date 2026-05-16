"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Shield, BarChart2, Megaphone, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useConsentState, useConsentActions } from "@/contexts/CookieConsentContext";

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({
  id,
  checked,
  disabled = false,
  onChange,
  label,
}: {
  id:        string;
  checked:   boolean;
  disabled?: boolean;
  onChange:  (v: boolean) => void;
  label:     string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        checked  ? "bg-brand-500" : "bg-slate-200",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm",
          "transform transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ─── Catégories ───────────────────────────────────────────────────────────────

type CategoryDef = {
  id:          "necessary" | "analytics" | "marketing";
  Icon:        React.ElementType;
  title:       string;
  description: string;
  required?:   boolean;
};

const CATEGORIES: CategoryDef[] = [
  {
    id:          "necessary",
    Icon:        Shield,
    title:       "Cookies essentiels",
    required:    true,
    description:
      "Indispensables au fonctionnement du site : authentification, sécurité, préférences de navigation. " +
      "Ils ne collectent aucune donnée personnelle à des fins marketing.",
  },
  {
    id:          "analytics",
    Icon:        BarChart2,
    title:       "Mesure d'audience",
    description:
      "Nous permettent de comprendre comment vous utilisez le site (pages visitées, durée, source de trafic). " +
      "Ces données, anonymisées, aident à améliorer nos contenus. Propulsé par Google Analytics 4.",
  },
  {
    id:          "marketing",
    Icon:        Megaphone,
    title:       "Marketing & publicité",
    description:
      "Permettent d'afficher des annonces personnalisées et de mesurer l'efficacité de nos campagnes " +
      "(Google Ads, remarketing). Aucune donnée n'est vendue à des tiers.",
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function CookieSettingsModal() {
  const { consent, isSettingsOpen }                            = useConsentState();
  const { closeSettings, acceptAll, rejectAll, saveCustom }    = useConsentActions();

  // État local des toggles — modifiable avant validation
  const [localAnalytics, setLocalAnalytics] = useState(consent.analytics);
  const [localMarketing, setLocalMarketing] = useState(consent.marketing);

  // Description dépliable
  const [expanded, setExpanded] = useState<string | null>(null);

  // Refs accessibilité
  const overlayRef    = useRef<HTMLDivElement>(null);
  const modalRef      = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  /**
   * prevFocusRef : mémorise l'élément focalisé avant l'ouverture du modal.
   * WCAG 2.4.3 : le focus DOIT retourner à l'élément déclencheur à la fermeture.
   */
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Sync toggles + focus management à chaque changement d'état ouverture
  useEffect(() => {
    if (isSettingsOpen) {
      // Mémoriser l'élément actif pour restauration à la fermeture
      prevFocusRef.current = document.activeElement as HTMLElement;

      setLocalAnalytics(consent.analytics);
      setLocalMarketing(consent.marketing);
      setExpanded(null);

      // requestAnimationFrame : attend que le DOM soit peint avant le focus
      requestAnimationFrame(() => firstFocusRef.current?.focus());
    } else {
      // Restaurer le focus vers l'élément déclencheur (WCAG 2.4.3)
      if (prevFocusRef.current) {
        requestAnimationFrame(() => {
          prevFocusRef.current?.focus();
          prevFocusRef.current = null;
        });
      }
    }
  }, [isSettingsOpen, consent.analytics, consent.marketing]);

  // ESC + scroll lock + focus trap
  useEffect(() => {
    if (!isSettingsOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSettings();
        return;
      }

      // Focus trap : cycle Tab/Shift+Tab dans le panel du modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isSettingsOpen, closeSettings]);

  const handleSave = useCallback(() => {
    saveCustom({ analytics: localAnalytics, marketing: localMarketing });
  }, [saveCustom, localAnalytics, localMarketing]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  if (!isSettingsOpen) return null;

  return (
    /*
     * Overlay — positionnement + fond semi-transparent.
     * z-[60] : au-dessus de la bannière (z-[55]) et du header (z-50).
     *
     * PAS de role="dialog" ici : l'overlay inclut le backdrop qui ne fait
     * pas partie du contenu du dialog. WCAG APG Dialog Pattern :
     * role="dialog" doit être exclusivement sur le conteneur du CONTENU.
     */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) closeSettings();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/*
       * Panel — seul élément portant role="dialog".
       * aria-modal="true"         → AT ne navigue pas hors du dialog
       * aria-labelledby           → annonce le titre h2 visible
       * max-h-[90dvh]             → dvh (dynamic viewport height) = iOS keyboard safe
       */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        className={clsx(
          "relative z-10 w-full max-w-lg max-h-[90dvh] flex flex-col",
          "bg-white rounded-2xl shadow-2xl overflow-hidden",
          "animate-slide-up",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2
              id="cookie-modal-title"
              className="font-heading font-medium text-slate-900 text-lg leading-tight"
            >
              Paramètres des cookies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choisissez les catégories que vous acceptez
            </p>
          </div>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={closeSettings}
            aria-label="Fermer les paramètres cookies"
            className={clsx(
              "p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Catégories — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {CATEGORIES.map(({ id, Icon, title, description, required }) => {
            const isChecked =
              id === "necessary" ? true :
              id === "analytics" ? localAnalytics :
              localMarketing;
            const isExpanded = expanded === id;

            return (
              <div
                key={id}
                className="rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Icône */}
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-brand-500" aria-hidden="true" />
                  </div>

                  {/* Titre + expand */}
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`desc-${id}`}
                    onClick={() => toggleExpand(id)}
                    className={clsx(
                      "flex-1 text-left focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-slate-800">
                        {title}
                      </span>
                      {required && (
                        <span className="text-[10px] uppercase tracking-wide text-brand-500 font-medium ml-1">
                          Requis
                        </span>
                      )}
                      <ChevronDown
                        size={13}
                        className={clsx(
                          "text-slate-400 transition-transform ml-0.5",
                          isExpanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  {/* Toggle */}
                  <Toggle
                    id={`toggle-${id}`}
                    label={`${isChecked ? "Désactiver" : "Activer"} ${title}`}
                    checked={isChecked}
                    disabled={!!required}
                    onChange={(v) => {
                      if (id === "analytics") setLocalAnalytics(v);
                      if (id === "marketing") setLocalMarketing(v);
                    }}
                  />
                </div>

                {/* Description dépliable */}
                {isExpanded && (
                  <div
                    id={`desc-${id}`}
                    role="region"
                    aria-label={`Description : ${title}`}
                    className="px-4 pb-4 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50/50"
                  >
                    {description}
                  </div>
                )}
              </div>
            );
          })}

          {/* Info légale CNIL */}
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Votre choix est enregistré pour 6 mois. Vous pouvez le modifier à
            tout moment via le lien &quot;Gérer mes cookies&quot; en bas de page.
            Conformément au RGPD et aux recommandations de la CNIL.
          </p>
        </div>

        {/* Actions — fixed dans le panel */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={rejectAll}
            className={clsx(
              "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border border-slate-200",
              "text-slate-600 hover:bg-slate-50 hover:border-slate-300",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            )}
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={clsx(
              "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium",
              "bg-slate-800 text-white hover:bg-slate-700",
              "transition-colors focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-slate-700 focus-visible:ring-offset-2",
            )}
          >
            Enregistrer mes choix
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className={clsx(
              "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium",
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
