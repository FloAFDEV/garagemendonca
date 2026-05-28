"use client";

/**
 * DescriptionEditor — éditeur premium de description véhicule.
 *
 * Fonctionnalités :
 *  - Toolbar : gras (Ctrl+B), titre ##, liste -, undo/redo
 *  - Undo/Redo : Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z + boutons toolbar
 *  - Gras toggle : détecte si la sélection est déjà en gras et retire les marqueurs
 *  - Auto-hauteur : textarea grandit avec le contenu, hauteurs synchronisées
 *  - Aperçu live : rendu identique au front public (FormatVehicleDescription)
 *  - Mobile : bascule Éditeur ↔ Aperçu
 *  - Desktop md+ : vue divisée (éditeur gauche · aperçu droit)
 *  - Collage riche (Word, LBC, Facebook) : nettoyage automatique HTML→texte
 *  - Enter dans une liste : continue / sort automatiquement
 *  - Support dark/light via useAdminTokens
 */

import { useState, useCallback, useRef, useEffect, memo } from "react";
import { Bold, Hash, List, Eye, EyeOff, Undo2, Redo2 } from "lucide-react";
import clsx from "clsx";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { FormatVehicleDescription } from "@/lib/utils/formatVehicleDescription";

// ─────────────────────────────────────────────────────────────────────
//  Paste cleanup — supprime le HTML parasite et normalise le texte
// ─────────────────────────────────────────────────────────────────────

