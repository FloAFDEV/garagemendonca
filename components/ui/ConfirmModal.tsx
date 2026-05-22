"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

export interface ConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: ReactNode;
  /** Label du bouton de confirmation */
  confirmLabel?: string;
  /** "danger" = rouge (défaut), "warning" = orange */
  variant?: "danger" | "warning";
}

export default function ConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  isLoading = false,
  title = "Confirmer la suppression",
  description,
  confirmLabel = "Supprimer",
  variant = "danger",
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Mémorise l'élément qui avait le focus avant l'ouverture
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      // Focus sur "Annuler" par défaut (action la moins destructive)
      setTimeout(() => cancelRef.current?.focus(), 0);
    } else if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Fermeture ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" && !isLoading) onCancel();

      // Focus trap : Tab / Shift+Tab cycle entre les deux boutons
      if (e.key === "Tab") {
        const els = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        if (els.length < 2) return;
        const first = els[0];
        const last = els[els.length - 1];
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
    },
    [isLoading, onCancel],
  );

  if (!isOpen) return null;

  const iconColor = variant === "danger" ? "text-red-500" : "text-amber-500";
  const iconBg    = variant === "danger" ? "bg-red-500/10" : "bg-amber-500/10";
  const btnColor  =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400";

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby={description ? "confirm-modal-desc" : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Fond semi-transparent — clic outside */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Carte modale */}
      <div className="relative z-10 w-full max-w-md bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Bouton fermer */}
        <button
          onClick={!isLoading ? onCancel : undefined}
          disabled={isLoading}
          aria-label="Fermer"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-dark-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="p-6">
          {/* Icône */}
          <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", iconBg)}>
            <AlertTriangle size={24} className={iconColor} aria-hidden="true" />
          </div>

          {/* Titre */}
          <h2
            id="confirm-modal-title"
            className="text-base font-semibold text-dark-300 mb-2"
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p id="confirm-modal-desc" className="text-sm text-dark-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-dark-700 text-dark-400 hover:bg-dark-800 hover:text-dark-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 disabled:opacity-60 disabled:cursor-not-allowed",
              btnColor,
            )}
          >
            {isLoading && (
              <span
                className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
