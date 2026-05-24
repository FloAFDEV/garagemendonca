#!/usr/bin/env tsx
/**
 * verify-image-pipeline.ts
 *
 * Script de vérification du pipeline image complet (Phase 1-3).
 * Lance en une commande : npx tsx scripts/verify-image-pipeline.ts
 *
 * Ce script utilise directement le SDK Supabase et Sharp (sans passer par les
 * routes HTTP) pour tester la couche storage + DB de bout en bout :
 *
 *   1. Génère une image test WebP (Sharp, 100×100)
 *   2. Upload vers storage (simule /api/images/upload-url + PUT)
 *   3. Génère 3 variants (simule /api/images/process)
 *   4. Vérifie l'existence des 3 variants en storage
 *   5. Insère une ligne vehicle_images test en DB
 *   6. Vérifie resolveVehicleUrl() sur chaque variant
 *   7. Supprime les 3 variants du storage
 *   8. Supprime la ligne DB
 *   9. Vérifie l'absence des variants (storage clean)
 *  10. Rapport final pass/fail
 *
 * Prérequis : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */

import "dotenv/config";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GARAGE_ID    = process.env.NEXT_PUBLIC_GARAGE_ID;

if (!SUPABASE_URL || !SERVICE_ROLE || !GARAGE_ID) {
  console.error("❌ Variables requises manquantes : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GARAGE_ID");
  process.exit(1);
}

const db     = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const BUCKET = "vehicle-images";

// ─── Helpers ──────────────────────────────────────────────────────

