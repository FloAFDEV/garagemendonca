"use client";

/**
 * DescriptionEditor — éditeur premium de description véhicule.
 *
 * Fonctionnalités :
 *  - Toolbar : gras, titre ##, liste -
 *  - Aperçu live : rendu identique au front public (FormatVehicleDescription)
 *  - Mobile : bascule Éditeur ↔ Aperçu
 *  - Desktop md+ : vue divisée (éditeur gauche · aperçu droit)
 *  - Collage riche (Word, LBC, Facebook) : nettoyage automatique HTML→texte
 *  - Enter dans une liste : continue / sort automatiquement
 *  - Support dark/light via useAdminTokens
 */

import { useState, useCallback, useRef, memo } from "react";
import { Bold, Hash, List, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { FormatVehicleDescription } from "@/lib/utils/formatVehicleDescription";

// ─────────────────────────────────────────────────────────────────────
//  Paste cleanup — supprime le HTML parasite et normalise le texte
// ─────────────────────────────────────────────────────────────────────

export function cleanPaste(text: string): string {
  return (
    text
      // Caractères invisibles (zero-width, BOM, soft-hyphen, NBSP)
      .replace(/[​-‍﻿­]/g, "")
      .replace(/ /g, " ")
      // Balises HTML block → saut de ligne
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(p|div|li|h[1-6]|tr|blockquote)[^>]*>/gi, "\n")
      // Autres balises HTML → supprimées
      .replace(/<[^>]*>/g, "")
      // Entités HTML
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Puces exotiques → tiret standard
      .replace(/^[▪▸►▶‣⁃◉○●◦·•]\s*/gm, "- ")
      // Normalisation par ligne : espaces multiples, trim
      .split("\n")
      .map((l) => l.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      // Max 2 lignes vides consécutives
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Format helper — insère prefix/suffix autour de la sélection
// ─────────────────────────────────────────────────────────────────────

interface FormatResult {
  newValue: string;
  selStart: number;
  selEnd: number;
}

function applyInlineFormat(
  value: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
  placeholder: string,
): FormatResult {
  const selected = value.slice(start, end) || placeholder;
  const newValue = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
  return {
    newValue,
    selStart: start + prefix.length,
    selEnd: start + prefix.length + selected.length,
  };
}

// ─────────────────────────────────────────────────────────────────────
//  Toolbar button
// ─────────────────────────────────────────────────────────────────────

function TBtn({
  onFormat,
  title,
  children,
  active,
}: {
  onFormat: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  const t = useAdminTokens();
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => {
        // Prevent textarea from losing focus
        e.preventDefault();
        onFormat();
      }}
      className={clsx(
        "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        active
          ? "bg-brand-500/15 text-brand-400"
          : clsx(
              t.txtMuted,
              t.isDark ? "hover:bg-dark-700 hover:text-slate-200" : "hover:bg-slate-200 hover:text-slate-700",
            ),
      )}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────

interface DescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  minRows?: number;
}

function DescriptionEditorInner({
  value,
  onChange,
  name = "description",
  id = "desc-editor",
  minRows = 14,
}: DescriptionEditorProps) {
  const t = useAdminTokens();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Saved selection — updated on every cursor move so toolbar actions
  // can find the right range after the textarea regains focus.
  const selRef = useRef({ start: 0, end: 0 });
  const [mobilePreview, setMobilePreview] = useState(false);

  const minH = `${minRows * 1.65}rem`;

  // ── Selection tracking ──────────────────────────────────────────────
  const saveSelection = useCallback(() => {
    const el = textareaRef.current;
    if (el) selRef.current = { start: el.selectionStart, end: el.selectionEnd };
  }, []);

  // ── Text change ─────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    [onChange],
  );

  // ── Paste cleanup — only triggered on rich paste (HTML present) ─────
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const html = e.clipboardData.getData("text/html");
      if (!html) return; // Plain text paste — no intervention

      e.preventDefault();
      const raw = e.clipboardData.getData("text/plain");
      const cleaned = cleanPaste(raw);

      const { start, end } = selRef.current;
      const newValue = value.slice(0, start) + cleaned + value.slice(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        const pos = start + cleaned.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    },
    [value, onChange],
  );

  // ── Auto-continue list on Enter ─────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const el = textareaRef.current;
      if (!el) return;

      const { selectionStart, value: v } = el;
      const lineStart = v.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = v.slice(lineStart, selectionStart);
      const m = currentLine.match(/^([-*])\s+(.*)/);
      if (!m) return;

      e.preventDefault();

      if (!m[2].trim()) {
        // Empty list item → exit list (remove the "- " marker)
        const newVal = v.slice(0, lineStart) + "\n" + v.slice(selectionStart);
        onChange(newVal);
        requestAnimationFrame(() => el.setSelectionRange(lineStart + 1, lineStart + 1));
      } else {
        // Continue list
        const insert = `\n${m[1]} `;
        const newVal = v.slice(0, selectionStart) + insert + v.slice(selectionStart);
        onChange(newVal);
        requestAnimationFrame(() => {
          const pos = selectionStart + insert.length;
          el.setSelectionRange(pos, pos);
        });
      }
    },
    [onChange],
  );

  // ── Toolbar actions ─────────────────────────────────────────────────

  const applyBold = useCallback(() => {
    const { start, end } = selRef.current;
    const { newValue, selStart, selEnd } = applyInlineFormat(
      value, start, end, "**", "**", "texte en gras",
    );
    onChange(newValue);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      el?.focus();
      el?.setSelectionRange(selStart, selEnd);
    });
  }, [value, onChange]);

  const applyHeading = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { start } = selRef.current;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", lineStart);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const lineContent = value.slice(lineStart, lineEnd);
    const isHeading = lineContent.startsWith("## ");

    let newValue: string;
    let newPos: number;
    if (isHeading) {
      newValue = value.slice(0, lineStart) + lineContent.slice(3) + value.slice(lineEnd);
      newPos = Math.max(lineStart, start - 3);
    } else {
      newValue = value.slice(0, lineStart) + "## " + value.slice(lineStart);
      newPos = start + 3;
    }
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  const applyList = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { start, end } = selRef.current;
    const hasMultiLine = value.slice(start, end).includes("\n");

    if (hasMultiLine) {
      // Multi-line selection: prefix each non-empty line
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end);
      const prefixed = block
        .split("\n")
        .map((l) => (l.trim() ? `- ${l.trimStart().replace(/^[-*•]\s*/, "")}` : l))
        .join("\n");
      const newValue = value.slice(0, lineStart) + prefixed + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(lineStart, lineStart + prefixed.length);
      });
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = value.indexOf("\n", lineStart);
      const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const lineContent = value.slice(lineStart, lineEnd);
      const isList = /^[-*]\s/.test(lineContent);

      if (isList) {
        const stripped = lineContent.replace(/^[-*]\s/, "");
        const newValue = value.slice(0, lineStart) + stripped + value.slice(lineEnd);
        onChange(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, start - 2));
        });
      } else {
        const newValue = value.slice(0, lineStart) + "- " + value.slice(lineStart);
        onChange(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(lineStart + 2, lineStart + 2);
        });
      }
    }
  }, [value, onChange]);

  // ── Render ──────────────────────────────────────────────────────────

  const hasContent = value.trim().length > 0;
  const isDark = t.isDark;

  const borderCls = isDark ? "border-dark-700" : "border-slate-200";
  const bgToolbar = isDark ? "bg-dark-800" : "bg-slate-50";
  const bgEditor  = isDark ? "bg-dark-950" : "bg-white";
  const bgPreview = isDark ? "bg-dark-950" : "bg-slate-50/40";
  const dividerCls = isDark ? "bg-dark-700" : "bg-slate-200";

  return (
    <div
      className={clsx("rounded-xl border overflow-hidden", borderCls)}
      role="group"
      aria-label="Éditeur de description"
    >
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div
        className={clsx(
          "flex items-center gap-0.5 px-3 py-2 border-b",
          bgToolbar,
          borderCls,
        )}
      >
        {/* Format buttons */}
        <TBtn onFormat={applyBold} title="Gras — sélectionner du texte puis cliquer">
          <Bold size={13} strokeWidth={2.5} aria-hidden="true" />
        </TBtn>
        <TBtn onFormat={applyHeading} title="Titre de section (## )">
          <Hash size={13} aria-hidden="true" />
        </TBtn>
        <TBtn onFormat={applyList} title="Liste à puces (- )">
          <List size={13} aria-hidden="true" />
        </TBtn>

        {/* Divider */}
        <div className={clsx("w-px h-4 mx-2 flex-shrink-0", dividerCls)} aria-hidden="true" />

        {/* Syntax hint — desktop */}
        <span className={clsx("text-[10px] hidden md:block mr-auto", t.txtFaint)}>
          **gras** · ## Titre · - liste
        </span>

        {/* Mobile preview toggle */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setMobilePreview((v) => !v); }}
          className={clsx(
            "ml-auto md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
            mobilePreview
              ? "bg-brand-500/15 text-brand-400"
              : clsx(t.txtMuted, isDark ? "hover:bg-dark-700" : "hover:bg-slate-100"),
          )}
          aria-label={mobilePreview ? "Retour à l'éditeur" : "Aperçu du rendu final"}
          aria-pressed={mobilePreview}
        >
          {mobilePreview ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
          <span>{mobilePreview ? "Éditeur" : "Aperçu"}</span>
        </button>

        {/* Desktop preview label */}
        <span className={clsx("text-[10px] hidden md:flex items-center gap-1", t.txtFaint)}>
          <Eye size={11} aria-hidden="true" />
          Aperçu en direct
        </span>
      </div>

      {/* ── Split content ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row">

        {/* Textarea — hidden on mobile when preview active */}
        <div
          className={clsx(
            "md:flex-1 md:block",
            mobilePreview ? "hidden" : "flex-1",
          )}
        >
          <textarea
            ref={textareaRef}
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onSelect={saveSelection}
            onClick={saveSelection}
            onKeyUp={saveSelection}
            placeholder={
              "Décrivez le véhicule : état général, équipements, historique d'entretien…\n\n" +
              "## Équipements\n- Climatisation automatique\n- GPS\n- Caméra de recul\n\n" +
              "## Historique d'entretien\nCarnet complet, révisé à chaque échéance.\n\n" +
              "Utilisez ## pour les titres, - pour les listes, **texte** pour le gras."
            }
            className={clsx(
              "w-full resize-y focus:outline-none text-sm leading-[1.75]",
              "px-4 py-4",
              bgEditor,
              t.txt,
              isDark
                ? "placeholder:text-slate-600 focus:bg-dark-900/40"
                : "placeholder:text-slate-400 focus:bg-white",
              "transition-colors",
            )}
            style={{
              minHeight: minH,
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontSize: "13px",
            }}
            aria-label="Description du véhicule (format texte avec mise en forme légère)"
            spellCheck
          />
        </div>

        {/* Vertical divider — desktop only */}
        <div
          className={clsx("hidden md:block w-px self-stretch flex-shrink-0", dividerCls)}
          aria-hidden="true"
        />

        {/* Preview — always visible on desktop, toggle on mobile */}
        <div
          className={clsx(
            "md:flex-1 md:block overflow-y-auto",
            mobilePreview ? "flex-1" : "hidden",
          )}
          style={{ minHeight: minH }}
          aria-label="Aperçu du rendu final"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className={clsx("px-5 py-4 h-full", bgPreview)}>
            {/* Preview label */}
            <p
              className={clsx(
                "text-[9px] uppercase tracking-[0.15em] mb-4 flex items-center gap-2",
                t.txtFaint,
              )}
              aria-hidden="true"
            >
              <span className={clsx("h-px flex-1", dividerCls)} />
              rendu final
              <span className={clsx("h-px flex-1", dividerCls)} />
            </p>

            {hasContent ? (
              <FormatVehicleDescription text={value} />
            ) : (
              <p className={clsx("text-sm italic", t.txtFaint)}>
                L&apos;aperçu s&apos;actualise ici en temps réel…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer hint ──────────────────────────────────────────── */}
      <div
        className={clsx(
          "px-4 py-1.5 border-t flex items-center gap-4 text-[10px] flex-wrap",
          bgToolbar,
          borderCls,
          t.txtFaint,
        )}
      >
        <code>**gras**</code>
        <code className="hidden sm:inline">## Titre de section</code>
        <code className="hidden sm:inline">- élément de liste</code>
        <span className="ml-auto hidden sm:inline opacity-70">
          Ctrl+V depuis Word / LBC → nettoyage automatique
        </span>
      </div>
    </div>
  );
}

export const DescriptionEditor = memo(DescriptionEditorInner);
