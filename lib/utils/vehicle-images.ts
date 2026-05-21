import type { Vehicle, VehicleImage } from "@/types";
import { extractStoragePath, normalizeSupabaseUrl } from "./storage";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = "vehicle-images";

/**
 * Builds a permanent public URL from a storage_path in the vehicle-images bucket.
 * Requires the bucket to be public in Supabase.
 */
export function getVehiclePublicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Normalises any vehicle image URL/path to a permanent public URL.
 *
 * Input forms handled:
 *   1. Plain storage_path (no protocol) → public URL in vehicle-images bucket
 *   2. Signed Supabase URL              → permanent public URL (via normalizeSupabaseUrl)
 *   3. Public Supabase URL              → idempotent (returned as-is)
 *   4. Local static path ("/images/…")  → returned as-is
 *   5. External URL (non-Supabase)      → returned as-is
 *   6. empty / null-ish                 → returned as-is
 */
export function resolveVehicleImageUrl(urlOrPath: string): string {
  if (!urlOrPath) return urlOrPath;
  // Local path — already correct
  if (urlOrPath.startsWith("/") && !urlOrPath.startsWith("//")) return urlOrPath;
  // Non-Supabase external URL — keep as-is
  if (urlOrPath.startsWith("http") && !urlOrPath.includes(".supabase.co")) return urlOrPath;
  // Full Supabase URL (public or signed) — normalise via general helper
  if (urlOrPath.startsWith("http")) return normalizeSupabaseUrl(urlOrPath) ?? urlOrPath;
  // Plain storage_path (no protocol) — build public URL directly
  return getVehiclePublicUrl(urlOrPath);
}

/**
 * Returns resolved image URLs for a vehicle, always as permanent public URLs.
 * Priority: vehicle_images join → legacy images[] JSONB.
 * All URLs are normalised — no signed URLs will ever reach the caller.
 */
export function getVehicleImages(
  vehicle: Pick<Vehicle, "images" | "vehicleImages">,
  vehicleImages?: VehicleImage[],
): string[] {
  const joined = vehicleImages ?? vehicle.vehicleImages;
  if (joined && joined.length > 0) {
    return joined
      .map((img) =>
        img.storage_path
          ? getVehiclePublicUrl(img.storage_path)
          : resolveVehicleImageUrl(img.url),
      )
      .filter(Boolean);
  }
  // Legacy JSONB fallback — may contain expired signed URLs
  return (vehicle.images ?? []).map(resolveVehicleImageUrl).filter(Boolean);
}
