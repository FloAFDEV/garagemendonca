/**
 * scrape-vehicles.ts
 *
 * Scrape toutes les pages /nos-voitures-N.html du site garagemendonca.com
 * et génère scripts/scraped-vehicles.json.
 *
 * Usage:
 *   npx tsx scripts/scrape-vehicles.ts
 *   DRY_RUN=true npx tsx scripts/scrape-vehicles.ts
 *   DEBUG=true npx tsx scripts/scrape-vehicles.ts
 *   MAX_PAGES=3 npx tsx scripts/scrape-vehicles.ts   # limiter pour test
 */

import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { load as cheerioLoad } from "cheerio";

const BASE_URL = "https://www.garagemendonca.com";
const DRY_RUN = process.env.DRY_RUN === "true";
const DEBUG = process.env.DEBUG === "true";
const MAX_PAGES = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES, 10) : Infinity;
const OUTPUT_FILE = path.join(process.cwd(), "scripts", "scraped-vehicles.json");
const RETRY_COUNT = 3;
const DELAY_MS = 800; // délai poli entre requêtes

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

export interface ScrapedVehicle {
  externalId: string;       // numéro dans l'URL (ex: "589")
  sourceUrl: string;        // URL complète de la fiche
  title: string;            // titre brut
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL" | "Hydrogène";
  transmission: "Automatique" | "Manuelle";
  power: number;
  price: number;
  description: string;
  images: string[];         // URLs absolues, max 10, ordre original
  slug: string;             // slug SEO généré
}

// ─────────────────────────────────────────────────────────────────
//  HTTP fetch avec retry
// ─────────────────────────────────────────────────────────────────

