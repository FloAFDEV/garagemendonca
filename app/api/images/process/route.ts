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

/**
 * POST /api/images/process
 *
 * Fetches the original image from Supabase Storage, generates 3 WebP variants
 * (thumb/medium/large) using Sharp with smart-crop, then uploads them atomically.
 * If any upload fails, all successfully uploaded variants are rolled back.
 * The temporary original file is deleted after processing.
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

  // ── 1. Download the original ─────────────────────────────────────
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

  // ── 2. Generate variant buffers via Sharp ─────────────────────────
  const baseSharp = sharp(inputBuffer).rotate(); // auto-rotate EXIF once

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
      // Rollback uploaded variants
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(VEHICLE_BUCKET).remove(uploadedPaths).catch(() => null);
      }
      return NextResponse.json(
        { error: `Traitement variante ${variant.key} échoué` },
        { status: 422 },
      );
    }

    const storagePath = variantPaths[variant.key];
    const { error: uploadError } = await supabase.storage
      .from(VEHICLE_BUCKET)
      .upload(storagePath, variantBuffer, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "public, max-age=31536000, immutable",
      });

    if (uploadError) {
      console.error(`[process] upload error for ${variant.key}:`, uploadError);
      // Rollback
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

  // ── 3. Delete the temporary original ─────────────────────────────
  await supabase.storage.from(VEHICLE_BUCKET).remove([originalPath]).catch((err) => {
    // Non-blocking — worst case is a dangling orig file
    console.warn("[process] original deletion failed:", err);
  });

  // ── 4. Return medium URL as canonical URL ─────────────────────────
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
