import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getUser } from "@/lib/auth/getSession";
import {
  getVariantPaths,
  getOriginalPath,
  getStoragePublicUrl,
  type ImageVariant,
} from "@/lib/utils/storage";

const VEHICLE_BUCKET = "vehicle-images";

const VARIANTS: { key: ImageVariant; width: number; height: number; quality: number }[] = [
  { key: "thumb",  width: 480,  height: 360,  quality: 75 },
  { key: "medium", width: 900,  height: 675,  quality: 82 },
  { key: "large",  width: 1600, height: 1200, quality: 85 },
];

// ─── Simple retry helper ──────────────────────────────────────────
// 3 attempts, exponential backoff 300ms / 600ms.
// Used only for transient Supabase upload errors.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (err) {
      if (i === attempts - 1) throw err;
      await sleep(300 * 2 ** i);
    }
  }
  throw new Error("unreachable");
}

/**
 * POST /api/images/process
 *
 * Fetches the original image from Supabase Storage, generates 3 WebP variants
 * (thumb/medium/large) using Sharp with smart-crop, then uploads them.
 *
 * Design principles:
 * - Tolerant: each variant is uploaded independently with retry (3×).
 *   A partial failure returns an error — the client retries the whole call.
 *   Already-uploaded variants are overwritten cleanly (upsert: true) on retry.
 *   No rollback needed — partial state is safe and idempotent.
 * - Non-blocking cleanup: original deletion is fire-and-forget.
 *   A dangling -orig file is cosmetic, not a user-facing error.
 *
 * Body (JSON): { basePath }
 * Response:    { url, storagePath, variants: { thumb, medium, large } }
 */
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { basePath?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { basePath } = body;
  if (!basePath) {
    return NextResponse.json({ error: "Champ requis : basePath" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const originalPath = getOriginalPath(basePath);
  const variantPaths = getVariantPaths(basePath);

  // ── 1. Download the original ──────────────────────────────────────
  const { data: origData, error: downloadError } = await supabase.storage
    .from(VEHICLE_BUCKET)
    .download(originalPath);

  if (downloadError || !origData) {
    console.error("[process] download error:", downloadError);
    return NextResponse.json(
      { error: downloadError?.message ?? "Original introuvable — veuillez re-uploader" },
      { status: 404 },
    );
  }

  let inputBuffer: Buffer;
  try {
    inputBuffer = Buffer.from(await origData.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Lecture de l'original échouée" }, { status: 500 });
  }

  // ── 2. Generate & upload each variant ────────────────────────────
  const baseSharp = sharp(inputBuffer).rotate(); // auto-rotate EXIF once

  for (const variant of VARIANTS) {
    let variantBuffer: Buffer;
    try {
      variantBuffer = await baseSharp
        .clone()
        .resize(variant.width, variant.height, {
          fit: "cover",
          position: "attention", // smart-crop: focus on salient region
          withoutEnlargement: true,
        })
        .webp({ quality: variant.quality, effort: 4 })
        .toBuffer();
    } catch (err) {
      console.error(`[process] sharp error for ${variant.key}:`, err);
      return NextResponse.json({ error: `Traitement ${variant.key} échoué` }, { status: 422 });
    }

    try {
      await withRetry(() =>
        supabase.storage
          .from(VEHICLE_BUCKET)
          .upload(variantPaths[variant.key], variantBuffer, {
            contentType: "image/webp",
            upsert: true, // safe to re-run — idempotent
            cacheControl: "public, max-age=31536000, immutable",
          })
          .then(({ error }) => { if (error) throw error; }),
      );
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`[process] upload failed for ${variant.key}:`, msg);
      // Return error — client retries. Already-uploaded variants are safe (upsert).
      return NextResponse.json(
        { error: `Upload ${variant.key} échoué : ${msg}` },
        { status: 500 },
      );
    }
  }

  // ── 3. Fire-and-forget: delete the temporary original ────────────
  // Dangling -orig file = wasted space only, not a broken image.
  void supabase.storage.from(VEHICLE_BUCKET).remove([originalPath]);

  // ── 4. Return medium URL as canonical identifier ──────────────────
  const mediumUrl = getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.medium);

  return NextResponse.json({
    url:         mediumUrl,
    storagePath: basePath,
    variants: {
      thumb:  getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.thumb),
      medium: mediumUrl,
      large:  getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.large),
    },
  });
}
