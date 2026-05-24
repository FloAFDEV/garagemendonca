import type { Vehicle, VehicleImage } from "@/types";
import {
  normalizeSupabaseUrl,
  getVehicleImageUrl,
  isLegacyPath,
  type ImageVariant,
} from "./storage";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = "vehicle-images";

/**
 * Builds a variant-aware public URL from a storage_path in the vehicle-images bucket.
 *
 * - Legacy path (ends with .webp/.jpg/…) → direct URL, variant ignored
 * - New basePath (no extension)          → appends -<variant>.webp suffix
 *
 * Defaults to "medium" (900×675) — the variant stored as the canonical URL in DB.
 */
export function getVehiclePublicUrl(
  storagePath: string,
  variant: ImageVariant = "medium",
): string {
  const resolved = getVehicleImageUrl(storagePath, variant);
  // Fallback: direct construction for fully legacy paths or edge cases
  return resolved ?? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Derives a large-variant URL from a medium URL (for lightbox display).
 * - New format (ends with -medium.webp) → replaces with -large.webp
 * - Legacy format                       → returns the same URL (no large variant)
 */
export function toLargeUrl(mediumUrl: string): string {
  if (mediumUrl.includes("-medium.webp")) {
    return mediumUrl.replace("-medium.webp", "-large.webp");
  }
  return mediumUrl;
}

/**
 * Normalises any vehicle image URL/path to a permanent public URL.
 *
 * Input forms handled:
 *   1. Plain storage_path (no protocol) → variant-aware public URL in vehicle-images bucket
 *   2. Signed Supabase URL              → permanent public URL (via normalizeSupabaseUrl)
 *   3. Public Supabase URL              → idempotent (returned as-is)
 *   4. Local static path ("/images/…")  → returned as-is
 *   5. External URL (non-Supabase)      → returned as-is
 *   6. empty / null-ish                 → returned as-is
 */
export function resolveVehicleImageUrl(urlOrPath: string, variant: ImageVariant = "medium"): string {
  if (!urlOrPath) return urlOrPath;
  // Local path — already correct
  if (urlOrPath.startsWith("/") && !urlOrPath.startsWith("//")) return urlOrPath;
  // Non-Supabase external URL — keep as-is
  if (urlOrPath.startsWith("http") && !urlOrPath.includes(".supabase.co")) return urlOrPath;
  // Full Supabase URL (public or signed) — normalise via general helper
  if (urlOrPath.startsWith("http")) return normalizeSupabaseUrl(urlOrPath) ?? urlOrPath;
  // Plain storage_path (no protocol) — build variant-aware public URL
  return getVehiclePublicUrl(urlOrPath, variant);
}

/**
 * Returns resolved image URLs for a vehicle, always as permanent public URLs.
 * Priority: vehicle_images join → pre-computed images[] → legacy JSONB.
 *
 * @param vehicle     - Vehicle domain object (images[] are already resolved medium URLs)
 * @param vehicleImages - Optional explicit VehicleImage[] (overrides vehicle.vehicleImages)
 * @param variant     - Image variant to resolve when building from storage_path
 *                      Defaults to "medium" for gallery/main display.
 *                      Pass "thumb" for card thumbnails, "large" for lightbox.
 */
export function getVehicleImages(
  vehicle: Pick<Vehicle, "images" | "vehicleImages">,
  vehicleImages?: VehicleImage[],
  variant: ImageVariant = "medium",
): string[] {
  const joined = vehicleImages ?? vehicle.vehicleImages;
  if (joined && joined.length > 0) {
    return joined
      .map((img) => {
        if (img.storage_path) {
          return getVehiclePublicUrl(img.storage_path, variant);
        }
        return resolveVehicleImageUrl(img.url, variant);
      })
      .filter(Boolean);
  }
  // Pre-computed images[] in Vehicle domain — already medium URLs.
  // For thumb/large we need to derive from the medium URL.
  if (variant === "medium") {
    return (vehicle.images ?? []).map((u) => resolveVehicleImageUrl(u, "medium")).filter(Boolean);
  }
  return (vehicle.images ?? [])
    .map((url) => {
      if (!url) return "";
      if (variant === "large") return toLargeUrl(url);
      // thumb: replace -medium.webp with -thumb.webp
      if (url.includes("-medium.webp")) return url.replace("-medium.webp", "-thumb.webp");
      return url; // legacy — no thumb variant, use as-is
    })
    .filter(Boolean);
}

// ── Re-export for callers that used extractStoragePath from here ──
export { isLegacyPath };
