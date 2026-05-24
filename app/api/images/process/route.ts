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

// ─── Retry helper ─────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 300,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await sleep(baseDelayMs * 2 ** i); // 300ms, 600ms
    }
  }
  throw lastErr;
}

/**
 * POST /api/images/process
 *
 * Fetches the original image from Supabase Storage, generates 3 WebP variants
 * (thumb/medium/large) using Sharp with smart-crop, then uploads them atomically.
 *
 * Properties:
 * - **Idempotent**: if medium variant already exists, skips re-processing and
 *   returns the existing URLs immediately (safe to retry from the client).
 * - **Atomic**: if any upload fails after up to 3 retries, all successfully
 *   uploaded variants are deleted before returning an error.
 * - **Original cleanup**: the temporary original is deleted only after all 3
 *   variants are confirmed uploaded. Non-blocking — a dangling orig file is
 *   harmless (just wasted storage, not a broken image).
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

  // ── 1. Idempotence check ──────────────────────────────────────────
  // If medium variant already exists, all 3 were already generated — return immediately.
  try {
    const { error: existCheck } = await supabase.storage
      .from(VEHICLE_BUCKET)
      .download(variantPaths.medium);

    if (!existCheck) {
      // Medium exists → processing already completed (possibly a duplicate call)
      const mediumUrl = getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.medium);
      return NextResponse.json({
        url:         mediumUrl,
        storagePath: basePath,
        variants: {
          thumb:  getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.thumb),
          medium: mediumUrl,
          large:  getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.large),
        },
        cached: true,
      });
    }
  } catch {
    // Download threw — medium doesn't exist, proceed with processing
  }

  // ── 2. Download the original ──────────────────────────────────────
  const { data: origData, error: downloadError } = await supabase.storage
    .from(VEHICLE_BUCKET)
    .download(originalPath);

  if (downloadError || !origData) {
    console.error("[process] download error:", downloadError);
    return NextResponse.json(
      { error: downloadError?.message ?? "Téléchargement de l'original échoué" },
      { status: 404 },
    );
  }

  let inputBuffer: Buffer;
  try {
    inputBuffer = Buffer.from(await origData.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Lecture du fichier original échouée" }, { status: 500 });
  }

  // ── 3. Generate variant buffers via Sharp ─────────────────────────
  // auto-rotate EXIF once, then clone per variant
  const baseSharp = sharp(inputBuffer).rotate();

  const uploadedPaths: string[] = [];

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
      // Rollback all uploaded variants
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(VEHICLE_BUCKET).remove(uploadedPaths).catch(() => null);
      }
      return NextResponse.json(
        { error: `Traitement variante ${variant.key} échoué` },
        { status: 422 },
      );
    }

    const storagePath = variantPaths[variant.key];

    // Retry upload up to 3 times with exponential backoff (300ms, 600ms)
    let uploadError: { message: string } | null = null;
    try {
      await withRetry(async () => {
        const { error } = await supabase.storage
          .from(VEHICLE_BUCKET)
          .upload(storagePath, variantBuffer, {
            contentType: "image/webp",
            upsert: true,
            cacheControl: "public, max-age=31536000, immutable",
          });
        if (error) throw error;
      });
    } catch (err) {
      uploadError = err as { message: string };
    }

    if (uploadError) {
      console.error(`[process] upload failed for ${variant.key} after retries:`, uploadError);
      // Rollback all variants uploaded so far
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(VEHICLE_BUCKET).remove(uploadedPaths).catch(() => null);
      }
      return NextResponse.json(
        { error: `Upload variante ${variant.key} échoué : ${uploadError.message}` },
        { status: 500 },
      );
    }

    uploadedPaths.push(storagePath);
  }

  // ── 4. All 3 variants confirmed → delete temporary original ───────
  // Non-blocking: dangling orig file = wasted storage, not a user-facing error.
  supabase.storage.from(VEHICLE_BUCKET).remove([originalPath]).catch((err) => {
    console.warn("[process] original deletion failed (non-blocking):", err);
  });

  // ── 5. Return medium URL as canonical URL ─────────────────────────
  const mediumUrl = getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.medium);

  return NextResponse.json({
    url:         mediumUrl,
    storagePath: basePath,          // base path = identifier stored in DB
    variants: {
      thumb:  getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.thumb),
      medium: mediumUrl,
      large:  getStoragePublicUrl(VEHICLE_BUCKET, variantPaths.large),
    },
  });
}
