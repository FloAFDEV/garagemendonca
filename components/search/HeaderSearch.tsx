"use client";

/**
 * HeaderSearch — barre de recherche globale dans le header.
 *
 * Utilise useSearch (debounce + AbortController + cache LRU SWR).
 * L'input est isolé dans SearchInputField (memo) pour ne jamais
 * re-render à cause des résultats.
 */

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import clsx from "clsx";
import { useSearch } from "@/hooks/useSearch";
import { getLogoSrc } from "@/lib/brandLogos";
import { buildOccasionUrl, buildVehicleUrl } from "@/lib/utils/slug";

// ─── Type résultat API ────────────────────────────────────────────────────────

interface SearchHit {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  mileage: number;
  slug?: string;
  thumbnailUrl?: string;
  status: string;
  finition?: string;
  categorySlug?: string;
}

// ─── Fetcher — défini HORS du composant → référence stable ───────────────────

async function fetchVehicles(
  query: string,
  signal: AbortSignal,
): Promise<SearchHit[]> {
  const res = await fetch(
    `/api/vehicles/search?q=${encodeURIComponent(query)}`,
    { signal },
  );
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = (await res.json()) as { vehicles: SearchHit[] };
  return data.vehicles;
}

const MIN_LEN = 2;

// ─── Input isolé (memo) — ne re-render JAMAIS à cause des résultats ──────────

const SearchInputField = memo(function SearchInputField({
  value,
  onChange,
  onClear,
  isFetching,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  isFetching: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
      {isFetching ? (
        <Loader2
          size={17}
          className="text-brand-500 animate-spin flex-shrink-0"
          aria-hidden
        />
      ) : (
        <Search size={17} className="text-slate-400 flex-shrink-0" aria-hidden />
      )}

      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Marque, modèle, finition…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="flex-1 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
        aria-label="Rechercher un véhicule"
        role="searchbox"
      />

      {value && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // préserve le focus sur l'input
            onClear();
          }}
          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded"
          aria-label="Effacer la recherche"
          tabIndex={-1}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="divide-y divide-slate-100 animate-pulse" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-12 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded bg-slate-200 w-2/3" />
            <div className="h-3 rounded bg-slate-100 w-1/3" />
          </div>
          <div className="h-4 rounded bg-slate-100 w-16 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Overlay de recherche ─────────────────────────────────────────────────────

const SearchOverlay = memo(function SearchOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  const {
    inputValue,
    setInputValue,
    debouncedQuery,
    results,
    status,
    error,
    clear,
  } = useSearch<SearchHit[]>({
    fetcher: fetchVehicles,
    debounceMs: 300,
    minLength: MIN_LEN,
    cacheTTL: 30_000,
    cacheMax: 30,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus auto à l'ouverture
  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  // Ferme sur Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  // Bloque le scroll du body pendant que l'overlay est ouvert
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isSearching = debouncedQuery.trim().length >= MIN_LEN;
  const isFetching = status === "loading" || status === "stale";

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche de véhicules"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      {/* Panneau */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-[68px] sm:mt-[88px] px-3 sm:px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80">
          {/* Input — memo'd, jamais re-render par les résultats */}
          <SearchInputField
            value={inputValue}
            onChange={setInputValue}
            onClear={clear}
            isFetching={isFetching}
            inputRef={inputRef}
          />

          {/* Zone résultats */}
          <div className="max-h-[58vh] overflow-y-auto overscroll-contain">

            {/* État idle : hint */}
            {!isSearching && (
              <p className="px-4 py-5 text-sm text-slate-400 flex items-center gap-2">
                <Search size={13} className="text-slate-300" aria-hidden />
                Tapez au moins 2 caractères pour lancer la recherche
              </p>
            )}

            {/* Skeleton */}
            {isSearching && status === "loading" && <SearchSkeleton />}

            {/* Erreur */}
            {isSearching && status === "error" && (
              <p className="px-4 py-6 text-sm text-center text-red-500" role="alert">
                {error}
              </p>
            )}

            {/* Résultats */}
            {isSearching &&
              (status === "success" || status === "stale") &&
              results && (
                <>
                  {results.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-slate-500">
                        Aucun résultat pour{" "}
                        <strong className="text-slate-700">
                          «&nbsp;{debouncedQuery}&nbsp;»
                        </strong>
                      </p>
                      <Link
                        href={`/vehicules?q=${encodeURIComponent(debouncedQuery)}`}
                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                        onClick={handleClose}
                      >
                        Voir tous les véhicules
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Indicateur stale discret */}
                      {status === "stale" && (
                        <div
                          className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"
                          aria-hidden
                        />
                      )}

                      <ul role="listbox" aria-label="Résultats de recherche">
                        {results.map((v) => {
                          const categorySlug = v.categorySlug;
                          const href = categorySlug && v.slug
                            ? buildOccasionUrl(categorySlug, v.slug, v.id)
                            : v.slug
                              ? buildVehicleUrl(v.slug, v.id)
                              : `/vehicules/${v.id}`;
                          return (
                            <li key={v.id} role="option" aria-selected={false}>
                              <Link
                                href={href}
                                onClick={handleClose}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                              >
                                {/* Thumbnail */}
                                <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                  {v.thumbnailUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={v.thumbnailUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Image
                                      src={getLogoSrc(v.brand)}
                                      alt=""
                                      width={24}
                                      height={24}
                                      className="object-contain opacity-30"
                                    />
                                  )}
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {v.brand} {v.model}
                                    {v.finition && (
                                      <span className="text-brand-600 font-semibold ml-1">
                                        {v.finition}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {v.year}
                                    {" · "}
                                    {v.mileage.toLocaleString("fr-FR")} km
                                    {" · "}
                                    {v.fuel}
                                  </p>
                                </div>

                                {/* Prix / Vendue */}
                                <div className="flex-shrink-0">
                                  {v.status === "sold" ? (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                      Vendue
                                    </span>
                                  ) : (
                                    <span className="text-sm font-semibold text-brand-600">
                                      {v.price.toLocaleString("fr-FR")} €
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>

                      {/* Lien "voir tous les résultats" */}
                      <div className="border-t border-slate-100 px-4 py-2.5">
                        <Link
                          href={`/vehicules?q=${encodeURIComponent(debouncedQuery)}`}
                          className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                          onClick={handleClose}
                        >
                          <span>
                            Tous les résultats pour «&nbsp;{debouncedQuery}&nbsp;»
                          </span>
                          <ArrowRight size={13} className="flex-shrink-0" />
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
          </div>

          {/* Footer : raccourcis clavier */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">Esc</kbd>
              fermer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">↵</kbd>
              voir la fiche
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Bouton déclencheur — exporté pour le Header ─────────────────────────────

export function HeaderSearchButton({
  isOpaque,
}: {
  isOpaque: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
          isOpaque
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
        aria-label="Ouvrir la recherche"
        aria-haspopup="dialog"
      >
        <Search size={17} aria-hidden />
      </button>

      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
