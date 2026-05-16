/**
 * backfill-options.ts
 *
 * Extrait les options de la description textuelle de chaque véhicule
 * et les stocke dans le champ JSONB `options`. Nettoie la description.
 *
 * Sécurité :
 *   - Sauvegarde dans `original_description` avant toute modification
 *   - Ne ré-écrase pas les véhicules dont original_description est déjà remplie
 *     (relance idempotente possible)
 *   - N'écrase pas les options déjà présentes (merge non-destructif)
 *   - DRY_RUN=true pour prévisualiser sans écrire
 *
 * Rollback :
 *   UPDATE vehicles SET description_marketing = NULL, options = '{}' WHERE original_description IS NOT NULL;
 *
 * Usage :
 *   npx tsx scripts/backfill-options.ts
 *   DRY_RUN=true npx tsx scripts/backfill-options.ts
 *   VEHICLE_ID=<uuid> npx tsx scripts/backfill-options.ts   (un seul véhicule)
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { parseDescriptionToOptions } from "@/lib/utils/parse-description-options";

// ── Chargement .env.local ─────────────────────────────────────────
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const GARAGE_ID        = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
const DRY_RUN          = process.env.DRY_RUN === "true";
const VEHICLE_ID       = process.env.VEHICLE_ID ?? null;
const BATCH_SIZE       = 20;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GARAGE_ID) {
  console.error("❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GARAGE_ID");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Regex : header de section "Équipements et options" ───────────
// Variantes :
//   ***** Équipements et options *****
//   --- Équipements ---
//   ÉQUIPEMENTS ET OPTIONS :
//   Équipements :
const SECTION_HEADER = /^[\s*\-=_#|]{0,10}\s*[Éé]quipements?\s*(?:et\s+[Oo]ptions?)?\s*[\s*\-=_#|:]{0,10}$/im;

// Ligne de liste : "- Option", "• Option", "* Option"
const LIST_PREFIX = /^[\s\-•*·]+/;

/**
 * Retire le header de section et les lignes vides consécutives qui le suivent.
 */
function stripSectionHeader(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (SECTION_HEADER.test(lines[i])) {
      // Sauter le header + lignes vides qui suivent
      i++;
      while (i < lines.length && !lines[i].trim()) i++;
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  // Supprimer trailing blank lines
  while (result.length > 0 && !result[result.length - 1].trim()) result.pop();
  return result.join("\n");
}

/**
 * Retire les préfixes de liste (tiret, bullet) des lignes courtes
 * afin que le parser de `parseDescriptionToOptions` puisse matcher correctement.
 */
function normalizeBullets(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      // Ligne courte avec préfixe liste → normaliser
      if (trimmed.length < 100 && LIST_PREFIX.test(trimmed)) {
        return trimmed.replace(LIST_PREFIX, "");
      }
      return line;
    })
    .join("\n");
}

/**
 * Pipeline complet pour un véhicule :
 * 1. Strip header section
 * 2. Normalise bullets
 * 3. parseDescriptionToOptions → options + texte restant
 * 4. Nettoyage final du texte (trailing blanks)
 */
function processDescription(rawDescription: string): {
  cleanedDescription: string;
  extractedOptions: Record<string, boolean>;
  matchCount: number;
} {
  const afterHeader  = stripSectionHeader(rawDescription);
  const normalized   = normalizeBullets(afterHeader);
  const { detectedOptions, remainingText, matchCount } = parseDescriptionToOptions(normalized);

  return {
    cleanedDescription: remainingText.trim(),
    extractedOptions:   detectedOptions as Record<string, boolean>,
    matchCount,
  };
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚗 Backfill options véhicules${DRY_RUN ? " [DRY RUN — aucune écriture]" : ""}`);
  console.log(`   Garage : ${GARAGE_ID}`);
  if (VEHICLE_ID) console.log(`   Cible   : ${VEHICLE_ID}`);
  console.log("");

  // ── Récupérer les véhicules ───────────────────────────────────
  let query = db
    .from("vehicles")
    .select("id, description, original_description, description_marketing, options")
    .eq("garage_id", GARAGE_ID)
    .not("description", "is", null);

  if (VEHICLE_ID) {
    query = query.eq("id", VEHICLE_ID);
  }

  const { data: vehicles, error } = await query;

  if (error) {
    console.error("❌ Erreur fetch véhicules :", error.message);
    process.exit(1);
  }

  if (!vehicles || vehicles.length === 0) {
    console.log("ℹ️  Aucun véhicule avec description trouvé.");
    return;
  }

  console.log(`📋 ${vehicles.length} véhicule(s) à traiter\n`);

  let skipped   = 0;
  let updated   = 0;
  let noOptions = 0;
  let errors    = 0;

  // ── Traitement par batch ──────────────────────────────────────
  for (let i = 0; i < vehicles.length; i += BATCH_SIZE) {
    const batch = vehicles.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (vehicle) => {
        const rawDesc = vehicle.description as string;

        if (!rawDesc.trim()) {
          skipped++;
          return;
        }

        const { cleanedDescription, extractedOptions, matchCount } = processDescription(rawDesc);

        if (matchCount === 0) {
          noOptions++;
          console.log(`  ⬜ ${vehicle.id.slice(0, 8)}… — 0 options détectées`);
          return;
        }

        // Merge non-destructif : ne pas écraser les options déjà cochées manuellement
        const existingOptions = (vehicle.options as Record<string, unknown>) ?? {};
        const mergedOptions: Record<string, unknown> = { ...extractedOptions };
        for (const [k, v] of Object.entries(existingOptions)) {
          if (v === true) mergedOptions[k] = true; // l'existant a priorité si true
        }

        console.log(`  ✅ ${vehicle.id.slice(0, 8)}… — ${matchCount} option(s) extraites`);

        if (DRY_RUN) {
          updated++;
          return;
        }

        const patch: Record<string, unknown> = {
          options:                 mergedOptions,
          description_marketing:  cleanedDescription,
          updated_at:             new Date().toISOString(),
        };

        // Sauvegarder original_description seulement si pas déjà fait
        if (!vehicle.original_description) {
          patch.original_description = rawDesc;
        }

        const { error: updateError } = await db
          .from("vehicles")
          .update(patch)
          .eq("id", vehicle.id);

        if (updateError) {
          console.error(`  ❌ ${vehicle.id.slice(0, 8)}… — ${updateError.message}`);
          errors++;
        } else {
          updated++;
        }
      }),
    );
  }

  // ── Résumé ────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  ✅ Mis à jour    : ${updated}`);
  console.log(`  ⬜ Sans options  : ${noOptions}`);
  console.log(`  ⏭  Ignorés       : ${skipped}`);
  if (errors > 0) console.log(`  ❌ Erreurs       : ${errors}`);
  console.log(`${"─".repeat(50)}`);

  if (DRY_RUN) {
    console.log("\n💡 Mode DRY RUN — aucune donnée modifiée.");
    console.log("   Relancer sans DRY_RUN=true pour appliquer.\n");
  } else {
    console.log("\n✅ Backfill terminé.\n");
    console.log("   Rollback possible avec :");
    console.log("   UPDATE vehicles SET description_marketing = NULL, options = '{}'\n   WHERE original_description IS NOT NULL;\n");
  }
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
