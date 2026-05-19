#!/usr/bin/env npx tsx
/**
 * sync-lbc-order.ts — Import ONE-SHOT de l'ordre LBC → display_order Supabase
 *
 * ⚠️  CE SCRIPT EST STRICTEMENT ONE-SHOT.
 *     Il ne doit JAMAIS être importé ou exécuté en production.
 *     Aucune dépendance vers LeBonCoin n'existe dans l'application.
 *
 * ─────────────────────────────────────────────────────────────────
 * Usage :
 *
 *   # Mode automatique (fetch LBC)
 *   npm run sync-lbc
 *   # ou : npx tsx scripts/sync-lbc-order.ts
 *
 *   # Mode manuel (JSON pré-extrait du navigateur, voir plus bas)
 *   npm run sync-lbc -- --input scripts/lbc-listings.json
 *
 *   # Simulation sans écriture DB
 *   npm run sync-lbc -- --dry-run
 *
 * ─────────────────────────────────────────────────────────────────
 * Format du fichier JSON manuel (scripts/lbc-listings.json) :
 *
 *   [
 *     { "subject": "PEUGEOT 107 AUTOMATIQUE 2009", "price": [8950], "list_id": "..." },
 *     { "subject": "SUZUKI SWIFT AUTOMATIQUE 2012", "price": [11950], "list_id": "..." }
 *   ]
 *
 * Pour l'obtenir : ouvrir la boutique LBC dans Chrome DevTools → Network →
 * chercher la requête HTML principale → onglet Response → copier le contenu
 * du tag <script id="__NEXT_DATA__"> → extraire props.pageProps.searchData.ads
 *
 * ─────────────────────────────────────────────────────────────────
 * Règles métier :
 *   - Annonces avec prix = 0 → ignorées
 *   - Matching : brand+model+year (exact) → brand+model (fuzzy) → model+year (fuzzy)
 *   - display_order existant (override admin) → respecté, non écrasé
 *   - Véhicules sans match LBC → display_order NULL (tri par date)
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

// ─── Config ─────────────────────────────────────────────────────

const LBC_BOUTIQUE_URL =
  "https://www.leboncoin.fr/boutique/3924621/garage_auto_mendonca.htm";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GARAGE_ID         = process.env.NEXT_PUBLIC_GARAGE_ID!;

// ─── CLI args ───────────────────────────────────────────────────

const args         = process.argv.slice(2);
const DRY_RUN      = args.includes("--dry-run");
const inputIdx     = args.indexOf("--input");
const INPUT_FILE   = inputIdx !== -1 ? args[inputIdx + 1] : null;
const RESPECT_EXISTING = !args.includes("--force"); // par défaut, respecte les overrides admin

// ─── Types ──────────────────────────────────────────────────────

interface LbcAd {
  subject:   string;
  price:     number[];
  list_id?:  string;
}

interface DbVehicle {
  id:            string;
  brand:         string;
  model:         string;
  year:          number;
  price:         number;
  mileage:       number;
  status:        string;
  display_order: number | null;
  external_id:   string | null;
  slug:          string | null;
}

interface MatchResult {
  dbVehicle:    DbVehicle;
  lbcAd:        LbcAd;
  lbcPosition:  number;  // 1-based
  matchType:    "exact" | "brand_model" | "model_year" | "ambiguous";
}

// ─── Normalisation texte ─────────────────────────────────────────

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-_()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extrait les tokens significatifs d'un titre LBC (supprime mots parasites) */
function tokenize(subject: string): string[] {
  const STOPWORDS = new Set([
    "automatique", "auto", "boite", "essence", "diesel", "hybride",
    "electrique", "gpl", "manuelle", "occasion", "vehicule", "voiture",
    "garage", "mendonca", "garantie", "ct", "ok",
  ]);
  return normalize(subject)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Extrait l'année depuis un titre (4 chiffres entre 1990 et 2030) */
function extractYear(tokens: string[]): number | null {
  const y = tokens.find((t) => /^(19|20)\d{2}$/.test(t));
  return y ? parseInt(y, 10) : null;
}

// ─── Fetch LBC ───────────────────────────────────────────────────

async function fetchLbcListings(): Promise<LbcAd[] | null> {
  console.log("📡 Tentative de récupération de la page LBC...");

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control":   "no-cache",
    "Pragma":          "no-cache",
    "Sec-Fetch-Dest":  "document",
    "Sec-Fetch-Mode":  "navigate",
    "Sec-Fetch-Site":  "none",
  };

  try {
    const res = await fetch(LBC_BOUTIQUE_URL, { headers });
    if (!res.ok) {
      console.warn(`⚠️  LBC a répondu ${res.status} — basculement sur mode manuel.`);
      return null;
    }

    const html = await res.text();

    // LBC est une app Next.js — les données sont dans __NEXT_DATA__
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
    );
    if (!match) {
      console.warn("⚠️  __NEXT_DATA__ introuvable dans la réponse LBC.");
      return null;
    }

    const nextData = JSON.parse(match[1]);

    // Chercher les annonces dans différentes structures possibles de LBC
    const candidates = [
      nextData?.props?.pageProps?.searchData?.ads,
      nextData?.props?.pageProps?.ads,
      nextData?.props?.pageProps?.initialData?.ads,
      nextData?.props?.pageProps?.data?.ads,
    ];

    const ads = candidates.find((c) => Array.isArray(c) && c.length > 0);
    if (!ads) {
      console.warn("⚠️  Structure LBC non reconnue — sauvegarde du HTML pour debug.");
      writeFileSync(join(__dirname, "lbc-debug.html"), html);
      console.warn("    → Fichier scripts/lbc-debug.html créé pour inspection.");
      return null;
    }

    console.log(`✅ ${ads.length} annonces récupérées depuis LBC.`);
    return ads as LbcAd[];
  } catch (err) {
    console.warn(`⚠️  Erreur réseau LBC : ${(err as Error).message}`);
    return null;
  }
}

