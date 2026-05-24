import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getUser } from "@/lib/auth/getSession";
import { getOriginalPath } from "@/lib/utils/storage";

const VEHICLE_BUCKET = "vehicle-images";

/**
 * POST /api/images/upload-url
 *
 * Generates a Supabase Storage signed upload URL for direct client → storage upload.
 * This bypasses Vercel's 4.5 MB body limit — the file never transits through Vercel.
 *
 * Body (JSON): { garageId, vehicleId }
 * Response:    { signedUrl, token, basePath, originalPath }
 */
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { garageId?: string; vehicleId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { garageId, vehicleId } = body;
  if (!garageId || !vehicleId) {
    return NextResponse.json(
      { error: "Champs requis : garageId, vehicleId" },
      { status: 400 },
    );
  }

  // Build a unique base path (no extension) — this becomes the image's permanent identifier
  const uuid = crypto.randomUUID();
  const basePath = `${garageId}/vehicles/${vehicleId}/${uuid}`;
  const originalPath = getOriginalPath(basePath);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(VEHICLE_BUCKET)
    .createSignedUploadUrl(originalPath, { upsert: false });

  if (error || !data) {
    console.error("[upload-url] signed URL error", { garageId, vehicleId, error: error?.message });
    return NextResponse.json(
      { error: error?.message ?? "Impossible de générer l'URL signée" },
      { status: 500 },
    );
  }

  console.log("[upload-url] ok", { garageId, vehicleId, basePath });

  return NextResponse.json({
    signedUrl:    data.signedUrl,
    token:        data.token,
    basePath,
    originalPath,
  });
}
