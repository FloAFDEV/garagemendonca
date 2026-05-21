import type { Vehicle, VehicleImage } from "@/types";
import { extractStoragePath } from "./storage";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = "vehicle-images";

/**
 * Builds a permanent public URL from a storage_path.
 * Requires the bucket to be public in Supabase.
 */
export function getVehiclePublicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Normalises any Supabase image URL to a permanent public URL.
 * Handles: storage_path, public object URL, legacy signed URL.
 * If it cannot be resolved (external/local URL), returns the input as-is.
 */
export function resolveVehicleImageUrl(urlOrPath: string): string {
  if (!urlOrPath) return urlOrPath;
  // Already a relative local path (e.g. /images/placeholder.webp)
  if (urlOrPath.startsWith("/") && !urlOrPath.startsWith("//")) return urlOrPath;
  // Non-Supabase URL (external CDN, unsplash, …) — keep as-is
  if (urlOrPath.startsWith("http") && !urlOrPath.includes(".supabase.co")) return urlOrPath;
  // Relative storage path (no protocol) — direct build
  if (!urlOrPath.startsWith("http")) return getVehiclePublicUrl(urlOrPath);
  // Full Supabase URL: extract path and build fresh public URL
  const path = extractStoragePath(urlOrPath);
  return path ? getVehiclePublicUrl(path) : urlOrPath;
}

/**
 * Returns the resolved image URL list for a vehicle.
 * All URLs are normalised to permanent public URLs (no signed URLs).
 * Priority: vehicle_images join → legacy images JSONB.
 */
export function getVehicleImages(
  vehicle: Pick<Vehicle, "images" | "vehicleImages">,
  vehicleImages?: VehicleImage[],
): string[] {
  const joined = vehicleImages ?? vehicle.vehicleImages;
  if (joined && joined.length > 0) {
    return joined.map((img) =>
      img.storage_path
        ? getVehiclePublicUrl(img.storage_path)
        : resolveVehicleImageUrl(img.url),
    );
  }
  // Legacy JSONB fallback — might contain expired signed URLs
  return (vehicle.images ?? []).map(resolveVehicleImageUrl);
}