// ─── Load depuis fichier JSON manuel ─────────────────────────────

function loadFromFile(path: string): LbcAd[] {
  if (!existsSync(path)) {
    throw new Error(`Fichier introuvable : ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  if (!Array.isArray(raw)) throw new Error("Le fichier JSON doit être un tableau.");
  console.log(`📂 ${raw.length} annonces chargées depuis ${path}`);
  return raw as LbcAd[];
}

// ─── Matching ────────────────────────────────────────────────────

function buildMatchKey(brand: string, model: string, year: number): string {
  return `${normalize(brand)} ${normalize(model)} ${year}`;
}

function matchLbcToDb(
  lbcAds: LbcAd[],
  dbVehicles: DbVehicle[],
): { matches: MatchResult[]; unmatched: LbcAd[]; orphans: DbVehicle[] } {
  const matches:    MatchResult[] = [];
  const unmatched:  LbcAd[]      = [];
  const matchedIds  = new Set<string>();

  // Pré-index DB : clé "brand model year" → véhicule(s)
  const exactIndex = new Map<string, DbVehicle[]>();
  for (const v of dbVehicles) {
    const key = buildMatchKey(v.brand, v.model, v.year);
    if (!exactIndex.has(key)) exactIndex.set(key, []);
    exactIndex.get(key)!.push(v);
  }

  for (const ad of lbcAds) {
    // Filtrer prix = 0
    const price = ad.price?.[0] ?? 0;
    if (price === 0) {
      console.log(`  ⏭  Ignoré (prix=0) : "${ad.subject}"`);
      continue;
    }

    const tokens  = tokenize(ad.subject);
    const adYear  = extractYear(tokens);
    const nonYear = tokens.filter((t) => !/^(19|20)\d{2}$/.test(t));

    let matched: DbVehicle | null = null;
    let matchType: MatchResult["matchType"] = "exact";

    // Stratégie 1 : chercher brand + model + year dans les tokens
    for (const v of dbVehicles) {
      if (matchedIds.has(v.id)) continue;
      const brandNorm = normalize(v.brand);
      const modelNorm = normalize(v.model);

      const hasBrand = nonYear.some(
        (t) => t === brandNorm || brandNorm.startsWith(t) || t.startsWith(brandNorm),
      );
      const hasModel = nonYear.some(
        (t) => t === modelNorm || modelNorm.includes(t) || t.includes(modelNorm),
      );
      const hasYear  = adYear === v.year;

      if (hasBrand && hasModel && hasYear) {
        // Plusieurs véhicules identiques ? choisir par prix le plus proche
        const key       = buildMatchKey(v.brand, v.model, v.year);
        const siblings  = (exactIndex.get(key) ?? []).filter((s) => !matchedIds.has(s.id));
        if (siblings.length > 1) {
          const byPrice = siblings.sort(
            (a, b) => Math.abs(a.price - price) - Math.abs(b.price - price),
          );
          matched    = byPrice[0];
          matchType  = "ambiguous";
        } else {
          matched    = v;
          matchType  = "exact";
        }
        break;
      }
    }

    // Stratégie 2 : brand + model sans année
    if (!matched) {
      for (const v of dbVehicles) {
        if (matchedIds.has(v.id)) continue;
        const brandNorm = normalize(v.brand);
        const modelNorm = normalize(v.model);
        const hasBrand  = nonYear.some(
          (t) => t === brandNorm || brandNorm.startsWith(t) || t.startsWith(brandNorm),
        );
        const hasModel  = nonYear.some(
          (t) => t === modelNorm || modelNorm.includes(t) || t.includes(modelNorm),
        );
        if (hasBrand && hasModel) {
          matched   = v;
          matchType = "brand_model";
          break;
        }
      }
    }

    // Stratégie 3 : model + year uniquement (fallback)
    if (!matched && adYear) {
      for (const v of dbVehicles) {
        if (matchedIds.has(v.id)) continue;
        const modelNorm = normalize(v.model);
        const hasModel  = nonYear.some(
          (t) => t === modelNorm || modelNorm.includes(t) || t.includes(modelNorm),
        );
        if (hasModel && adYear === v.year) {
          matched   = v;
          matchType = "model_year";
          break;
        }
      }
    }

    if (matched) {
      matchedIds.add(matched.id);
      matches.push({ dbVehicle: matched, lbcAd: ad, lbcPosition: matches.length + 1, matchType });
    } else {
      unmatched.push(ad);
    }
  }

  const orphans = dbVehicles.filter((v) => !matchedIds.has(v.id));
  return { matches, unmatched, orphans };
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚗  sync-lbc-order — Synchronisation ordre LBC → display_order\n");

  if (!SUPABASE_URL || !SUPABASE_SERVICE || !GARAGE_ID) {
    console.error(
      "❌  Variables d'environnement manquantes :\n" +
      "    NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GARAGE_ID\n" +
      "    → Créer un fichier .env.local et relancer : npx dotenv -e .env.local -- npx ts-node scripts/sync-lbc-order.ts",
    );
    process.exit(1);
  }

  // 1. Charger les annonces LBC
  let lbcAds: LbcAd[] | null = null;

  if (INPUT_FILE) {
    lbcAds = loadFromFile(INPUT_FILE);
  } else {
    lbcAds = await fetchLbcListings();
  }

  if (!lbcAds) {
    console.error(
      "\n❌  Impossible de récupérer les annonces LBC automatiquement.\n\n" +
      "    → Extraire manuellement les données depuis le navigateur :\n" +
      "      1. Ouvrir https://www.leboncoin.fr/boutique/3924621/garage_auto_mendonca.htm\n" +
      "      2. DevTools → Network → actualiser → cliquer sur la requête HTML principale\n" +
      "      3. Response → chercher <script id=\"__NEXT_DATA__\">\n" +
      "      4. Copier le JSON → extraire props.pageProps.searchData.ads (ou pageProps.ads)\n" +
      "      5. Sauvegarder dans scripts/lbc-listings.json\n" +
      "      6. Relancer : npm run sync-lbc -- --input scripts/lbc-listings.json\n",
    );
    process.exit(1);
  }

  // 2. Charger les véhicules de la DB
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
  const { data: dbVehicles, error } = await supabase
    .from("vehicles")
    .select("id, brand, model, year, price, mileage, status, display_order, external_id, slug")
    .eq("garage_id", GARAGE_ID)
    .in("status", ["published", "scheduled", "sold"]);

  if (error) {
    console.error("❌  Erreur Supabase :", error.message);
    process.exit(1);
  }

  console.log(`\n📊  ${(dbVehicles ?? []).length} véhicules en base — ${lbcAds.length} annonces LBC\n`);

  // 3. Matching
  const { matches, unmatched, orphans } = matchLbcToDb(lbcAds, dbVehicles ?? []);

  console.log(`\n📋  RÉSULTATS DU MATCHING`);
  console.log(`${"─".repeat(60)}`);

  for (const m of matches) {
    const v     = m.dbVehicle;
    const tag   = m.matchType === "exact" ? "✅" : m.matchType === "ambiguous" ? "⚡" : "🟡";
    const skip  = RESPECT_EXISTING && v.display_order !== null ? " (skip — override admin)" : "";
    console.log(
      `  ${tag} [${String(m.lbcPosition).padStart(3)}] ${v.brand} ${v.model} ${v.year}` +
      `  ←  "${m.lbcAd.subject}"${skip}`,
    );
  }

  if (unmatched.length > 0) {
    console.log(`\n  ❓ ${unmatched.length} annonces LBC sans match en base :`);
    for (const ad of unmatched) {
      console.log(`     · "${ad.subject}" (${ad.price?.[0] ?? 0} €)`);
    }
  }

  if (orphans.length > 0) {
    console.log(`\n  📦 ${orphans.length} véhicules en base sans correspondance LBC :`);
    for (const v of orphans) {
      console.log(`     · ${v.brand} ${v.model} ${v.year} — ${v.price} €`);
    }
  }

  // 4. Mise à jour DB
  const toUpdate = matches.filter(
    (m) => !RESPECT_EXISTING || m.dbVehicle.display_order === null,
  );

  console.log(`\n${"─".repeat(60)}`);
  console.log(`💾  ${toUpdate.length} véhicules à mettre à jour (${matches.length - toUpdate.length} skippés — override admin)`);

  if (DRY_RUN) {
    console.log("🔍  DRY-RUN — aucune écriture DB.\n");
    return;
  }

  if (toUpdate.length === 0) {
    console.log("✅  Rien à faire.\n");
    return;
  }

  let ok = 0;
  let ko = 0;

  for (const m of toUpdate) {
    const { error: upErr } = await supabase
      .from("vehicles")
      .update({ display_order: m.lbcPosition })
      .eq("id", m.dbVehicle.id);

    if (upErr) {
      console.error(`  ❌  ${m.dbVehicle.id} — ${upErr.message}`);
      ko++;
    } else {
      ok++;
    }
  }

  // Remettre à NULL les orphelins (aucun reset car display_order était déjà NULL)
  // Les véhicules sans match LBC gardent display_order = NULL (fallback created_at)

  console.log(`\n🎉  Terminé : ${ok} mis à jour, ${ko} erreur(s)\n`);
  console.log(
    "📌  Rappel : ce script est one-shot.\n" +
    "    Aucune dépendance vers LeBonCoin n'existe dans l'application.\n",
  );
}

main().catch((err) => {
  console.error("❌  Erreur fatale :", err);
  process.exit(1);
});
