const SUPABASE_BASE = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const VEHICLE_BUCKET = "vehicle-images";

// ─── Variant types ────────────────────────────────────────────────

export type ImageVariant = "thumb" | "medium" | "large";

// ─── Legacy detection ─────────────────────────────────────────────

/**
 * Returns true if the storage_path points to a legacy single file
 * (path ends with an image extension like .webp, .jpg, .jpeg, .png).
 * New multi-variant paths have NO extension (they are base paths).
 */
export function isLegacyPath(storagePath: string): boolean {
  return /\.(webp|jpg|jpeg|png|gif)$/i.test(storagePath);
}

// ─── Variant paths ────────────────────────────────────────────────

/**
 * Given a base path (no extension), returns the three variant storage paths.
 * e.g. "abc/vehicles/uuid/img-id" →
 *   { thumb: "…-thumb.webp", medium: "…-medium.webp", large: "…-large.webp" }
 */
export function getVariantPaths(basePath: string): Record<ImageVariant, string> {
  return {
    thumb:  `${basePath}-thumb.webp`,
    medium: `${basePath}-medium.webp`,
    large:  `${basePath}-large.webp`,
  };
}

/** Storage path for the temporary original file during processing. */
export function getOriginalPath(basePath: string): string {
  return `${basePath}-orig`;
}

/**
 * Extracts the base path from a variant storage path or URL.
 * - `{base}-medium.webp` → `{base}`
 * - `{base}-thumb.webp`  → `{base}`
 * - `{base}-large.webp`  → `{base}`
 * - Already a base path  → returned as-is
 * - Full Supabase URL    → extracts storage path first, then strips suffix
 */
export function extractBasePath(urlOrPath: string): string {
  // Resolve full URL to storage path
  const storagePath = urlOrPath.startsWith("http")
    ? (extractStoragePath(urlOrPath) ?? urlOrPath)
    : urlOrPath;

  // Strip variant suffixes
  return storagePath.replace(/-(?:thumb|medium|large|orig)\.webp$/i, "");
}

// ─── Public URL helpers ───────────────────────────────────────────

/**
 * Returns the public CDN URL for a vehicle image.
 * - Legacy path (ends with extension) → direct public URL
 * - New base path + variant           → variant public URL
 * - Fallback: medium variant
 */
export function getVehicleImageUrl(
  storagePath: string | null | undefined,
  variant: ImageVariant = "medium",
): string | null {
  if (!storagePath) return null;

  const path = isLegacyPath(storagePath)
    ? storagePath
    : getVariantPaths(storagePath)[variant];

  return getStoragePublicUrl(VEHICLE_BUCKET, path);
}

/**
 * Extracts the storage_path from a Supabase Storage URL or plain path.
 * - Full Supabase URL (public or signed) → path segment after the bucket name
 * - Plain relative path (no leading "/") → returned as-is (already a storage path)
 * - Local public path (starts with "/") → returns undefined
 * - Non-Supabase http URL → returns undefined
 */
export function extractStoragePath(urlOrPath: string): string | undefined {
  if (urlOrPath.startsWith("/")) return undefined;
  if (!urlOrPath.startsWith("http")) return urlOrPath;
  const m = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/?]+\/([^?]+)/);
  return m?.[1];
}

export function getStoragePublicUrl(bucket: string, storagePath: string): string {
  return `${SUPABASE_BASE()}/storage/v1/object/public/${bucket}/${storagePath}`;
}

/**
 * Normalises any Supabase image URL to a permanent, non-expiring public URL.
 *
 * Handles all three input formats:
 *   - Signed URL  : …/object/sign/<bucket>/<path>?token=…  → permanent public URL
 *   - Public URL  : …/object/public/<bucket>/<path>         → idempotent (returned as-is structure)
 *   - External URL: any non-Supabase https URL              → returned unchanged
 *   - null/empty  : returns null
 *
 * The bucket name is preserved from the source URL so the function works
 * for any bucket (vehicle-images, service-images, …).
 *
 * NOTE: plain storage_path strings (no protocol) cannot be resolved without
 * knowing the bucket — use getStoragePublicUrl() directly in that case.
 */
export function normalizeSupabaseUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Local static file — leave untouched
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  // Non-HTTP (blob:, data:, …) — leave untouched
  if (!url.startsWith("http")) return null;
  // Non-Supabase external URL — leave untouched
  if (!url.includes(".supabase.co/storage/")) return url;
  // Extract bucket + path from public or signed URL
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/?]+)\/([^?]+)/);
  if (!m) return url;
  const [, bucket, path] = m;
  return `${SUPABASE_BASE()}/storage/v1/object/public/${bucket}/${path}`;
}
