/**
 * Vehicle image URL resolution — single entry point.
 *
 * Rule: UI components NEVER import from @/lib/utils/storage directly.
 * Everything goes through resolveVehicleUrl().
 */

import type { Vehicle, VehicleImage } from "@/types";
import {
  extractStoragePath,
  normalizeSupabaseUrl,
  getStoragePublicUrl,
  isLegacyPath,
  type ImageVariant,
} from "./storage";

const VEHICLE_BUCKET = "vehicle-images";

// Matches any variant suffix in a storage path, e.g. "uuid-medium.webp"
const VARIANT_SUFFIX_RE = /-(thumb|medium|large|orig)\.webp$/i;

// ─── THE single helper ────────────────────────────────────────────

/**
 * Resolves any vehicle image source to a permanent, variant-aware public URL.
 *
 * Handles all input forms transparently — callers never need to know the format:
 *
 *   basePath    "garage/vehicles/id/uuid"             → …/uuid-{variant}.webp
 *   variant URL "…/uuid-medium.webp"                  → …/uuid-{variant}.webp
 *   legacy path "garage/vehicles/id/1234567890.webp"  → …/1234567890.webp (no variants)
 *   full URL    "https://xxx.supabase.co/…"           → extracts path, applies variant
 *   local path  "/images/placeholder.webp"            → returned as-is
 *   null/empty                                        → null
 *
 * For legacy images (no variants), the requested variant is ignored and the
 * original file is returned — callers do not need to handle this case.
 */
export function resolveVehicleUrl(
  source: string | null | undefined,
  variant: ImageVariant = "medium",
): string | null {
  if (!source) return null;

  // Local static file — return as-is
  if (source.startsWith("/") && !source.startsWith("//")) return source;

  // Full URL (Supabase or external)
  if (source.startsWith("http")) {
    if (!source.includes(".supabase.co/storage/")) return source; // external — keep as-is
    // Extract storage path from signed or public Supabase URL, then recurse
    const storagePath = extractStoragePath(source);
    return storagePath ? resolveVehicleUrl(storagePath, variant) : source;
  }

  // Plain storage_path (no protocol)

  // New variant file (e.g. "uuid-medium.webp") → strip suffix, apply requested variant
  if (VARIANT_SUFFIX_RE.test(source)) {
    const basePath = source.replace(VARIANT_SUFFIX_RE, "");
    return getStoragePublicUrl(VEHICLE_BUCKET, `${basePath}-${variant}.webp`);
  }

  // New base path (no extension) → append requested variant suffix
  if (!isLegacyPath(source)) {
    return getStoragePublicUrl(VEHICLE_BUCKET, `${source}-${variant}.webp`);
  }

  // Legacy single file (ends with image extension, no variant suffix) →
  // no variants available, return direct URL regardless of requested variant
  return getStoragePublicUrl(VEHICLE_BUCKET, source);
}

// ─── Collection helper ────────────────────────────────────────────

/**
 * Returns an ordered array of resolved vehicle image URLs for a given variant.
 *
 * Priority:
 *   1. vehicleImages (explicit param or vehicle.vehicleImages) — storage_path preferred
 *   2. vehicle.images[] — pre-computed medium URLs (can derive other variants)
 *
 * All outputs are permanent public CDN URLs — no signed URLs, no expiry.
 */
export function getVehicleImages(
  vehicle: Pick<Vehicle, "images" | "vehicleImages">,
  vehicleImages?: VehicleImage[],
  variant: ImageVariant = "medium",
): string[] {
  const joined = vehicleImages ?? vehicle.vehicleImages;

  if (joined && joined.length > 0) {
    return joined
      .map((img) => resolveVehicleUrl(img.storage_path ?? img.url, variant))
      .filter((url): url is string => Boolean(url));
  }

  // Fallback to pre-computed images[] (already medium URLs in domain layer)
  return (vehicle.images ?? [])
    .map((url) => resolveVehicleUrl(url, variant))
    .filter((url): url is string => Boolean(url));
}

// ─── Backward-compat alias (used in non-vehicle contexts) ────────

/**
 * @deprecated Use resolveVehicleUrl() instead.
 * Kept for legacy call sites that pass a raw Supabase URL or storage path.
 */
export function resolveVehicleImageUrl(urlOrPath: string): string {
  return resolveVehicleUrl(urlOrPath, "medium") ?? urlOrPath;
}

/**
 * @deprecated Use resolveVehicleUrl() instead.
 */
export function getVehiclePublicUrl(
  storagePath: string,
  variant: ImageVariant = "medium",
): string {
  return resolveVehicleUrl(storagePath, variant) ?? storagePath;
}

// ─── Re-export for callers importing from this module ─────────────
export { normalizeSupabaseUrl };
