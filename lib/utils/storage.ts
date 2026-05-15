/**
 * Extracts the storage_path from a Supabase Storage URL or plain path.
 * - Full Supabase URL → extracts the path segment after the bucket name
 * - Plain relative path (no leading "/") → returned as-is (already a storage path)
 * - Local public path (starts with "/") → returns undefined (not a storage path)
 * - Non-Supabase http URL → returns undefined
 */
export function extractStoragePath(urlOrPath: string): string | undefined {
  if (urlOrPath.startsWith("/")) return undefined;
  if (!urlOrPath.startsWith("http")) return urlOrPath;
  const m = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/([^?]+)/);
  return m?.[1];
}
