"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

// ─── Types publics ────────────────────────────────────────────────────────────

export type SearchStatus = "idle" | "loading" | "stale" | "success" | "error";

export interface UseSearchOptions<T> {
  /** Fonction de fetch — peut être définie hors composant pour rester stable. */
  fetcher: (query: string, signal: AbortSignal) => Promise<T>;
  /** Délai debounce en ms. Défaut : 350. */
  debounceMs?: number;
  /** Longueur minimale de la query pour déclencher le fetch. Défaut : 2. */
  minLength?: number;
  /** TTL du cache LRU en ms. 0 = pas de cache. Défaut : 60 000. */
  cacheTTL?: number;
  /** Nombre max d'entrées dans le cache. Défaut : 50. */
  cacheMax?: number;
}

export interface UseSearchResult<T> {
  /** Valeur brute de l'input — jamais modifiée par les résultats. */
  inputValue: string;
  setInputValue: (v: string) => void;
  /** Query envoyée au fetch (après debounce). */
  debouncedQuery: string;
  results: T | null;
  status: SearchStatus;
  error: string | null;
  /** Vide l'input, les résultats et annule la requête en cours. */
  clear: () => void;
}

// ─── Entrée de cache ──────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  ts: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSearch<T>({
  fetcher,
  debounceMs = 350,
  minLength = 2,
  cacheTTL = 60_000,
  cacheMax = 50,
}: UseSearchOptions<T>): UseSearchResult<T> {
  // ── 1. State input — isolé des résultats ──────────────────────────
  const [inputValue, setInputValue] = useState("");

  // ── 2. Query debounced — SEUL déclencheur du fetch ────────────────
  const debouncedQuery = useDebounce(inputValue, debounceMs);

  // ── 3. State résultats ────────────────────────────────────────────
  const [results, setResults] = useState<T | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Refs stables ──────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);

  // fetcherRef : toujours à jour sans jamais entrer dans les deps d'un effect.
  // Pattern sûr : on lit fetcherRef.current DANS l'effet, pas en closure.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Cache LRU par instance de hook
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  // ── Effect fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const q = debouncedQuery.trim();

    if (q.length < minLength) {
      abortRef.current?.abort();
      setStatus("idle");
      setResults(null);
      setError(null);
      return;
    }

    const cache = cacheRef.current;
    const cached = cacheTTL > 0 ? cache.get(q) : undefined;
    const now = Date.now();
    const isFresh = !!cached && now - cached.ts < cacheTTL;

    // Stale-while-revalidate : affiche le cache immédiatement
    if (cached) {
      setResults(cached.data);
      setStatus(isFresh ? "success" : "stale");
      if (isFresh) return; // encore frais → pas de refetch
    }

    // Annule la requête précédente
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Passe en "loading" seulement si rien à afficher (pas de cache stale)
    if (!cached) setStatus("loading");

    fetcherRef.current(q, ctrl.signal)
      .then((data) => {
        if (ctrl.signal.aborted) return;

        // LRU eviction : supprime le plus ancien si plein
        if (cacheTTL > 0) {
          if (cache.size >= cacheMax) {
            const oldest = cache.keys().next().value;
            if (oldest) cache.delete(oldest);
          }
          cache.set(q, { data, ts: Date.now() });
        }

        setResults(data);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Erreur de recherche");
        setStatus("error");
      });

    return () => ctrl.abort();
  }, [debouncedQuery, minLength, cacheTTL, cacheMax]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setInputValue("");
    setResults(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    inputValue,
    setInputValue,
    debouncedQuery,
    results,
    status,
    error,
    clear,
  };
}
