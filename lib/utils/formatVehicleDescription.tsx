/**
 * Transforme une description véhicule brute en blocs React structurés.
 * Server Component safe — pas de hooks, pas d'API browser.
 *
 * Patterns détectés :
 *  - ## Titre             → <h3> section (markdown standard)
 *  - ***** TITRE *****    → <h3> section (format concession)
 *  - "Label :" seul       → <h3> section
 *  - "- item" / "• item"  → <ul> liste
 *  - " / " séparateur     → plusieurs paragraphes
 *  - **gras**             → <strong> inline
 *  - Texte ordinaire      → <p>
 */

import React from "react";

// ─────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────

type InlineNode = string | { bold: string };

type Block =
  | { kind: "heading"; text: string }
  | { kind: "para"; nodes: InlineNode[] }
  | { kind: "list"; items: InlineNode[][] };

// ─────────────────────────────────────────────────────────────────────
//  Regex
// ─────────────────────────────────────────────────────────────────────

const MARKDOWN_HEADING_RE = /^#{1,3}\s+(.+)/;
const STAR_HEADING_RE     = /^[*=\-_]{2,}\s*(.+?)\s*[*=\-_]{2,}$/;
const INLINE_HEADING_RE   = /^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜ][A-ZÀ-ÿa-z\s&'/()-]{1,50})\s*:\s*$/;
const LIST_ITEM_RE        = /^[-•*]\s+(.+)/;
const SLASH_SEP_RE        = /\s*\/\s+|\s+\/\s*/;

// ─────────────────────────────────────────────────────────────────────
//  Inline parser — **bold**
// ─────────────────────────────────────────────────────────────────────

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push({ bold: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return nodes.length ? nodes : [text];
}

function renderInline(nodes: InlineNode[], prefix: string): React.ReactNode[] {
  return nodes.map((n, i) =>
    typeof n === "string"
      ? n
      : <strong key={`${prefix}-b${i}`} className="font-semibold text-slate-800">{n.bold}</strong>,
  );
}

// ─────────────────────────────────────────────────────────────────────
//  Parser
// ─────────────────────────────────────────────────────────────────────

function parseDescription(raw: string): Block[] {
  const blocks: Block[] = [];
  const listBuf: string[] = [];

  const flushList = () => {
    if (listBuf.length > 0) {
      blocks.push({ kind: "list", items: listBuf.map(parseInline) });
      listBuf.length = 0;
    }
  };

  // 1. Expand lines — split on " / " except for headings/lists
  const expanded: string[] = [];
  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line) { expanded.push(""); continue; }

    const isSpecial =
      MARKDOWN_HEADING_RE.test(line) ||
      STAR_HEADING_RE.test(line) ||
      INLINE_HEADING_RE.test(line) ||
      LIST_ITEM_RE.test(line);

    if (isSpecial) { expanded.push(line); continue; }

    const parts = line.split(SLASH_SEP_RE).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) parts.forEach((p) => expanded.push(p));
    else expanded.push(line);
  }

  // 2. Classify each line
  for (const line of expanded) {
    if (!line) { flushList(); continue; }

    const mdH = line.match(MARKDOWN_HEADING_RE);
    if (mdH) {
      flushList();
      blocks.push({ kind: "heading", text: normalizeHeading(mdH[1]) });
      continue;
    }

    const starH = line.match(STAR_HEADING_RE);
    if (starH) {
      flushList();
      blocks.push({ kind: "heading", text: normalizeHeading(starH[1]) });
      continue;
    }

    const inlineH = line.match(INLINE_HEADING_RE);
    if (inlineH) {
      flushList();
      blocks.push({ kind: "heading", text: normalizeHeading(inlineH[1]) });
      continue;
    }

    const listM = line.match(LIST_ITEM_RE);
    if (listM) {
      listBuf.push(listM[1].trim());
      continue;
    }

    flushList();
    blocks.push({ kind: "para", nodes: parseInline(line) });
  }

  flushList();

  return coalesceSingleWordParas(blocks);
}

function normalizeHeading(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return (
    t.charAt(0).toUpperCase() +
    t.slice(1).toLowerCase().replace(/\b(ct|gps|abs|esp|acc)\b/gi, (m) => m.toUpperCase())
  );
}

/**
 * Fusionne ≥3 paragraphes courts consécutifs (≤7 mots) en liste.
 * Gère les textes collés sans tirets explicites.
 */
function coalesceSingleWordParas(blocks: Block[]): Block[] {
  const result: Block[] = [];
  let run: InlineNode[][] = [];

  const flushRun = () => {
    if (run.length >= 3) result.push({ kind: "list", items: [...run] });
    else run.forEach((nodes) => result.push({ kind: "para", nodes }));
    run = [];
  };

  for (const b of blocks) {
    if (b.kind === "para") {
      const words = b.nodes.reduce((acc, n) => {
        return acc + (typeof n === "string" ? n : n.bold).split(/\s+/).length;
      }, 0);
      if (words <= 7) { run.push(b.nodes); continue; }
    }
    flushRun();
    result.push(b);
  }
  flushRun();

  return result;
}

// ─────────────────────────────────────────────────────────────────────
//  React component — Server Component safe
// ─────────────────────────────────────────────────────────────────────

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
              className="text-brand-600 font-semibold text-sm uppercase tracking-widest mt-6 mb-2 first:mt-0 flex items-center gap-3"
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
              {block.items.map((nodes, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-500/60 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{renderInline(nodes, `${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="leading-relaxed">
            {renderInline(block.nodes, `${i}`)}
          </p>
        );
      })}
    </div>
  );
}
