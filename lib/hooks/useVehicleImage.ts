"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";
import { extractStoragePath } from "@/lib/utils/storage";
import type { VehicleImage } from "@/types";

export { extractStoragePath };

const BUCKET = "vehicle-images";
const TTL    = 3600;
const MARGIN = 60; // resign 60s before expiry

// ─── Cache module-level ───────────────────────────────────────────
const cache = new Map<string, { url: string; expiresAt: number }>();

function getCached(path: string): string | undefined {
  const e = cache.get(path);
  if (!e) return undefined;
  if (Date.now() > e.expiresAt) { cache.delete(path); return undefined; }
  return e.url;
}

function setCached(path: string, url: string): void {
  cache.set(path, { url, expiresAt: Date.now() + (TTL - MARGIN) * 1000 });
}

// ─── Hook : 1 image ───────────────────────────────────────────────
export function useVehicleImage(
  storagePath: string | undefined,
  fallback?: string,
  bucket = BUCKET,
): { url: string | undefined; loading: boolean; error: boolean } {
  // When storage_path is missing, try to derive it from the fallback URL
  const effectivePath = storagePath ?? (fallback ? extractStoragePath(fallback) : undefined);
  const cacheKey = effectivePath ? `${bucket}:${effectivePath}` : undefined;

  const hit = cacheKey ? getCached(cacheKey) : undefined;
  // Only use fallback as initial state if we have a derivable storage path
  const [url, setUrl]         = useState<string | undefined>(effectivePath ? (hit ?? fallback) : undefined);
  const [loading, setLoading] = useState(!hit && !!effectivePath);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!effectivePath || !cacheKey) return;
    const cached = getCached(cacheKey);
    if (cached) { setUrl(cached); setLoading(false); return; }
    setLoading(true);
    createSupabaseBrowserClient()
      .storage.from(bucket)
      .createSignedUrl(effectivePath, TTL)
      .then(({ data, error: err }) => {
        if (err || !data?.signedUrl) { setUrl(undefined); setLoading(false); setError(true); return; }
        setCached(cacheKey, data.signedUrl);
        setUrl(data.signedUrl);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivePath, bucket]);

  return { url, loading, error };
}

// ─── Hook : N images (galerie) ────────────────────────────────────
export function useVehicleImages(
  vehicleImages: VehicleImage[] | undefined,
  fallbacks: string[],
): { urls: (string | undefined)[]; loading: boolean; error: boolean } {
  // Only storage_path is used — legacy url field is never read here
  function getPath(img: VehicleImage): string | undefined {
    return img.storage_path ?? undefined;
  }

  const initial: (string | undefined)[] = vehicleImages?.map((img) => {
    const path = getPath(img);
    return path ? getCached(`${BUCKET}:${path}`) : undefined;
  }) ?? [];

  const [urls, setUrls]       = useState<(string | undefined)[]>(initial);
  const [loading, setLoading] = useState(
    !!vehicleImages?.some((img) => { const p = getPath(img); return p && !getCached(p); }),
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!vehicleImages?.length) return;
    if (!vehicleImages.some((img) => getPath(img))) return;
    const sb = createSupabaseBrowserClient();
    setLoading(true);
    Promise.all(
      vehicleImages.map(async (img, i) => {
        const path = getPath(img);
        if (!path) return undefined;
        const hit = getCached(path);
        if (hit) return hit;
        const { data, error: err } = await sb.storage.from(BUCKET).createSignedUrl(path, TTL);
        if (err || !data?.signedUrl) return undefined;
        setCached(path, data.signedUrl);
        return data.signedUrl;
      }),
    )
      .then((resolved) => { setUrls(resolved); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  // vehicleImages est stable pour une même fiche véhicule
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleImages]);

  return { urls, loading, error };
}

// ─── Public API ───────────────────────────────────────────────────
// Aliases without the bucket escape hatch — for vehicle-images callers.
// ServiceHero uses useVehicleImage directly with "service-images".
export function useSignedImage(
  storagePath: string | undefined,
  fallbackUrl?: string,
): { url: string | undefined; loading: boolean; error: boolean } {
  return useVehicleImage(storagePath, fallbackUrl);
}

export function useSignedImages(
  vehicleImages: VehicleImage[] | undefined,
): { urls: (string | undefined)[]; loading: boolean; error: boolean } {
  return useVehicleImages(vehicleImages, []);
}
