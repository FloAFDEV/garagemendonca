import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getUser } from "@/lib/auth/getSession";

// ─── Règles de traitement par type ───────────────────────────────

const UPLOAD_CONFIGS = {
  vehicle: { bucket: "vehicle-images", maxWidth: 1600, quality: 82 },
  service: { bucket: "service-images", maxWidth: 1400, quality: 84 },
  banner:  { bucket: "banner-images",  maxWidth: 1920, quality: 86 },
} as const;

type UploadType = keyof typeof UPLOAD_CONFIGS;

// ─── POST /api/upload-image ───────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file      = formData.get("file") as File | null;
  const type      = (formData.get("type") as string | null) as UploadType | null;
  const entityId  = formData.get("entityId") as string | null;
  const garageId  = formData.get("garageId") as string | null;

  if (!file || !type || !entityId || !garageId) {
    return NextResponse.json(
      { error: "Champs requis : file, type, entityId, garageId" },
      { status: 400 },
    );
  }

  if (!(type in UPLOAD_CONFIGS)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const config = UPLOAD_CONFIGS[type];

  // ── Lecture du fichier ─────────────────────────────────────────
  let inputBuffer: Buffer;
  try {
    inputBuffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Lecture fichier échouée" }, { status: 400 });
  }

  // ── Traitement Sharp ───────────────────────────────────────────
  let processed: { data: Buffer; info: sharp.OutputInfo };
  try {
    processed = await sharp(inputBuffer)
      .rotate()                                     // auto-rotate EXIF
      .resize(config.maxWidth, undefined, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: config.quality, effort: 4 }) // conversion WebP + suppression EXIF
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    console.error("[upload-image] sharp error:", err);
    return NextResponse.json({ error: "Traitement image échoué" }, { status: 422 });
  }

  // ── Upload Supabase Storage ────────────────────────────────────
  const filename    = `${Date.now()}.webp`;
  const storagePath = `${garageId}/${type}s/${entityId}/${filename}`;

  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage
    .from(config.bucket)
    .upload(storagePath, processed.data, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: "public, max-age=31536000, immutable",
    });

  if (uploadError) {
    console.error("[upload-image] storage error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from(config.bucket)
    .getPublicUrl(storagePath);

  return NextResponse.json({
    url:         publicUrl,
    storagePath,
    width:       processed.info.width,
    height:      processed.info.height,
    size:        processed.info.size,
  });
}
