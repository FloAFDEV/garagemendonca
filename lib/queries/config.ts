/**
 * Stratégie cache React Query.
 *
 * PUBLIC  — pages catalogue SEO : données stables, cache long.
 *           Next.js revalide la page ISR, le client ne re-fetch pas souvent.
 *
 * ADMIN   — dashboard en temps réel : cache court, re-fetch fréquent.
 *           Les admins voient les modifications quasi-immédiatement.
 *
 * STATIC  — données quasi-immuables (garage config) : cache très long.
 */

export const STALE_TIMES = {
  PUBLIC:  5 * 60 * 1000,   // 5 min  — catalogue véhicules, fiche véhicule
  ADMIN:   30 * 1000,        // 30 s   — messages, liste admin véhicules
  STATIC:  60 * 60 * 1000,  // 1 h    — config garage, catégories
} as const;

export const GC_TIMES = {
  PUBLIC:  10 * 60 * 1000,  // 10 min
  ADMIN:   2  * 60 * 1000,  // 2 min
  STATIC:  24 * 60 * 60 * 1000, // 24 h
} as const;