const PASS = "✅";
const FAIL = "❌";
const INFO = "   ";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`${PASS} ${label}`);
    passed++;
  } else {
    console.error(`${FAIL} ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function storageExists(path: string): Promise<boolean> {
  const { error } = await db.storage.from(BUCKET).download(path);
  return !error;
}

// ─── Test vehicle setup ───────────────────────────────────────────

const TEST_VEHICLE_ID = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const UUID            = crypto.randomUUID();
const BASE_PATH       = `${GARAGE_ID}/vehicles/${TEST_VEHICLE_ID}/${UUID}`;
const ORIG_PATH       = `${BASE_PATH}-orig`;

const VARIANTS = [
  { key: "thumb"  as const, w: 480,  h: 360,  q: 75 },
  { key: "medium" as const, w: 900,  h: 675,  q: 82 },
  { key: "large"  as const, w: 1600, h: 1200, q: 85 },
];

// ─── Main ─────────────────────────────────────────────────────────

async function run() {
  console.log("\n🔍 Pipeline image — vérification complète");
  console.log(`${INFO} basePath : ${BASE_PATH}\n`);

  // ── STEP 1: Generate test image ────────────────────────────────
  console.log("── 1. Génération image test ──");
  let testImage: Buffer;
  try {
    testImage = await sharp({
      create: { width: 200, height: 150, channels: 3, background: { r: 72, g: 141, b: 222 } },
    }).jpeg({ quality: 90 }).toBuffer();
    assert(testImage.length > 0, `Image test générée (${testImage.length} bytes)`);
  } catch (err) {
    assert(false, "Génération image test", String(err));
    process.exit(1);
  }

  // ── STEP 2: Upload original to storage ────────────────────────
  console.log("\n── 2. Upload original → storage ──");
  const { error: uploadOrigErr } = await db.storage
    .from(BUCKET)
    .upload(ORIG_PATH, testImage, { contentType: "image/jpeg", upsert: false });
  assert(!uploadOrigErr, "Upload original", uploadOrigErr?.message);

  // ── STEP 3: Generate 3 variants with Sharp ────────────────────
  console.log("\n── 3. Génération variants Sharp ──");
  const base = sharp(testImage).rotate();
  for (const v of VARIANTS) {
    let buf: Buffer;
    try {
      buf = await base.clone()
        .resize(v.w, v.h, { fit: "cover", position: "attention", withoutEnlargement: true })
        .webp({ quality: v.q, effort: 4 })
        .toBuffer();
    } catch (err) {
      assert(false, `Sharp ${v.key}`, String(err));
      continue;
    }

    const { error: varErr } = await db.storage
      .from(BUCKET)
      .upload(`${BASE_PATH}-${v.key}.webp`, buf, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "public, max-age=31536000, immutable",
      });
    assert(!varErr, `Upload ${v.key} (${buf.length} bytes)`, varErr?.message);
  }

  // Delete temp original
  await db.storage.from(BUCKET).remove([ORIG_PATH]);
  assert(!(await storageExists(ORIG_PATH)), "Original supprimé après traitement");

  // ── STEP 4: Verify all 3 variants exist in storage ────────────
  console.log("\n── 4. Vérification existence variants ──");
  for (const v of VARIANTS) {
    const exists = await storageExists(`${BASE_PATH}-${v.key}.webp`);
    assert(exists, `Variant ${v.key} présent en storage`);
  }

  // ── STEP 5: Insert vehicle_images DB row ──────────────────────
  console.log("\n── 5. Insertion DB vehicle_images ──");
  const mediumUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${BASE_PATH}-medium.webp`;
  const { error: insertErr } = await db.from("vehicle_images").insert({
    vehicle_id:   TEST_VEHICLE_ID,
    garage_id:    GARAGE_ID,
    url:          mediumUrl,
    storage_path: BASE_PATH,   // canonical basePath (no extension)
    sort_order:   0,
    is_primary:   true,
    alt:          "Véhicule test pipeline",
    mime_type:    "image/webp",
  });
  assert(!insertErr, "Insertion vehicle_images DB", insertErr?.message);

  // ── STEP 6: Verify resolveVehicleUrl() output ─────────────────
  console.log("\n── 6. Vérification resolveVehicleUrl() ──");
  // Dynamic import to avoid module resolution issues in script context
  const { resolveVehicleUrl } = await import("../lib/utils/vehicle-images.js").catch(
    () => import("../lib/utils/vehicle-images.ts" as string) as never
  ) as { resolveVehicleUrl: (s: string, v: string) => string | null };

  for (const v of VARIANTS) {
    const resolved = resolveVehicleUrl(BASE_PATH, v.key as "thumb" | "medium" | "large");
    const expected = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${BASE_PATH}-${v.key}.webp`;
    assert(resolved === expected, `resolveVehicleUrl basePath → ${v.key}`, resolved ?? "null");
  }

  // Test: full medium URL → thumb variant
  const fromUrl = resolveVehicleUrl(mediumUrl, "thumb");
  const thumbExpected = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${BASE_PATH}-thumb.webp`;
  assert(fromUrl === thumbExpected, "resolveVehicleUrl full URL → thumb cross-variant");

  // ── STEP 7: Delete variants from storage ──────────────────────
  console.log("\n── 7. Suppression variants storage ──");
  const pathsToDelete = VARIANTS.map((v) => `${BASE_PATH}-${v.key}.webp`);
  const { error: deleteErr } = await db.storage.from(BUCKET).remove(pathsToDelete);
  assert(!deleteErr, "Suppression 3 variants", deleteErr?.message);

  // ── STEP 8: Delete DB row ─────────────────────────────────────
  console.log("\n── 8. Suppression DB ──");
  const { error: dbDeleteErr } = await db.from("vehicle_images").delete().eq("vehicle_id", TEST_VEHICLE_ID);
  assert(!dbDeleteErr, "Suppression vehicle_images DB", dbDeleteErr?.message);

  // ── STEP 9: Verify storage is clean ───────────────────────────
  console.log("\n── 9. Vérification absence variants (storage clean) ──");
  for (const v of VARIANTS) {
    const exists = await storageExists(`${BASE_PATH}-${v.key}.webp`);
    assert(!exists, `Variant ${v.key} absent après suppression`);
  }

  // ── STEP 10: Verify DB is clean ───────────────────────────────
  console.log("\n── 10. Vérification absence DB ──");
  const { data: remaining } = await db
    .from("vehicle_images")
    .select("id")
    .eq("vehicle_id", TEST_VEHICLE_ID);
  assert(!remaining?.length, "Aucune ligne DB restante");

  // ── Final report ──────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Résultat : ${passed} ✅  ${failed} ❌`);
  if (failed === 0) {
    console.log("🎉 Pipeline image opérationnel — système production-grade confirmé.\n");
    process.exit(0);
  } else {
    console.error(`⚠️  ${failed} vérification(s) échouée(s) — voir détails ci-dessus.\n`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("❌ Erreur inattendue:", err);
  process.exit(1);
});
