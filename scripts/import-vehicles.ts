/**
 * import-vehicles.ts
 *
 * Importe les véhicules scrapés (scripts/scraped-vehicles.json) dans Supabase.
 * Idempotent : skip si external_id déjà présent.
 *
 * Usage:
 *   npx tsx scripts/import-vehicles.ts
 *   DRY_RUN=true npx tsx scripts/import-vehicles.ts
 *   VALIDATE_ONLY=true npx tsx scripts/import-vehicles.ts
 *
 * Variables d'environnement requises (copier depuis .env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_GARAGE_ID
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import type { ScrapedVehicle } from "./scrape-vehicles";

// ── Chargement des variables d'environnement ─────────────────────
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
const DRY_RUN = process.env.DRY_RUN === "true";
const VALIDATE_ONLY = process.env.VALIDATE_ONLY === "true";
const INPUT_FILE = path.join(process.cwd(), "scripts", "scraped-vehicles.json");
const BATCH_SIZE = 10;
const MAX_IMAGES = 10;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GARAGE_ID) {
  console.error("❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GARAGE_ID");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─────────────────────────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────────────────────────

interface ValidationIssue {
  externalId: string;
  field: string;
  issue: string;
  value: unknown;
}

function validateVehicle(v: ScrapedVehicle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const warn = (field: string, issue: string, value: unknown) =>
    issues.push({ externalId: v.externalId, field, issue, value });

  if (!v.brand) warn("brand", "vide", v.brand);
  if (!v.model) warn("model", "vide", v.model);
  if (v.year < 1990 || v.year > new Date().getFullYear() + 1) warn("year", "hors plage", v.year);
  if (v.price <= 0) warn("price", "invalide (≤ 0)", v.price);
  if (v.mileage < 0) warn("mileage", "négatif", v.mileage);
  if (v.mileage === 0) warn("mileage", "zéro — non extrait?", v.mileage);
  if (v.images.length === 0) warn("images", "aucune image", v.images.length);
  if (!v.slug) warn("slug", "vide", v.slug);
  if (v.description.length < 50) warn("description", "très courte", v.description.length);

  return issues;
}

// ─────────────────────────────────────────────────────────────────
//  Import Supabase
// ─────────────────────────────────────────────────────────────────

interface ImportResult {
  externalId: string;
  slug: string;
  action: "inserted" | "skipped" | "error";
  error?: string;
}

async function getExistingExternalIds(): Promise<Set<string>> {
  const { data, error } = await db
    .from("vehicles")
    .select("external_id")
    .eq("garage_id", GARAGE_ID)
    .not("external_id", "is", null);

  if (error) throw new Error(`Lecture external_ids: ${error.message}`);
  return new Set((data ?? []).map((r: { external_id: string | null }) => r.external_id ?? "").filter(Boolean));
}

async function insertVehicle(v: ScrapedVehicle): Promise<string> {
  const payload = {
    garage_id: GARAGE_ID,
    external_id: v.externalId,
    brand: v.brand,
    model: v.model,
    year: v.year,
    mileage: v.mileage,
    fuel: v.fuel,
    transmission: v.transmission,
    power: v.power,
    price: v.price,
    description: v.description,
    slug: v.slug,
    status: "published" as const,
    color: "Inconnue",
    doors: 5,
    // JSONB legacy fallback (sera remplacé par vehicle_images)
    images: v.images.slice(0, MAX_IMAGES),
    thumbnail_url: v.images[0] ?? null,
    published_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from("vehicles")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

async function insertVehicleImages(vehicleId: string, v: ScrapedVehicle): Promise<void> {
  const images = v.images.slice(0, MAX_IMAGES);
  if (images.length === 0) return;

  const rows = images.map((url, idx) => ({
    vehicle_id: vehicleId,
    garage_id: GARAGE_ID,
    url,
    is_primary: idx === 0,
    sort_order: idx,
    alt: `${v.brand} ${v.model} ${v.year}${idx > 0 ? ` — photo ${idx + 1}` : ""}`,
  }));

  const { error } = await db.from("vehicle_images").insert(rows);
  if (error) throw new Error(`vehicle_images: ${error.message}`);
}

async function processVehicle(
  v: ScrapedVehicle,
  existing: Set<string>,
): Promise<ImportResult> {
  if (existing.has(v.externalId)) {
    return { externalId: v.externalId, slug: v.slug, action: "skipped" };
  }

  if (DRY_RUN) {
    return { externalId: v.externalId, slug: v.slug, action: "inserted" };
  }

  try {
    const vehicleId = await insertVehicle(v);
    await insertVehicleImages(vehicleId, v);
    return { externalId: v.externalId, slug: v.slug, action: "inserted" };
  } catch (err) {
    return {
      externalId: v.externalId,
      slug: v.slug,
      action: "error",
      error: String(err),
    };
  }
}

// ─────────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀  Import Garage Mendonça → Supabase");
  console.log(`    GARAGE_ID     : ${GARAGE_ID}`);
  console.log(`    DRY_RUN       : ${DRY_RUN}`);
  console.log(`    VALIDATE_ONLY : ${VALIDATE_ONLY}`);
  console.log(`    INPUT         : ${INPUT_FILE}`);
  console.log("");

  // ── Lecture du JSON scrapé ────────────────────────────────────
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Fichier introuvable : ${INPUT_FILE}`);
    console.error("   Lancez d'abord : npx tsx scripts/scrape-vehicles.ts");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const vehicles: ScrapedVehicle[] = raw.vehicles ?? [];
  console.log(`📂  ${vehicles.length} véhicule(s) chargés (scrapés le ${raw.scrapedAt})`);

  // ── Validation ────────────────────────────────────────────────
  console.log("\n🔍  Validation des données...");
  const allIssues: ValidationIssue[] = [];
  for (const v of vehicles) {
    allIssues.push(...validateVehicle(v));
  }

  if (allIssues.length > 0) {
    console.warn(`\n⚠️   ${allIssues.length} problème(s) détecté(s) :`);
    for (const issue of allIssues) {
      console.warn(`    [${issue.externalId}] ${issue.field}: ${issue.issue} (valeur: ${JSON.stringify(issue.value)})`);
    }
  } else {
    console.log("    ✅ Données valides");
  }

  if (VALIDATE_ONLY) {
    console.log("\n🏜️  VALIDATE_ONLY — arrêt avant import");
    return;
  }

  // ── Récupération des IDs existants ────────────────────────────
  console.log("\n📡  Connexion Supabase...");
  let existingIds: Set<string>;
  try {
    existingIds = await getExistingExternalIds();
    console.log(`    ${existingIds.size} véhicule(s) déjà en base`);
  } catch (err) {
    console.error("❌  Erreur connexion:", err);
    process.exit(1);
  }

  // ── Import par batch ──────────────────────────────────────────
  console.log(`\n📋  Import (batch de ${BATCH_SIZE})...`);
  if (DRY_RUN) console.log("    Mode DRY_RUN : aucune écriture\n");

  const results: ImportResult[] = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < vehicles.length; i += BATCH_SIZE) {
    const batch = vehicles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((v) => processVehicle(v, existingIds)),
    );

    for (const res of batchResults) {
      results.push(res);
      const prefix = `    [${String(results.length).padStart(3, " ")}/${vehicles.length}]`;
      if (res.action === "inserted") {
        inserted++;
        console.log(`${prefix} ✅ ${res.externalId} → ${res.slug}`);
      } else if (res.action === "skipped") {
        skipped++;
        console.log(`${prefix} ⏭️  ${res.externalId} (déjà en base)`);
      } else {
        errors++;
        console.error(`${prefix} ❌ ${res.externalId}: ${res.error}`);
      }
    }

    // Pause entre batches pour ne pas saturer Supabase
    if (i + BATCH_SIZE < vehicles.length) await new Promise((r) => setTimeout(r, 200));
  }

  // ── Résumé ─────────────────────────────────────────────────────
  console.log("\n✅  Import terminé !");
  console.log(`    Insérés  : ${inserted}`);
  console.log(`    Ignorés  : ${skipped} (déjà existants)`);
  console.log(`    Erreurs  : ${errors}`);

  if (errors > 0) {
    console.log("\n    Erreurs détail :");
    results.filter((r) => r.action === "error").forEach((r) => {
      console.error(`      [${r.externalId}] ${r.error}`);
    });
    process.exit(1);
  }
}

main().catch((err) => { console.error("❌ Erreur fatale:", err); process.exit(1); });
