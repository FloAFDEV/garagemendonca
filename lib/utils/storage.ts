/**
 * Extracts the storage_path from a Supabase Storage URL.
 * Supports /object/public/ and /object/sign/ for any bucket.
 * Returns the input unchanged if it's already a plain path (no http prefix).
 */
export function extractStoragePath(urlOrPath: string): string | undefined {
  if (!urlOrPath.startsWith("http")) return urlOrPath;
  const m = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/([^?]+)/);
  return m?.[1];
}