export function cleanPaste(text: string): string {
  return (
    text
      .replace(/[​-‍﻿­]/g, "")
      .replace(/ /g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(p|div|li|h[1-6]|tr|blockquote)[^>]*>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/^[▪▸►▶‣⁃◉○●◦·•]\s*/gm, "- ")
      .split("\n")
      .map((l) => l.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Bold toggle — Word-like : wraps OR unwraps ** ** around selection
// ─────────────────────────────────────────────────────────────────────

interface FormatResult {
  newValue: string;
  selStart: number;
  selEnd: number;
}

function applyToggleBold(
  value: string,
  start: number,
  end: number,
): FormatResult {
  const selected = value.slice(start, end);

  // Toggle off: the selected text is itself **...**
  if (
    selected.startsWith("**") &&
    selected.endsWith("**") &&
    selected.length > 4
  ) {
    const inner = selected.slice(2, -2);
    return {
      newValue: value.slice(0, start) + inner + value.slice(end),
      selStart: start,
      selEnd: start + inner.length,
    };
  }

  // Toggle off: ** markers are immediately outside the selection
  if (
    start >= 2 &&
    value.slice(start - 2, start) === "**" &&
    value.slice(end, end + 2) === "**"
  ) {
    const newValue =
      value.slice(0, start - 2) + selected + value.slice(end + 2);
    return {
      newValue,
      selStart: start - 2,
      selEnd: start - 2 + selected.length,
    };
  }

  // Toggle on
  const text = selected || "texte en gras";
  const newValue =
    value.slice(0, start) + "**" + text + "**" + value.slice(end);
  return {
    newValue,
    selStart: start + 2,
    selEnd: start + 2 + text.length,
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
  disabled,
}: {
  onFormat: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  const t = useAdminTokens();
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onFormat();
      }}
      className={clsx(
        "flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : active
            ? "bg-brand-500/15 text-brand-400"
            : clsx(
                t.txtMuted,
                t.isDark
                  ? "hover:bg-dark-700 hover:text-slate-200"
                  : "hover:bg-slate-200 hover:text-slate-700",
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
  const selRef = useRef({ start: 0, end: 0 });
  const [mobilePreview, setMobilePreview] = useState(false);

  // valueRef : toujours à jour, permet des callbacks stables sans `value` en dep
  const valueRef = useRef(value);
  valueRef.current = value;

  // ── Undo / Redo stacks ──────────────────────────────────────────────
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  // Counters as state so toolbar buttons reflect actual availability
  const [undoLen, setUndoLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);

  const pushUndo = useCallback(() => {
    const current = valueRef.current;
    // Don't push duplicates
    if (undoStack.current[undoStack.current.length - 1] === current) return;
    undoStack.current.push(current);
    if (undoStack.current.length > 200) undoStack.current.shift();
    redoStack.current = [];
    setUndoLen(undoStack.current.length);
    setRedoLen(0);
  }, []);

  const applyUndo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (prev === undefined) return;
    redoStack.current.push(valueRef.current);
    onChange(prev);
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(prev.length, prev.length);
    });
  }, [onChange]);

  const applyRedo = useCallback(() => {
    const next = redoStack.current.pop();
    if (next === undefined) return;
    undoStack.current.push(valueRef.current);
    onChange(next);
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
    });
  }, [onChange]);

  // ── Auto-grow textarea to match content height ──────────────────────
  const minH = `${minRows * 1.65}rem`;

  // Impératif : appelé directement sur chaque input ET via useEffect.
  // onInput bypasse le cycle React pour une réponse immédiate sur mobile (IME, dictée).
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
    const minPx = minRows * 1.65 * rootFontSize;
    el.style.height = `${Math.max(el.scrollHeight, minPx)}px`;
  }, [minRows]);

  // Sync quand value change depuis l'extérieur (undo/redo, paste, valeur initiale)
  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);

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

  // ── Paste cleanup ───────────────────────────────────────────────────
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const html = e.clipboardData.getData("text/html");
      if (!html) return;
      e.preventDefault();
      pushUndo();
      const raw = e.clipboardData.getData("text/plain");
      const cleaned = cleanPaste(raw);
      const { start, end } = selRef.current;
      const newValue =
        valueRef.current.slice(0, start) +
        cleaned +
        valueRef.current.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        const pos = start + cleaned.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    },
    [onChange, pushUndo],
  );

  // ── Keyboard shortcuts + list auto-continue ─────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Undo
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        applyUndo();
        return;
      }
      // Redo
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        applyRedo();
        return;
      }
      // Ctrl+B — bold toggle
      if (ctrl && e.key === "b") {
        e.preventDefault();
        pushUndo();
        const el = textareaRef.current;
        const s = el ? el.selectionStart : selRef.current.start;
        const en = el ? el.selectionEnd : selRef.current.end;
        const { newValue, selStart, selEnd } = applyToggleBold(
          valueRef.current,
          s,
          en,
        );
        onChange(newValue);
        requestAnimationFrame(() => {
          el?.focus();
          el?.setSelectionRange(selStart, selEnd);
        });
        return;
      }

      // Push undo checkpoint at word boundaries (word-like granularity)
      if (e.key === " " || e.key === "Enter") {
        pushUndo();
      }

      // Auto-continue list on Enter
      if (e.key === "Enter" && !e.shiftKey) {
        const el = textareaRef.current;
        if (!el) return;
        const { selectionStart, value: v } = el;
        const lineStart = v.lastIndexOf("\n", selectionStart - 1) + 1;
        const currentLine = v.slice(lineStart, selectionStart);
        const m = currentLine.match(/^([-*])\s+(.*)/);
        if (!m) return;
        e.preventDefault();

        if (!m[2].trim()) {
          // Empty list item → exit list
          const newVal =
            v.slice(0, lineStart) + "\n" + v.slice(selectionStart);
          onChange(newVal);
          requestAnimationFrame(() =>
            el.setSelectionRange(lineStart + 1, lineStart + 1),
          );
        } else {
          // Continue list
          const insert = `\n${m[1]} `;
          const newVal =
            v.slice(0, selectionStart) + insert + v.slice(selectionStart);
          onChange(newVal);
          requestAnimationFrame(() => {
            const pos = selectionStart + insert.length;
            el.setSelectionRange(pos, pos);
          });
        }
      }
    },
    [onChange, applyUndo, applyRedo, pushUndo],
  );

  // ── Toolbar actions ─────────────────────────────────────────────────

  const applyBoldAction = useCallback(() => {
    pushUndo();
    const { start, end } = selRef.current;
    const { newValue, selStart, selEnd } = applyToggleBold(
      valueRef.current,
      start,
      end,
    );
    onChange(newValue);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      el?.focus();
      el?.setSelectionRange(selStart, selEnd);
    });
  }, [onChange, pushUndo]);

  const applyHeading = useCallback(() => {
    pushUndo();
    const el = textareaRef.current;
    if (!el) return;
    const { start } = selRef.current;
    const v = valueRef.current;
    const lineStart = v.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = v.indexOf("\n", lineStart);
    const lineEnd = lineEndIdx === -1 ? v.length : lineEndIdx;
    const lineContent = v.slice(lineStart, lineEnd);
    const isHeading = lineContent.startsWith("## ");

    let newValue: string;
    let newPos: number;
    if (isHeading) {
      newValue =
        v.slice(0, lineStart) + lineContent.slice(3) + v.slice(lineEnd);
      newPos = Math.max(lineStart, start - 3);
    } else {
      newValue = v.slice(0, lineStart) + "## " + v.slice(lineStart);
      newPos = start + 3;
    }
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }, [onChange, pushUndo]);

  const applyList = useCallback(() => {
    pushUndo();
    const el = textareaRef.current;
    if (!el) return;
    const { start, end } = selRef.current;
    const v = valueRef.current;
    const hasMultiLine = v.slice(start, end).includes("\n");

    if (hasMultiLine) {
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const block = v.slice(lineStart, end);
      const prefixed = block
        .split("\n")
        .map((l) =>
          l.trim() ? `- ${l.trimStart().replace(/^[-*•]\s*/, "")}` : l,
        )
        .join("\n");
      const newValue = v.slice(0, lineStart) + prefixed + v.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(lineStart, lineStart + prefixed.length);
      });
    } else {
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = v.indexOf("\n", lineStart);
      const lineEnd = lineEndIdx === -1 ? v.length : lineEndIdx;
      const lineContent = v.slice(lineStart, lineEnd);
      const isList = /^[-*]\s/.test(lineContent);

      if (isList) {
        const stripped = lineContent.replace(/^[-*]\s/, "");
        const newValue = v.slice(0, lineStart) + stripped + v.slice(lineEnd);
        onChange(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(
            Math.max(lineStart, start - 2),
            Math.max(lineStart, start - 2),
          );
        });
      } else {
        const newValue = v.slice(0, lineStart) + "- " + v.slice(lineStart);
        onChange(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(lineStart + 2, lineStart + 2);
        });
      }
    }
  }, [onChange, pushUndo]);

  // ── Render ──────────────────────────────────────────────────────────

  const hasContent = value.trim().length > 0;
  const isDark = t.isDark;

  const borderCls = isDark ? "border-dark-700" : "border-slate-200";
  const bgToolbar = isDark ? "bg-dark-800" : "bg-slate-50";
  const bgEditor = isDark ? "bg-dark-950" : "bg-white";
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
        <TBtn onFormat={applyBoldAction} title="Gras (Ctrl+B)">
          <Bold size={13} strokeWidth={2.5} aria-hidden="true" />
        </TBtn>
        <TBtn onFormat={applyHeading} title="Titre de section (## )">
          <Hash size={13} aria-hidden="true" />
        </TBtn>
        <TBtn onFormat={applyList} title="Liste à puces (- )">
          <List size={13} aria-hidden="true" />
        </TBtn>

        {/* Divider */}
        <div
          className={clsx("w-px h-4 mx-2 flex-shrink-0", dividerCls)}
          aria-hidden="true"
        />

        {/* Undo / Redo */}
        <TBtn
          onFormat={applyUndo}
          title="Annuler (Ctrl+Z)"
          disabled={undoLen === 0}
        >
          <Undo2 size={13} aria-hidden="true" />
        </TBtn>
        <TBtn
          onFormat={applyRedo}
          title="Rétablir (Ctrl+Y)"
          disabled={redoLen === 0}
        >
          <Redo2 size={13} aria-hidden="true" />
        </TBtn>

        {/* Syntax hint — desktop */}
        <span className={clsx("text-[10px] hidden md:block ml-2 mr-auto", t.txtFaint)}>
          **gras** · ## Titre · - liste
        </span>

        {/* Mobile preview toggle */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setMobilePreview((v) => !v);
          }}
          className={clsx(
            "ml-auto md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
            mobilePreview
              ? "bg-brand-500/15 text-brand-400"
              : clsx(
                  t.txtMuted,
                  isDark ? "hover:bg-dark-700" : "hover:bg-slate-100",
                ),
          )}
          aria-label={mobilePreview ? "Retour à l'éditeur" : "Aperçu du rendu final"}
          aria-pressed={mobilePreview}
        >
          {mobilePreview ? (
            <EyeOff size={13} aria-hidden="true" />
          ) : (
            <Eye size={13} aria-hidden="true" />
          )}
          <span>{mobilePreview ? "Éditeur" : "Aperçu"}</span>
        </button>

        {/* Desktop preview label */}
        <span
          className={clsx(
            "text-[10px] hidden md:flex items-center gap-1",
            t.txtFaint,
          )}
        >
          <Eye size={11} aria-hidden="true" />
          Aperçu en direct
        </span>
      </div>

      {/* ── Split content ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-stretch">

        {/* Textarea — hidden on mobile when preview active */}
        <div
          className={clsx(
            "md:flex-1 md:flex md:flex-col",
            mobilePreview ? "hidden" : "flex flex-col flex-1",
          )}
        >
          <textarea
            ref={textareaRef}
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            onInput={adjustHeight}
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
              "flex-1 w-full focus:outline-none text-sm leading-[1.75]",
              // overflow-y-auto : fallback scroll si l'auto-grow lag (mobile, IME).
              // overflow-hidden bloquait le scroll interne sur iOS/Android.
              "px-4 py-4 resize-none overflow-y-auto",
              bgEditor,
              t.txt,
              isDark
                ? "placeholder:text-slate-600 focus:bg-dark-900/40"
                : "placeholder:text-slate-400 focus:bg-white",
              "transition-colors",
            )}
            style={{
              minHeight: minH,
              fontFamily:
                "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontSize: "13px",
            }}
            aria-label="Description du véhicule (format texte avec mise en forme légère)"
            spellCheck
          />
        </div>

        {/* Vertical divider — desktop only */}
        <div
          className={clsx(
            "hidden md:block w-px self-stretch flex-shrink-0",
            dividerCls,
          )}
          aria-hidden="true"
        />

        {/* Preview — always visible on desktop, toggle on mobile */}
        <div
          className={clsx(
            "md:flex-1 md:flex md:flex-col",
            mobilePreview ? "flex flex-col flex-1" : "hidden",
          )}
          style={{ minHeight: minH }}
          aria-label="Aperçu du rendu final"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className={clsx("flex-1 px-5 py-4", bgPreview)}>
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
              <FormatVehicleDescription
                text={value}
                textClass={isDark ? "text-slate-300" : "text-slate-600"}
              />
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
          Ctrl+B gras · Ctrl+Z annuler · Ctrl+Y rétablir
        </span>
      </div>
    </div>
  );
}

export const DescriptionEditor = memo(DescriptionEditorInner);
