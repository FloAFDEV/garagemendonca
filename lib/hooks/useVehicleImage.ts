"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";
import type { VehicleImage } from "@/types";

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

// ─── Util : extrait le storage_path d'une URL Supabase publique ───
// Supporte /object/public/ et /object/sign/
export function extractStoragePath(urlOrPath: string): string | undefined {
  if (!urlOrPath.startsWith("http")) return urlOrPath; // déjà un path
  const m = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/vehicle-images\/([^?]+)/);
  return m?.[1];
}

// ─── Hook : 1 image ───────────────────────────────────────────────
export function useVehicleImage(
  storagePath: string | undefined,
  fallback?: string,
): { url: string | undefined; loading: boolean; error: boolean } {
  const hit = storagePath ? getCached(storagePath) : undefined;
  const [url, setUrl]         = useState<string | undefined>(hit ?? fallback);
  const [loading, setLoading] = useState(!hit && !!storagePath);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!storagePath) return;
    const cached = getCached(storagePath);
    if (cached) { setUrl(cached); setLoading(false); return; }
    setLoading(true);
    createSupabaseBrowserClient()
      .storage.from(BUCKET)
      .createSignedUrl(storagePath, TTL)
      .then(({ data, error: err }) => {
        if (err || !data?.signedUrl) { setLoading(false); setError(true); return; }
        setCached(storagePath, data.signedUrl);
        setUrl(data.signedUrl);
        setLoading(false);
      });
  // storagePath est stable pour une même fiche véhicule
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storagePath]);

  return { url, loading, error };
}

// ─── Hook : N images (galerie) ────────────────────────────────────
export function useVehicleImages(
  vehicleImages: VehicleImage[] | undefined,
  fallbacks: string[],
): { urls: string[]; loading: boolean; error: boolean } {
  const initial = vehicleImages?.map((img, i) =>
    (img.storage_path ? getCached(img.storage_path) : undefined) ?? fallbacks[i] ?? img.url,
  ) ?? fallbacks;

  const [urls, setUrls]       = useState<string[]>(initial);
  const [loading, setLoading] = useState(
    !!vehicleImages?.some((img) => img.storage_path && !getCached(img.storage_path)),
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!vehicleImages?.length) return;
    if (!vehicleImages.some((img) => img.storage_path)) return;
    const sb = createSupabaseBrowserClient();
    setLoading(true);
    Promise.all(
      vehicleImages.map(async (img, i) => {
        const path = img.storage_path;
        if (!path) return fallbacks[i] ?? img.url;
        const hit = getCached(path);
        if (hit) return hit;
        const { data, error: err } = await sb.storage.from(BUCKET).createSignedUrl(path, TTL);
        if (err || !data?.signedUrl) return fallbacks[i] ?? img.url;
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