function fetchHtml(url: string, attempt = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; GarageScraper/1.0)" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location ?? "";
        return resolve(fetchHtml(loc.startsWith("http") ? loc : `${BASE_URL}/${loc}`, attempt));
      }
      if ((res.statusCode ?? 0) >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("error", async (err) => {
      if (attempt < RETRY_COUNT) {
        console.warn(`  ⚠️  Retry ${attempt}/${RETRY_COUNT} for ${url}: ${err.message}`);
        await sleep(DELAY_MS * attempt);
        resolve(fetchHtml(url, attempt + 1));
      } else {
        reject(err);
      }
    });
    req.setTimeout(15_000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────
//  Parsers utilitaires
// ─────────────────────────────────────────────────────────────────

/** Décode les entités HTML basiques */
function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .trim();
}

/** Génère un slug SEO depuis les composants véhicule */
function makeSlug(brand: string, model: string, year: number, externalId: string): string {
  const raw = `${brand}-${model}-${year}-${externalId}`;
  return raw
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")  // enlève accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Extrait l'external_id depuis une URL de fiche */
function extractExternalId(href: string): string {
  const m = href.match(/-(\d+)\.html$/);
  return m ? m[1] : "";
}

/** Normalise le nom de marque */
function normalizeBrand(raw: string): string {
  const map: Record<string, string> = {
    CITROEN: "Citroën",
    TOYOTA: "Toyota",
    HONDA: "Honda",
    RENAULT: "Renault",
    PEUGEOT: "Peugeot",
    NISSAN: "Nissan",
    HYUNDAI: "Hyundai",
    KIA: "Kia",
    SUZUKI: "Suzuki",
    MITSUBISHI: "Mitsubishi",
    VOLKSWAGEN: "Volkswagen",
    OPEL: "Opel",
    FORD: "Ford",
    MERCEDES: "Mercedes",
    MINI: "Mini",
    SKODA: "Skoda",
    JEEP: "Jeep",
  };
  const upper = raw.toUpperCase();
  return map[upper] ?? (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase());
}

/**
 * Parse le titre pour extraire brand, model, power, transmission hint.
 * Exemples :
 *   "Honda Jazz 1.4i 83 ch ES / Boite Automatique"
 *   "TOYOTA Yaris 1.33i 100 ch Collection / 1°Main"
 *   "Renault Twingo 3 / 0.9i 90 ch Intens"
 */
function parseTitle(title: string): { brand: string; model: string; power: number } {
  const t = decodeHtml(title).replace(/\s+/g, " ").trim();
  const words = t.split(" ");

  const brand = normalizeBrand(words[0]);

  // Modèle = mots entre brand et la cylindrée moteur (ex: "1.4i", "1.0", "2.0i")
  // Cas particulier : "Peugeot 107", "Peugeot 108" — le modèle EST un chiffre
  let modelWords: string[] = [];
  let i = 1;
  while (i < words.length) {
    const w = words[i];
    if (w === "/") break;
    // Cylindrée moteur (ex: "1.4i", "0.9i", "1.0", "2.2") → stop
    if (/^\d+\.\d/.test(w)) break;
    // Nombre pur ≥ 100 sans lettre → modèle numérique (107, 108, 206, C4…) → garder
    if (/^\d+$/.test(w) && parseInt(w, 10) >= 100) { modelWords.push(w); i++; break; }
    // Nombre pur < 100 (ex: "3" dans "Twingo 3") → modèle partiel, garder et stop
    if (/^\d+$/.test(w) && parseInt(w, 10) < 100) { modelWords.push(w); i++; break; }
    modelWords.push(w);
    i++;
  }
  const model = modelWords.join(" ") || "Inconnue";

  // Puissance : chercher "XX ch" dans le titre
  const powerMatch = t.match(/(\d+)\s*ch\b/i);
  const power = powerMatch ? parseInt(powerMatch[1], 10) : 0;

  return { brand, model, power };
}

/**
 * Détecte le carburant depuis le titre + description.
 * N.B. : \b ne couvre pas les accents en JS — éviter d\.?\b sur texte français.
 */
function detectFuel(title: string, description: string): ScrapedVehicle["fuel"] {
  const text = (title + " " + description).toLowerCase();
  if (/\b(eh|100h|hybride|hybrid|hev|phev)\b/.test(text)) return "Hybride";
  if (/\b(electr|électr|bev|zev|kwh)\b/.test(text)) return "Électrique";
  if (/\b(gpl|glp)\b/.test(text)) return "GPL";
  // Marqueurs diesel spécifiques — éviter les patterns trop courts comme "d\b"
  if (/\b(hdi|tdi|cdti|blue.?hdi|dci|blue.?dci|crdi|jtd|diesel)\b/.test(text)) return "Diesel";
  // Ford TDCi ou BMW xd
  if (/tdci|tddi|\b\d\.\dd\b/.test(text)) return "Diesel";
  return "Essence";
}

/**
 * Extrait kilométrage et année depuis la description.
 * Pattern: "80 900 kms du 18/04/2008" ou "80900 km du 2008"
 */
function extractMileageAndYear(description: string): { mileage: number; year: number } {
  // Pattern principal: "XX XXX kms du dd/mm/yyyy"
  const fullPattern = description.match(/([\d\s]+)\s*kms?\s+du\s+\d{2}\/\d{2}\/(\d{4})/i);
  if (fullPattern) {
    const mileage = parseInt(fullPattern[1].replace(/\s/g, ""), 10);
    const year = parseInt(fullPattern[2], 10);
    if (mileage > 0 && year > 1990) return { mileage, year };
  }

  // Pattern secondaire: "XXX XXX km" quelque part
  const kmPattern = description.match(/([\d\s]{4,})\s*km/i);
  const mileage = kmPattern ? parseInt(kmPattern[1].replace(/\s/g, ""), 10) : 0;

  // Année depuis un pattern de date dd/mm/yyyy
  const datePattern = description.match(/\d{2}\/\d{2}\/(\d{4})/);
  const year = datePattern ? parseInt(datePattern[1], 10) : 0;

  // Fallback année depuis "de XXXX" ou "du XXXX"
  const yearFallback = description.match(/\b(20[012]\d|19[89]\d)\b/);
  const yearFinal = year > 1990 ? year : (yearFallback ? parseInt(yearFallback[1], 10) : 2010);

  return { mileage: mileage > 0 ? mileage : 0, year: yearFinal };
}

/**
 * Extrait le prix depuis le texte "8 990 €" → 8990.
 */
function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

// ─────────────────────────────────────────────────────────────────
//  Scraping d'une page de listing
// ─────────────────────────────────────────────────────────────────

interface ListingItem {
  href: string;
  externalId: string;
  thumbImage: string;
}

function parseListingPage(html: string): { items: ListingItem[]; totalPages: number } {
  const $ = cheerioLoad(html);
  const items: ListingItem[] = [];

  // Chaque véhicule est dans un .ann
  $(".ann").each((_, el) => {
    const link = $(el).find("a[href^='details-']").first();
    const href = link.attr("href") ?? "";
    if (!href) return;

    const externalId = extractExternalId(href);
    if (!externalId) return;

    const img = $(el).find("img").first().attr("src") ?? "";
    const thumbImage = img ? `${BASE_URL}/${img}` : "";

    items.push({ href: `${BASE_URL}/${href}`, externalId, thumbImage });
  });

  // Détecter le nombre total de pages depuis les liens de pagination
  let totalPages = 1;
  $("a[href^='nos-voitures-']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const m = href.match(/nos-voitures-(\d+)\.html/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > totalPages) totalPages = n;
    }
  });

  if (DEBUG) console.log(`  Listing: ${items.length} véhicules, ${totalPages} pages`);
  return { items, totalPages };
}

