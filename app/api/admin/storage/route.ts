import { NextRequest, NextResponse } from "next/server";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getActiveGarageId } from "@/lib/config/garage";
import { isLegacyPath } from "@/lib/utils/storage";

const GARAGE_ID = getActiveGarageId();

/**
 * GET /api/admin/storage
 *
 * Returns a storage audit for the active garage:
 *
 * - orphan_images:   vehicle_images rows whose vehicle no longer exists in DB.
 *   These files can be safely deleted.
 *
 * - null_paths:      vehicle_images rows with storage_path = NULL.
 *   These images have no storage reference — display will fail.
 *
 * - variant_paths:   vehicle_images rows where storage_path still contains a
 *   variant suffix (should be basePath after migration 027).
 *
 * - legacy_images:   vehicle_images rows using legacy single-file format.
 *   Informational — not broken, just pre-Phase-1.
 *
 * - stats:           summary counts.
 *
 * Read-only. Requires admin auth for the active garage.
 */
export async function GET() {
  const authResult = await requireAdminForGarage(GARAGE_ID).catch(() => null);
  if (!authResult) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const db = createSupabaseAdminClient();

  // ── 1. Orphan images (vehicle_images rows without a matching vehicle) ────
  // Find rows pointing to deleted vehicles — two queries since Supabase client
  // doesn't support LEFT JOIN directly.
  const { data: allVehicleIds, error: vidErr } = await db
    .from("vehicles")
    .select("id")
    .eq("garage_id", GARAGE_ID);

  const { data: allImageRows, error: imgErr } = await db
    .from("vehicle_images")
    .select("id, vehicle_id, storage_path, url, created_at")
    .eq("garage_id", GARAGE_ID);

  if (vidErr || imgErr) {
    console.error("[storage-audit] query error:", vidErr ?? imgErr);
    return NextResponse.json({ error: "Erreur requête DB" }, { status: 500 });
  }

  const validVehicleIds = new Set((allVehicleIds ?? []).map((v) => v.id));
  const images = allImageRows ?? [];

  const orphanImages = images.filter(
    (img) => img.vehicle_id && !validVehicleIds.has(img.vehicle_id),
  );

  // ── 2. Images with no storage_path (can't be displayed or deleted) ────────
  const nullPaths = images.filter((img) => !img.storage_path);

  // ── 3. Images with variant suffix in storage_path (pre-027) ──────────────
  const VARIANT_SUFFIX_RE = /-(thumb|medium|large|orig)\.(webp|jpg|jpeg|png)$/i;
  const variantPaths = images.filter(
    (img) => img.storage_path && VARIANT_SUFFIX_RE.test(img.storage_path),
  );

  // ── 4. Legacy images (single file, pre-Phase-1) ───────────────────────────
  const legacyImages = images.filter(
    (img) =>
      img.storage_path &&
      isLegacyPath(img.storage_path) &&
      !VARIANT_SUFFIX_RE.test(img.storage_path),
  );

  // ── 5. Healthy new-format images ──────────────────────────────────────────
  const healthyBasePaths = images.filter(
    (img) =>
      img.storage_path &&
      !isLegacyPath(img.storage_path) &&
      !VARIANT_SUFFIX_RE.test(img.storage_path),
  );

  const stats = {
    total_images:    images.length,
    healthy_new:     healthyBasePaths.length,
    legacy_format:   legacyImages.length,
    orphan_images:   orphanImages.length,
    null_storage:    nullPaths.length,
    variant_suffix:  variantPaths.length,
  };

  console.log("[storage-audit]", JSON.stringify({ garage_id: GARAGE_ID, ...stats }));

  // ── Cleanup candidates — ready-to-use payload for batch deletion ──────────
  // Orphan images have no matching vehicle and can be deleted without data loss.
  // Each entry includes all 3 variant paths (new format) or the single path (legacy).
  const cleanupCandidates = orphanImages
    .filter((img) => img.storage_path)
    .map((img) => {
      const sp = img.storage_path!;
      if (isLegacyPath(sp) && !VARIANT_SUFFIX_RE.test(sp)) {
        // Legacy single file
        return { image_id: img.id, vehicle_id: img.vehicle_id, paths: [sp], format: "legacy" as const };
      }
      // New format: basePath → 3 variants to delete
      const base = sp.replace(VARIANT_SUFFIX_RE, ""); // normalize just in case
      return {
        image_id:   img.id,
        vehicle_id: img.vehicle_id,
        paths: [`${base}-thumb.webp`, `${base}-medium.webp`, `${base}-large.webp`],
        format: "multi-variant" as const,
      };
    });

  return NextResponse.json({
    stats,
    // Actionable cleanup list — feed to a batch deletion script
    cleanup_candidates: cleanupCandidates,
    // Detail views for manual investigation
    orphan_images: orphanImages.map((img) => ({
      id:           img.id,
      vehicle_id:   img.vehicle_id,
      storage_path: img.storage_path,
      created_at:   img.created_at,
    })),
    null_paths: nullPaths.map((img) => ({
      id:         img.id,
      vehicle_id: img.vehicle_id,
      url:        img.url,
    })),
    variant_paths: variantPaths.map((img) => ({
      id:           img.id,
      vehicle_id:   img.vehicle_id,
      storage_path: img.storage_path,
    })),
    legacy_count: legacyImages.length,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/storage
//
// Batch delete orphan images from Supabase Storage.
//
// Body (JSON):
//   {
//     image_ids: string[],   // from cleanup_candidates[].image_id
//     dry_run: boolean       // true = simulation only, false = real deletion
//   }
//
// Behaviour:
//   1. Validates auth (admin required)
//   2. Verifies each image_id is actually orphaned (no matching vehicle in DB)
//      — guards against concurrent restore or data error
//   3. Checks storage existence for each path before attempting deletion
//   4. In dry_run mode: returns what WOULD be deleted without side effects
//   5. In real mode: deletes each path, logs each operation, returns summary
//
// This endpoint is intentionally verbose — every deletion is logged.
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminForGarage(GARAGE_ID).catch(() => null);
  if (!authResult) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { image_ids?: string[]; dry_run?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { image_ids, dry_run = true } = body;
  if (!Array.isArray(image_ids) || image_ids.length === 0) {
    return NextResponse.json({ error: "image_ids requis (tableau non vide)" }, { status: 400 });
  }

  const db  = createSupabaseAdminClient();
  const BUCKET = "vehicle-images";
  const VARIANT_SUFFIX_RE = /-(thumb|medium|large|orig)\.(webp|jpg|jpeg|png)$/i;

  console.log("[storage-delete] start", { dry_run, count: image_ids.length });

  // ── 1. Fetch the image rows ───────────────────────────────────────────────
  const { data: rows, error: fetchErr } = await db
    .from("vehicle_images")
    .select("id, vehicle_id, storage_path")
    .in("id", image_ids)
    .eq("garage_id", GARAGE_ID);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  // ── 2. Safety check: only delete rows that are truly orphaned ────────────
  const { data: vehicleIds } = await db
    .from("vehicles")
    .select("id")
    .eq("garage_id", GARAGE_ID);

  const validVehicleIds = new Set((vehicleIds ?? []).map((v) => v.id));

  const results: Array<{
    image_id: string;
    storage_path: string | null;
    paths: string[];
    storage_exists: boolean[];
    action: "deleted" | "skipped_not_orphan" | "skipped_no_path" | "dry_run" | "error";
    error?: string;
  }> = [];

  for (const row of rows ?? []) {
    // Reject if the vehicle now exists (concurrent restore)
    if (row.vehicle_id && validVehicleIds.has(row.vehicle_id)) {
      console.warn("[storage-delete] skip: vehicle exists", { image_id: row.id, vehicle_id: row.vehicle_id });
      results.push({ image_id: row.id, storage_path: row.storage_path, paths: [], storage_exists: [], action: "skipped_not_orphan" });
      continue;
    }

    if (!row.storage_path) {
      results.push({ image_id: row.id, storage_path: null, paths: [], storage_exists: [], action: "skipped_no_path" });
      continue;
    }

    // Build variant paths
    const sp = row.storage_path;
    const base = sp.replace(VARIANT_SUFFIX_RE, "");
    const paths = isLegacyPath(sp) && !VARIANT_SUFFIX_RE.test(sp)
      ? [sp]
      : [`${base}-thumb.webp`, `${base}-medium.webp`, `${base}-large.webp`];

    // ── 3. Check storage existence for each path ──────────────────────────
    const existenceChecks = await Promise.all(
      paths.map(async (p) => {
        const { error } = await db.storage.from(BUCKET).download(p);
        return !error; // true = exists
      }),
    );

    console.log("[storage-delete] existence check", { image_id: row.id, paths, exists: existenceChecks, dry_run });

    if (dry_run) {
      results.push({ image_id: row.id, storage_path: sp, paths, storage_exists: existenceChecks, action: "dry_run" });
      continue;
    }

    // ── 4. Real deletion (only paths that exist) ──────────────────────────
    const pathsToDelete = paths.filter((_, i) => existenceChecks[i]);
    if (pathsToDelete.length > 0) {
      const { error: delErr } = await db.storage.from(BUCKET).remove(pathsToDelete);
      if (delErr) {
        console.error("[storage-delete] storage error", { image_id: row.id, error: delErr.message });
        results.push({ image_id: row.id, storage_path: sp, paths, storage_exists: existenceChecks, action: "error", error: delErr.message });
        continue;
      }
    }

    // Remove DB row
    await db.from("vehicle_images").delete().eq("id", row.id);
    console.log("[storage-delete] deleted", { image_id: row.id, paths_deleted: pathsToDelete });
    results.push({ image_id: row.id, storage_path: sp, paths, storage_exists: existenceChecks, action: "deleted" });
  }

  const summary = {
    dry_run,
    total:               results.length,
    deleted:             results.filter((r) => r.action === "deleted").length,
    dry_run_candidates:  results.filter((r) => r.action === "dry_run").length,
    skipped_not_orphan:  results.filter((r) => r.action === "skipped_not_orphan").length,
    skipped_no_path:     results.filter((r) => r.action === "skipped_no_path").length,
    errors:              results.filter((r) => r.action === "error").length,
  };

  console.log("[storage-delete] complete", summary);

  return NextResponse.json({ summary, results });
}
