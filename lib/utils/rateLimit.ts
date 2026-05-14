/**
 * Rate limiter in-memory simple.
 * Suffisant pour un garage (faible volume). Repart à zéro au redémarrage.
 * Pour production haute charge : remplacer par Upstash Redis.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

// Nettoyer les entrées expirées toutes les 5 minutes
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (bucket.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  key: string;
  limit: number;        // max requêtes dans la fenêtre
  windowMs: number;     // durée de la fenêtre en ms
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  const now    = Date.now();
  const bucket = store.get(opts.key);

  if (!bucket || bucket.resetAt < now) {
    store.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, resetAt: now + opts.windowMs };
  }

  if (bucket.count >= opts.limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: opts.limit - bucket.count, resetAt: bucket.resetAt };
}

// Extrait l'IP depuis les headers Next.js
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