// ─────────────────────────────────────────────────────────────────
//  Scraping d'une fiche détail
// ─────────────────────────────────────────────────────────────────

async function scrapeDetailPage(url: string, externalId: string): Promise<ScrapedVehicle | null> {
  let html: string;
  try {
    html = await fetchHtml(url);
  } catch (err) {
    console.error(`  ❌ Impossible de charger ${url}: ${err}`);
    return null;
  }

  const $ = cheerioLoad(html);

  // Titre principal
  const rawTitle = $("h1.fiche-titre").first().text().trim()
    || $("h1").first().text().trim()
    || $("title").text().replace(/ - Garage Mendon[çc]a.*/, "").trim();
  const title = decodeHtml(rawTitle);

  // Champs structurés (libellé → valeur)
  // Sur les pages détail, les spans sont directs dans .ann-detail (pas de .elem wrapper)
  const fields: Record<string, string> = {};
  const libelles = $(".ann-detail .ann-detail-libelle").toArray();
  for (const labelEl of libelles) {
    const label = $(labelEl).text().replace(/:/g, "").trim().toLowerCase();
    const valEl = $(labelEl).next(".ann-detail-valeur");
    const value = valEl.text().replace(/\s+/g, " ").trim();
    if (label && value) fields[label] = value;
  }
  // Fallback : .elem wrapper (pages listing)
  if (Object.keys(fields).length === 0) {
    $(".ann-detail .elem").each((_, el) => {
      const label = $(el).find(".ann-detail-libelle").text().replace(":", "").trim().toLowerCase();
      const value = $(el).find(".ann-detail-valeur").text().replace(/\s+/g, " ").trim();
      if (label) fields[label] = value;
    });
  }

  // Prix
  const priceRaw = fields["prix"] ?? "";
  const price = parsePrice(priceRaw);

  // Description complète
  const descParts: string[] = [];
  $(".txt_contenu, .fiche-desc").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (txt) descParts.push(txt);
  });
  const description = descParts.join("\n\n").substring(0, 3000);

  // Transmission
  const boiteRaw = (fields["boîte de vitesse"] ?? fields["boite de vitesse"] ?? "").toUpperCase();
  // Fallback titre/desc si le champ structuré est vide
  const autoInText = /boite automatique|boîte automatique|\bcvt\b/i.test(title + " " + description);
  const transmission: ScrapedVehicle["transmission"] =
    /automatique|auto|cvt/.test(boiteRaw) || autoInText ? "Automatique" : "Manuelle";

  // Title parsing
  const { brand, model, power } = parseTitle(title);

  // Fuel + mileage + year depuis description
  const fuel = detectFuel(title, description);
  const { mileage, year } = extractMileageAndYear(description);

  // Images : depuis les liens lightbox (ordre préservé), max 10
  const imageUrls: string[] = [];
  const seen = new Set<string>();

  // Source 1 : liens gallery (ordre exact du site)
  $("a.gallery[href]").each((_, el) => {
    if (imageUrls.length >= 10) return;
    const href = $(el).attr("href") ?? "";
    const fullUrl = href.startsWith("http") ? href : `${BASE_URL}/${href}`;
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      imageUrls.push(fullUrl);
    }
  });

  // Source 2 : fallback sur <img src="public/img/big/..."> dans le diaporama
  if (imageUrls.length === 0) {
    $("img[src*='public/img/big/']").each((_, el) => {
      if (imageUrls.length >= 10) return;
      const src = $(el).attr("src") ?? "";
      const fullUrl = src.startsWith("http") ? src : `${BASE_URL}/${src}`;
      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        imageUrls.push(fullUrl);
      }
    });
  }

  // Génération du slug SEO
  const slug = makeSlug(brand, model, year, externalId);

  const vehicle: ScrapedVehicle = {
    externalId,
    sourceUrl: url,
    title,
    brand,
    model,
    year,
    mileage,
    fuel,
    transmission,
    power,
    price,
    description,
    images: imageUrls,
    slug,
  };

  if (DEBUG) {
    console.log(`    → ${brand} ${model} ${year} | ${mileage}km | ${price}€ | ${transmission} | ${fuel} | ${imageUrls.length} photos`);
  }

  return vehicle;
}

