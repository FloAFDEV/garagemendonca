import { NextResponse } from "next/server";
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
  const { data: orphans, error: orphanErr } = await db
    .from("vehicle_images")
    .select("id, vehicle_id, storage_path, url, created_at")
    .eq("garage_id", GARAGE_ID)
    .is("vehicle_id", null);

  // Also find rows pointing to deleted vehicles via LEFT JOIN approach
  // (Supabase client doesn't support LEFT JOIN — do a separate query)
  const { data: allVehicleIds, error: vidErr } = await db
    .from("vehicles")
    .select("id")
    .eq("garage_id", GARAGE_ID);

  const { data: allImageRows, error: imgErr } = await db
    .from("vehicle_images")
    .select("id, vehicle_id, storage_path, url, created_at")
    .eq("garage_id", GARAGE_ID);

  if (orphanErr || vidErr || imgErr) {
    console.error("[storage-audit] query error:", orphanErr ?? vidErr ?? imgErr);
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
