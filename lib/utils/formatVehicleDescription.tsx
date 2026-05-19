/**
 * Transforme une description véhicule brute (texte copié/collé depuis une concession)
 * en blocs React structurés — sans dangerouslySetInnerHTML.
 *
 * Patterns détectés :
 *  - ***** TITRE ***** ou === TITRE === → <h3> section heading
 *  - "Label :" en début de ligne (Mécanique :, Carrosserie :, …) → <h3>
 *  - "- item" ou "• item" → <ul> liste
 *  - " / " → séparateur → plusieurs lignes de texte
 *  - Texte ordinaire → <p>
 */

import React from "react";

// ─────────────────────────────────────────────
//  Types internes
// ─────────────────────────────────────────────

type Block =
  | { kind: "heading"; text: string }
  | { kind: "para"; text: string }
  | { kind: "list"; items: string[] };

// ─────────────────────────────────────────────
//  Regex
// ─────────────────────────────────────────────

/** ***** TEXTE ***** ou === TEXTE === */
const STAR_HEADING_RE = /^[*=\-_]{2,}\s*(.+?)\s*[*=\-_]{2,}$/;

/** "Label :" ou "LABEL:" en fin de ligne (section courte sans contenu sur la même ligne) */
const INLINE_HEADING_RE =
  /^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜ][A-ZÀ-ÿa-z\s&'/()-]{1,50})\s*:\s*$/;

/** Listes : - item ou • item */
const LIST_ITEM_RE = /^[-•]\s+(.+)/;

/** Séparateur " / " au milieu d'une ligne */
const SLASH_SEP_RE = /\s*\/\s+|\s+\/\s*/;

// ─────────────────────────────────────────────
//  Parser
// ─────────────────────────────────────────────

function parseDescription(raw: string): Block[] {
  const blocks: Block[] = [];
  const listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ kind: "list", items: [...listItems] });
      listItems.length = 0;
    }
  };

  // 1. Expand lines : chaque retour à la ligne, puis séparer sur " / "
  const expandedLines: string[] = [];
  for (const raw_line of raw.split("\n")) {
    const line = raw_line.trim();
    if (!line) { expandedLines.push(""); continue; }

    // Ne pas éclater les lignes qui sont déjà des headings ou des listes
    if (STAR_HEADING_RE.test(line) || INLINE_HEADING_RE.test(line) || LIST_ITEM_RE.test(line)) {
      expandedLines.push(line);
      continue;
    }

    // Éclater sur " / " → plusieurs "paragraphes"
    const parts = line.split(SLASH_SEP_RE).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      for (const part of parts) expandedLines.push(part);
    } else {
      expandedLines.push(line);
    }
  }

  // 2. Classifier chaque ligne
  for (const line of expandedLines) {
    if (!line) { flushList(); continue; }

    // Section heading étoilée / égale
    const starMatch = line.match(STAR_HEADING_RE);
    if (starMatch) {
      flushList();
      blocks.push({ kind: "heading", text: normalizeHeading(starMatch[1]) });
      continue;
    }

    // Section heading "Label :"
    const inlineMatch = line.match(INLINE_HEADING_RE);
    if (inlineMatch) {
      flushList();
      blocks.push({ kind: "heading", text: normalizeHeading(inlineMatch[1]) });
      continue;
    }

    // Liste
    const listMatch = line.match(LIST_ITEM_RE);
    if (listMatch) {
      listItems.push(listMatch[1].trim());
      continue;
    }

    // Paragraphe ordinaire
    flushList();
    blocks.push({ kind: "para", text: line });
  }

  flushList();

  // 3. Fusionner les blocs "para" consécutifs très courts (< 3 mots) en liste
  //    Exemple : 3 lignes d'équipements sans tiret → auto-list
  return coalesceSingleWordParas(blocks);
}

/** Met la première lettre en majuscule, nettoie les espaces */
function normalizeHeading(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase().replace(
    /\b(ct|gps|abs|esp|acc)\b/gi,
    (m) => m.toUpperCase(),
  );
}

/**
 * Si on a ≥ 3 paragraphes courts consécutifs (< 6 mots chacun)
 * sans heading entre eux, on les regroupe en liste.
 */
function coalesceSingleWordParas(blocks: Block[]): Block[] {
  const result: Block[] = [];
  let runParas: string[] = [];

  const flushRun = () => {
    if (runParas.length >= 3) {
      result.push({ kind: "list", items: [...runParas] });
    } else {
      for (const p of runParas) result.push({ kind: "para", text: p });
    }
    runParas = [];
  };

  for (const block of blocks) {
    if (block.kind === "para") {
      const wordCount = block.text.split(/\s+/).length;
      if (wordCount <= 7) {
        runParas.push(block.text);
        continue;
      }
    }
    flushRun();
    result.push(block);
  }
  flushRun();

  return result;
}

// ─────────────────────────────────────────────
//  Rendu React — Server Component safe
// ─────────────────────────────────────────────

export function FormatVehicleDescription({ text }: { text: string }) {
  if (!text?.trim()) return null;

  const blocks = parseDescription(text);

  return (
    <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <h3
              key={i}
              className="text-[#0f172a] font-semibold text-sm uppercase tracking-widest mt-6 mb-2 first:mt-0 flex items-center gap-3"
            >
              <span className="h-px flex-1 bg-slate-100" aria-hidden="true" />
              {block.text}
              <span className="h-px flex-1 bg-slate-100" aria-hidden="true" />
            </h3>
          );
        }

        if (block.kind === "list") {
          return (
            <ul key={i} className="space-y-1.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-500/60 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        // para
        return (
          <p key={i} className="leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
