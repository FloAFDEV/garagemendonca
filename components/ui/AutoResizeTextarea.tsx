"use client";

/**
 * AutoResizeTextarea — textarea auto-expandable premium.
 *
 * Comportement :
 * - Grandit automatiquement selon le contenu (scrollHeight)
 * - Aucune scrollbar interne jusqu'à maxRows
 * - Hauteur minimale définie par minRows
 * - Transition de hauteur fluide (0.15s)
 *
 * Styling :
 * - Sans className → applique le style premium light (formulaires publics)
 * - Avec className → utilisé tel quel (admin thémé via t.inputClass)
 *   Dans les deux cas, resize:none + overflowY auto-géré.
 */

import { useRef, useEffect, useCallback, forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export interface AutoResizeTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
  minRows?: number;
  maxRows?: number;
  error?: boolean;
}

const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    {
      minRows = 4,
      maxRows = 20,
      error = false,
      className,
      onChange,
      value,
      defaultValue,
      ...props
    },
    forwardedRef,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);

    // Merge forwarded ref avec le ref interne utilisé pour le resize
    const setRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        (
          innerRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = el;
        if (typeof forwardedRef === "function") {
          forwardedRef(el);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<
              HTMLTextAreaElement | null
            >
          ).current = el;
        }
      },
      [forwardedRef],
    );

    const adjust = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || 24;
      const pt = parseFloat(cs.paddingTop) || 14;
      const pb = parseFloat(cs.paddingBottom) || 14;

      const minH = minRows * lh + pt + pb;
      const maxH = maxRows * lh + pt + pb;

      // Reset to "auto" pour que scrollHeight reflète le contenu réel
      el.style.height = "auto";
      const next = Math.min(Math.max(el.scrollHeight, minH), maxH);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
    }, [minRows, maxRows]);

    // Ajustement initial (valeurs pré-remplies)
    useEffect(() => {
      adjust();
    }, [adjust]);

    // Ajustement quand la valeur change (mode contrôlé)
    useEffect(() => {
      if (value !== undefined) adjust();
    }, [value, adjust]);

    const hasCustomClass = Boolean(className);

    return (
      <textarea
        ref={setRef}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => {
          adjust();
          onChange?.(e);
        }}
        className={clsx(
          // Toujours appliqué — comportement resize
          "w-full resize-none",

          // Style premium par défaut (formulaires publics, pas de className)
          !hasCustomClass && [
            "rounded-xl border px-4 py-3.5",
            "text-sm sm:text-[15px] leading-relaxed text-slate-900",
            "bg-white",
            "placeholder:text-slate-400",
            "outline-none transition-colors duration-200",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : [
                  "border-slate-200",
                  "hover:border-slate-300",
                  "focus:border-brand-400 focus:ring-2 focus:ring-brand-100/70",
                ],
          ],

          // Admin / custom — le className apporte tout le style
          hasCustomClass && className,
        )}
        style={{
          // Transition height uniquement — les autres transitions viennent du className
          transition: "height 0.15s ease-out",
        }}
        aria-multiline="true"
        {...props}
      />
    );
  },
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";
export default AutoResizeTextarea;