// ─────────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚗  Scraper Garage Mendonça — démarrage");
  console.log(`    BASE_URL  : ${BASE_URL}`);
  console.log(`    DRY_RUN   : ${DRY_RUN}`);
  console.log(`    DEBUG     : ${DEBUG}`);
  console.log(`    MAX_PAGES : ${MAX_PAGES === Infinity ? "∞" : MAX_PAGES}`);
  console.log(`    OUTPUT    : ${OUTPUT_FILE}`);
  console.log("");

  // ── Étape 1 : détecter le nombre de pages ──────────────────────
  console.log("📋 Étape 1 — Détection du nombre de pages...");
  const firstHtml = await fetchHtml(`${BASE_URL}/nos-voitures-1.html`);
  const { items: firstItems, totalPages: detected } = parseListingPage(firstHtml);
  const totalPages = Math.min(detected, MAX_PAGES);
  console.log(`   Pages détectées : ${detected} → scraping ${totalPages} page(s)`);

  // ── Étape 2 : collecter tous les liens ─────────────────────────
  console.log("\n📋 Étape 2 — Collecte des liens véhicules...");
  const allListingItems: ListingItem[] = [...firstItems];

  for (let page = 2; page <= totalPages; page++) {
    const url = `${BASE_URL}/nos-voitures-${page}.html`;
    console.log(`   Page ${page}/${totalPages} — ${url}`);
    try {
      await sleep(DELAY_MS);
      const html = await fetchHtml(url);
      const { items } = parseListingPage(html);
      allListingItems.push(...items);
    } catch (err) {
      console.error(`   ❌ Erreur page ${page}: ${err}`);
    }
  }

  // Déduplique par externalId (un véhicule peut apparaître sur plusieurs pages de navigation)
  const uniqueMap = new Map<string, ListingItem>();
  for (const item of allListingItems) {
    if (!uniqueMap.has(item.externalId)) uniqueMap.set(item.externalId, item);
  }
  const uniqueItems = Array.from(uniqueMap.values());
  console.log(`\n   Total véhicules uniques trouvés : ${uniqueItems.length}`);

  if (DRY_RUN) {
    console.log("\n🏜️  DRY_RUN actif — arrêt avant scraping des fiches");
    console.log("   Liens collectés :", uniqueItems.slice(0, 5).map((i) => i.href));
    return;
  }

  // ── Étape 3 : scraper chaque fiche ────────────────────────────
  console.log("\n📋 Étape 3 — Scraping des fiches détail...");
  const vehicles: ScrapedVehicle[] = [];
  const errors: string[] = [];

  for (let i = 0; i < uniqueItems.length; i++) {
    const item = uniqueItems[i];
    const prefix = `   [${String(i + 1).padStart(3, " ")}/${uniqueItems.length}]`;
    console.log(`${prefix} ${item.href}`);

    await sleep(DELAY_MS);
    const vehicle = await scrapeDetailPage(item.href, item.externalId);

    if (vehicle) {
      vehicles.push(vehicle);
    } else {
      errors.push(item.href);
    }
  }

  // ── Étape 4 : écriture du JSON ────────────────────────────────
  console.log(`\n📋 Étape 4 — Écriture de ${OUTPUT_FILE}...`);
  const output = {
    scrapedAt: new Date().toISOString(),
    totalPages,
    totalVehicles: vehicles.length,
    errors: errors.length > 0 ? errors : undefined,
    vehicles,
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

  // ── Résumé ─────────────────────────────────────────────────────
  console.log("\n✅  Scraping terminé !");
  console.log(`    Véhicules : ${vehicles.length}`);
  console.log(`    Erreurs   : ${errors.length}`);
  if (errors.length > 0) {
    console.log("    URLs en erreur :");
    errors.forEach((e) => console.log(`      - ${e}`));
  }

  // Stats rapides
  const brands = new Map<string, number>();
  for (const v of vehicles) {
    brands.set(v.brand, (brands.get(v.brand) ?? 0) + 1);
  }
  console.log("\n    Répartition marques :");
  for (const [brand, count] of [...brands.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`      ${brand.padEnd(16)} : ${count}`);
  }

  const withImages = vehicles.filter((v) => v.images.length > 0).length;
  const avgImages = vehicles.reduce((s, v) => s + v.images.length, 0) / vehicles.length;
  console.log(`\n    Véhicules avec images : ${withImages}/${vehicles.length}`);
  console.log(`    Moyenne images/véhicule : ${avgImages.toFixed(1)}`);
}

main().catch((err) => { console.error("❌ Erreur fatale:", err); process.exit(1); });
