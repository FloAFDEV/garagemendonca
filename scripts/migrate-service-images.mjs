/**
 * migrate-service-images.mjs — Phase 10
 *
 * Pipeline : local WebP + Unsplash download → Sharp WebP → Supabase Storage → service_images DB
 * Idempotent : DELETE existing rows before re-insert.
 *
 * Usage: node --env-file=.env.local scripts/migrate-service-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Config ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GARAGE_ID) {
  console.error("❌ Missing env vars — run: node --env-file=.env.local scripts/migrate-service-images.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─── Source manifest ─────────────────────────────────────────────────────────
//
// Chaque image a une source :
//   { local: "public/images/xxx.webp" }  → lecture fichier local
//   { url: "https://..." }               → download HTTP (Unsplash migration source)
//
// Règle doublon : chaque chemin local ou URL Unsplash n'apparaît QU'UNE FOIS.
//
// Ordre GalleryAtelier (5 premières images) :
//   [0] entretien primary   → grande photo (lg:col-span-2 lg:row-span-2) — vraie personne ✓
//   [1] entretien secondary → top-right 1
//   [2] mecanique primary   → top-right 2
//   [3] mecanique secondary → bottom-right 1
//   [4] carrosserie primary → bottom-right 2

const UNSPLASH = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=85&fm=jpg&fit=crop`;

const MANIFEST = [
  // ── Entretien & Révision ────────────────────────────────────────────────
  {
    service_id: "00000000-0000-0000-0000-000000000301",
    slug: "entretien",
    images: [
      {
        // Grande photo : mécanicien versant l'huile — vraie personne
        source: { local: "public/images/entretien.webp" },
        alt: "Mécanicien effectuant la vidange d'un véhicule au garage Mendonça",
        is_primary: true,
        sort_order: 1,
      },
      {
        // Unsplash : mécanicien travaillant sous le capot
        source: { url: UNSPLASH("1486262715619-67b85e0b08d3") },
        alt: "Technicien contrôlant le moteur lors d'une révision complète",
        is_primary: false,
        sort_order: 2,
      },
      {
        // Unsplash : mains de technicien sur pièces moteur — entretien représentatif
        source: { url: UNSPLASH("1619642751034-765dfdf7c58e") },
        alt: "Technicien contrôlant les pièces moteur lors d'une révision complète",
        is_primary: false,
        sort_order: 3,
      },
    ],
  },

  // ── Réparation Mécanique & Électronique ────────────────────────────────
  {
    service_id: "00000000-0000-0000-0000-000000000302",
    slug: "mecanique",
    images: [
      {
        // Local : gros plan pièces moteur
        source: { local: "public/images/mecanique.webp" },
        alt: "Réparation mécanique complexe sur un véhicule en atelier",
        is_primary: true,
        sort_order: 1,
      },
      {
        // Local : diagnostic scanner OBD
        source: { local: "public/images/diagnostic.webp" },
        alt: "Diagnostic électronique par valise OBD au garage Mendonça",
        is_primary: false,
        sort_order: 2,
      },
      {
        // Unsplash : électronique moteur
        source: { url: UNSPLASH("1558618666-fcd25c85cd64") },
        alt: "Expertise électronique et réparation moteur haute technologie",
        is_primary: false,
        sort_order: 3,
      },
    ],
  },

  // ── Carrosserie, Vitrage & Services ────────────────────────────────────
  {
    service_id: "00000000-0000-0000-0000-000000000303",
    slug: "carrosserie",
    images: [
      {
        // Local : carrosserie travaux
        source: { local: "public/images/carrosserie.webp" },
        alt: "Réparation carrosserie et peinture automobile au garage Mendonça",
        is_primary: true,
        sort_order: 1,
      },
      {
        // Local : vue atelier
        source: { local: "public/images/garage-hero.webp" },
        alt: "Atelier garage Mendonça — équipement professionnel carrosserie",
        is_primary: false,
        sort_order: 2,
      },
      {
        // Unsplash : atelier carrosserie peinture
        source: { url: UNSPLASH("1565043589221-1a6fd9ae45c7") },
        alt: "Cabine de peinture professionnelle pour véhicules",
        is_primary: false,
        sort_order: 3,
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchImageBuffer(source, maxWidth = 1600) {
  let raw;

  if (source.local) {
    const absPath = resolve(ROOT, source.local);
    if (!existsSync(absPath)) throw new Error(`Local file not found: ${absPath}`);
    raw = readFileSync(absPath);
  } else if (source.url) {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "garage-mendonca-migration/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${source.url}`);
    raw = Buffer.from(await res.arrayBuffer());
  } else {
    throw new Error("Source must have .local or .url");
  }

  return sharp(raw)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function uploadToStorage(buffer, storagePath) {
  const { error } = await supabase.storage
    .from("service-images")
    .upload(storagePath, buffer, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

async function insertRow({ service_id, storage_path, alt, sort_order, is_primary }) {
  const { data: urlData } = supabase.storage
    .from("service-images")
    .getPublicUrl(storage_path);

  const { error } = await supabase.from("service_images").insert({
    service_id,
    garage_id: GARAGE_ID,
    url: urlData.publicUrl,
    storage_path,
    alt,
    sort_order,
    is_primary,
  });
  if (error) throw new Error(`DB insert failed: ${error.message}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log("🚀 Phase 10 — Service image migration\n");

  // Idempotent: clear all existing rows for these services
  const serviceIds = MANIFEST.map((s) => s.service_id);
  const { error: delErr } = await supabase
    .from("service_images")
    .delete()
    .in("service_id", serviceIds);
  if (delErr) {
    console.warn("⚠️  Could not clear existing rows:", delErr.message);
  } else {
    console.log("🗑  Cleared existing service_images rows\n");
  }

  let ok = 0;
  let fail = 0;

  for (const service of MANIFEST) {
    console.log(`📂 ${service.slug} (${service.service_id})`);

    for (const img of service.images) {
      const sourceLabel = img.source.local ?? img.source.url.slice(0, 60) + "…";
      const storagePath = `services/${service.slug}/${randomUUID()}.webp`;

      try {
        const buf = await fetchImageBuffer(img.source);
        const kb = (buf.length / 1024).toFixed(0);
        const tag = img.source.local ? "local" : "unsplash";
        console.log(`  [${tag}] ${kb} KB  ← ${sourceLabel}`);

        await uploadToStorage(buf, storagePath);
        await insertRow({
          service_id: service.service_id,
          storage_path: storagePath,
          alt: img.alt,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        });
        console.log(`  ✓ uploaded + inserted  sort=${img.sort_order} primary=${img.is_primary}`);
        ok++;
      } catch (err) {
        console.error(`  ✗ FAILED: ${err.message}`);
        fail++;
      }
    }
    console.log();
  }

  console.log("─".repeat(60));
  console.log(`✅ Done — ${ok} migrated, ${fail} failed\n`);

  if (ok > 0) {
    const { data: rows } = await supabase
      .from("service_images")
      .select("service_id, storage_path, sort_order, is_primary")
      .in("service_id", serviceIds)
      .order("service_id, sort_order");

    console.log("📋 Rows in DB:");
    console.table(rows?.map((r) => ({
      service: MANIFEST.find((s) => s.service_id === r.service_id)?.slug ?? r.service_id,
      sort_order: r.sort_order,
      primary: r.is_primary,
      path: r.storage_path.replace("services/", "").slice(0, 55),
    })));
  }
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
