"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, RotateCcw, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { getLogoSrc } from "@/lib/brandLogos";
import type { VehicleCategory } from "@/types";
import { getCategoryIcon } from "@/lib/data/categoryIcons";

function normalizeText(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// ─── Données statiques ───────────────────────────────────────────

const FUELS        = ["Essence", "Diesel", "Hybride", "GPL"];
const TRANSMISSIONS = ["Automatique", "Manuelle"];

const SORT_OPTIONS = [
  { label: "Plus récent", value: "" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Kilométrage ↑", value: "mileage_asc" },
  { label: "Année ↓", value: "year_desc" },
] as const;

const KM_OPTIONS = [
  { label: "Tous kilométrages", value: "" },
  { label: "< 30 000 km", value: "30000" },
  { label: "< 50 000 km", value: "50000" },
  { label: "< 80 000 km", value: "80000" },
  { label: "< 100 000 km", value: "100000" },
  { label: "< 150 000 km", value: "150000" },
];

const PRICE_OPTIONS = [
  { label: "Tous les prix", value: "" },
  { label: "< 5 000 €",  value: "5000" },
  { label: "< 8 000 €",  value: "8000" },
  { label: "< 10 000 €", value: "10000" },
  { label: "< 12 000 €", value: "12000" },
  { label: "< 15 000 €", value: "15000" },
  { label: "< 20 000 €", value: "20000" },
];

const PRICE_MIN_OPTIONS = [
  { label: "Prix min",    value: "" },
  { label: "≥ 3 000 €",  value: "3000" },
  { label: "≥ 5 000 €",  value: "5000" },
  { label: "≥ 8 000 €",  value: "8000" },
  { label: "≥ 10 000 €", value: "10000" },
  { label: "≥ 15 000 €", value: "15000" },
];

/** Généré côté serveur et passé en prop — pas de calcul côté client */
function buildYearOptions(currentYear: number) {
  return Array.from({ length: 20 }, (_, i) => currentYear - i);
}

// ─── Helpers ─────────────────────────────────────────────────────

function selectClass(active: boolean) {
  return [
    "bg-white border rounded-xl px-3 py-2.5 text-sm outline-none appearance-none cursor-pointer transition-all",
    "focus:ring-2 ring-brand-500/20",
    active
      ? "border-brand-500 text-brand-600 font-medium"
      : "border-slate-200 text-slate-700",
  ].join(" ");
}

// ─── Composant logo marque ────────────────────────────────────────

function BrandLogo({ brand, size = 24 }: { brand: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={getLogoSrc(brand)} alt="" width={size} height={size} className="object-contain flex-shrink-0" />
  );
}

// ─── Multi-select marques ─────────────────────────────────────────

function BrandMultiSelect({
  selected,
  onChange,
  availableBrands,
}: {
  selected: string[];
  onChange: (brands: string[]) => void;
  availableBrands: string[];
}) {
  const [open, setOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setBrandSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setBrandSearch("");
  }, [open]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    const q = normalizeText(brandSearch);
    return availableBrands.filter((b) => normalizeText(b).includes(q));
  }, [brandSearch, availableBrands]);

  const toggle = (brand: string) => {
    onChange(
      selected.includes(brand)
        ? selected.filter((b) => b !== brand)
        : [...selected, brand],
    );
  };

  const label =
    selected.length === 0
      ? "Toutes les marques"
      : selected.length === 1
        ? selected[0]
        : `${selected[0]} +${selected.length - 1}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all",
          "focus:outline-none focus:ring-2 ring-brand-500/20",
          selected.length > 0
            ? "bg-white border-2 border-brand-500 text-brand-700 ring-2 ring-brand-500/20"
            : "bg-white text-slate-700 border-slate-200 hover:border-brand-300",
        ].join(" ")}
      >
        {selected.length > 0 && (
          <div className="flex items-center gap-1">
            {selected.slice(0, 2).map((b) => (
              <BrandLogo key={b} brand={b} size={16} />
            ))}
          </div>
        )}
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-72 max-w-[calc(100vw-1rem)] overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Search inside dropdown */}
          <div className="p-2.5 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Rechercher une marque…"
                className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ring-brand-500/20 text-slate-700 placeholder-slate-400 [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden"
                onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setBrandSearch(""); } }}
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {selected.length > 0 && (
            <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Tout effacer
              </button>
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto py-1.5">
            {filteredBrands.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400 text-center">Aucune marque trouvée</li>
            ) : filteredBrands.map((brand) => {
              const active = selected.includes(brand);
              return (
                <li key={brand}>
                  <button
                    type="button"
                    onClick={() => toggle(brand)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                      active ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-700",
                    ].join(" ")}
                  >
                    <BrandLogo brand={brand} size={22} />
                    <span className="flex-1 font-normal">{brand}</span>
                    {active && <Check size={14} className="text-brand-500 flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Panneau "Plus de filtres" (année + prix min) ─────────────────

function MoreFiltersPanel({
  minYear,
  maxYear,
  minPrice,
  yearOptions,
  onUpdate,
}: {
  minYear: string;
  maxYear: string;
  minPrice: string;
  yearOptions: number[];
  onUpdate: (vals: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasExtra = !!(minYear || maxYear || minPrice);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all",
          "focus:outline-none focus:ring-2 ring-brand-500/20",
          hasExtra
            ? "bg-white border-2 border-brand-500 text-brand-700 ring-2 ring-brand-500/20"
            : "bg-white text-slate-700 border-slate-200 hover:border-brand-300",
        ].join(" ")}
        aria-label="Plus de filtres"
      >
        <SlidersHorizontal size={14} />
        <span className="hidden sm:inline whitespace-nowrap">
          Filtres{hasExtra ? ` (${[minYear, maxYear, minPrice].filter(Boolean).length})` : ""}
        </span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-72 max-w-[calc(100vw-1rem)] p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filtres avancés</p>

          {/* Année */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Année</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={minYear}
                onChange={(e) => onUpdate({ minYear: e.target.value })}
                className="text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 ring-brand-500/20 bg-white text-slate-700 cursor-pointer"
                aria-label="Année minimum"
              >
                <option value="">De…</option>
                {yearOptions.slice().reverse().map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={maxYear}
                onChange={(e) => onUpdate({ maxYear: e.target.value })}
                className="text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 ring-brand-500/20 bg-white text-slate-700 cursor-pointer"
                aria-label="Année maximum"
              >
                <option value="">À…</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prix min */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Budget minimum</label>
            <select
              value={minPrice}
              onChange={(e) => onUpdate({ minPrice: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 ring-brand-500/20 bg-white text-slate-700 cursor-pointer"
              aria-label="Prix minimum"
            >
              {PRICE_MIN_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Reset extra */}
          {hasExtra && (
            <button
              type="button"
              onClick={() => { onUpdate({ minYear: "", maxYear: "", minPrice: "" }); setOpen(false); }}
              className="w-full text-xs text-red-500 hover:text-red-700 transition-colors text-left"
            >
              Effacer ces filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────

export default function VehicleFiltersBar({
  totalCount,
  availableBrands,
  currentYear,
  categories = [],
}: {
  totalCount: number;
  availableBrands: string[];
  currentYear: number;
  categories?: VehicleCategory[];
}) {
  const YEAR_OPTIONS = buildYearOptions(currentYear);

  const router      = useRouter();
  const searchParams = useSearchParams();

  // Lire l'état des filtres depuis l'URL
  const qUrl        = searchParams.get("q") ?? "";
  const brandsStr   = searchParams.get("brands") ?? "";
  const selectedBrands = brandsStr ? brandsStr.split(",").filter(Boolean) : [];
  const fuel        = searchParams.get("fuel") ?? "";
  const transmission = searchParams.get("transmission") ?? "";
  const maxKm       = searchParams.get("maxKm") ?? "";
  const maxPrice    = searchParams.get("maxPrice") ?? "";
  const minPrice    = searchParams.get("minPrice") ?? "";
  const minYear     = searchParams.get("minYear") ?? "";
  const maxYear     = searchParams.get("maxYear") ?? "";
  const sort        = searchParams.get("sort") ?? "";
  const category    = searchParams.get("category") ?? "";

  // État local du champ texte (débounce avant écriture URL)
  const [searchInput, setSearchInput] = useState(qUrl);
  // État du panneau filtres mobile
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync si l'URL change (ex: bouton "retour")
  useEffect(() => { setSearchInput(qUrl); }, [qUrl]);

  // Verrouillage du scroll body quand le panneau mobile est ouvert
  useEffect(() => {
    if (mobileFiltersOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  const hasFilters = !!(qUrl || brandsStr || fuel || transmission || maxKm || maxPrice || minPrice || minYear || maxYear || category);

  // Nombre de filtres actifs hors recherche texte — pour le badge du bouton Filtres
  const activeFilterCount = [brandsStr, fuel, transmission, maxKm, maxPrice, minPrice, minYear, maxYear, sort]
    .filter(Boolean).length;

  // Fonction centrale : met à jour des paramètres et revient toujours à /vehicules (page 1)
  const pushFilters = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.push(
        `/vehicules${params.toString() ? `?${params.toString()}` : ""}`,
        { scroll: false },
      );
    },
    [searchParams, router],
  );

  // Débounce recherche texte
  useEffect(() => {
    if (searchInput === qUrl) return;
    const t = setTimeout(() => pushFilters({ q: searchInput }), 350);
    return () => clearTimeout(t);
  }, [searchInput, qUrl, pushFilters]);

  const resetAll = () => {
    setSearchInput("");
    router.push("/vehicules", { scroll: false });
  };

  // ─── Chips filtres actifs (partagées mobile + desktop) ────────────

  const ActiveChips = ({ compact = false }: { compact?: boolean }) => (
    <>
      {selectedBrands.map((b) => (
        <span
          key={b}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs text-brand-700"
        >
          <BrandLogo brand={b} size={14} />
          {b}
          <button
            onClick={() => pushFilters({ brands: selectedBrands.filter((x) => x !== b).join(",") })}
            className="hover:text-red-500"
            aria-label={`Supprimer le filtre ${b}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      {qUrl && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          «{qUrl}»
          <button onClick={() => { setSearchInput(""); pushFilters({ q: "" }); }} className="hover:text-red-500" aria-label="Supprimer la recherche"><X size={10} /></button>
        </span>
      )}
      {fuel && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          {fuel}
          <button onClick={() => pushFilters({ fuel: "" })} className="hover:text-red-500" aria-label="Supprimer le filtre carburant"><X size={10} /></button>
        </span>
      )}
      {transmission && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          {transmission}
          <button onClick={() => pushFilters({ transmission: "" })} className="hover:text-red-500" aria-label="Supprimer le filtre boîte"><X size={10} /></button>
        </span>
      )}
      {maxKm && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          &lt; {parseInt(maxKm).toLocaleString("fr-FR")} km
          <button onClick={() => pushFilters({ maxKm: "" })} className="hover:text-red-500" aria-label="Supprimer le filtre kilométrage"><X size={10} /></button>
        </span>
      )}
      {minPrice && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          ≥ {parseInt(minPrice).toLocaleString("fr-FR")} €
          <button onClick={() => pushFilters({ minPrice: "" })} className="hover:text-red-500" aria-label="Supprimer le filtre prix min"><X size={10} /></button>
        </span>
      )}
      {maxPrice && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          &lt; {parseInt(maxPrice).toLocaleString("fr-FR")} €
          <button onClick={() => pushFilters({ maxPrice: "" })} className="hover:text-red-500" aria-label="Supprimer le filtre prix max"><X size={10} /></button>
        </span>
      )}
      {(minYear || maxYear) && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          {minYear && maxYear ? `${minYear} – ${maxYear}` : minYear ? `≥ ${minYear}` : `≤ ${maxYear}`}
          <button onClick={() => pushFilters({ minYear: "", maxYear: "" })} className="hover:text-red-500" aria-label="Supprimer le filtre année"><X size={10} /></button>
        </span>
      )}
      {sort && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
          {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort}
          <button onClick={() => pushFilters({ sort: "" })} className="hover:text-red-500" aria-label="Supprimer le tri"><X size={10} /></button>
        </span>
      )}
      {compact && hasFilters && (
        <button
          onClick={resetAll}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          <RotateCcw size={9} />
          Tout effacer
        </button>
      )}
    </>
  );

  return (
    <div className="mb-6 sm:mb-8">

      {/* ════════════════════════════════════════════════════════════
          MOBILE (< md) — Structure compacte : search + action bar
          ════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-2">

        {/* Onglets catégories — scrollable horizontal, compact */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none]">
            <button
              type="button"
              onClick={() => pushFilters({ category: "" })}
              className={[
                "flex-none inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                !category
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200",
              ].join(" ")}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => pushFilters({ category: cat.slug })}
                className={[
                  "flex-none inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                  category === cat.slug
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200",
                ].join(" ")}
              >
                {(() => { const I = getCategoryIcon(cat.icon); return I ? <I size={11} className="flex-shrink-0" aria-hidden="true" /> : null; })()}
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Search bar — padding réduit */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Marque, modèle…"
            aria-label="Rechercher un véhicule"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 ring-brand-500/20 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); pushFilters({ q: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Effacer la recherche"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Action bar : compteur à gauche, bouton Filtres à droite */}
        <div className="flex items-center justify-between gap-3">
          {/* Compteur */}
          {hasFilters ? (
            <p className="text-sm text-slate-800">
              <span className="text-brand-600 font-semibold">{totalCount}</span>{" "}
              résultat{totalCount !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{totalCount}</span>{" "}
              véhicule{totalCount !== 1 ? "s" : ""}
            </p>
          )}

          {/* Bouton Filtres */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className={[
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
              activeFilterCount > 0
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-700",
            ].join(" ")}
            aria-label={`Ouvrir les filtres${activeFilterCount > 0 ? ` (${activeFilterCount} actif${activeFilterCount > 1 ? "s" : ""})` : ""}`}
          >
            <SlidersHorizontal size={14} />
            Filtres
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Chips filtres actifs (mobile) */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1.5">
            <ActiveChips compact />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP (≥ md) — Layout original inchangé pixel-perfect
          ════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-4">

        {/* Onglets catégories */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap -mb-1">
            <button
              type="button"
              onClick={() => pushFilters({ category: "" })}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
                !category
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600",
              ].join(" ")}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => pushFilters({ category: cat.slug })}
                className={[
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
                  category === cat.slug
                    ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600",
                ].join(" ")}
              >
                {(() => { const I = getCategoryIcon(cat.icon); return I ? <I size={13} className="flex-shrink-0" aria-hidden="true" /> : null; })()}
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Compteur + tri */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {hasFilters ? (
            <p className="text-sm font-normal text-slate-800 uppercase tracking-wide">
              <span className="text-brand-600 text-lg font-semibold">{totalCount}</span>{" "}
              résultat{totalCount !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-sm font-normal text-slate-500 uppercase tracking-wide">
              Tous nos véhicules
            </p>
          )}

          {/* Tri */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-slate-500 hidden sm:inline whitespace-nowrap">
              Trier par
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => pushFilters({ sort: e.target.value })}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ring-brand-500/20 bg-white text-slate-700 cursor-pointer transition-all hover:border-slate-300"
              aria-label="Trier les véhicules"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Barre de filtres */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Recherche texte */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Marque, modèle…"
              aria-label="Rechercher un véhicule"
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 ring-brand-500/20 transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); pushFilters({ q: "" }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Effacer la recherche"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Multi-select marques */}
          <BrandMultiSelect
            selected={selectedBrands}
            onChange={(brands) => pushFilters({ brands: brands.join(",") })}
            availableBrands={availableBrands}
          />

          {/* Carburant */}
          <select
            value={fuel}
            onChange={(e) => pushFilters({ fuel: e.target.value })}
            aria-label="Filtrer par carburant"
            className={selectClass(!!fuel)}
          >
            <option value="">Carburant</option>
            {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Boîte */}
          <select
            value={transmission}
            onChange={(e) => pushFilters({ transmission: e.target.value })}
            aria-label="Filtrer par boîte de vitesses"
            className={selectClass(!!transmission)}
          >
            <option value="">Boîte auto / manuelle</option>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Km max */}
          <select
            value={maxKm}
            onChange={(e) => pushFilters({ maxKm: e.target.value })}
            aria-label="Kilométrage maximum"
            className={selectClass(!!maxKm)}
          >
            {KM_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
          </select>

          {/* Prix max */}
          <select
            value={maxPrice}
            onChange={(e) => pushFilters({ maxPrice: e.target.value })}
            aria-label="Prix maximum"
            className={selectClass(!!maxPrice)}
          >
            {PRICE_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
          </select>

          {/* Plus de filtres (année + prix min) */}
          <MoreFiltersPanel
            minYear={minYear}
            maxYear={maxYear}
            minPrice={minPrice}
            yearOptions={YEAR_OPTIONS}
            onUpdate={(vals) => pushFilters(vals)}
          />

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={resetAll}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              aria-label="Réinitialiser tous les filtres"
              title="Réinitialiser"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>

        {/* Chips filtres actifs (desktop) */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1.5">
            <ActiveChips />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          PANNEAU FILTRES MOBILE — Bottom sheet (fixed, z-50)
          Ouvert via le bouton "Filtres" dans l'action bar mobile.
          Contient tous les filtres dans des sections organisées.
          ════════════════════════════════════════════════════════════ */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Filtres de recherche"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="font-semibold text-[#0f172a] text-base">Filtres</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-lg"
                aria-label="Fermer les filtres"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">

              {/* ── Trier par ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Trier par</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => pushFilters({ sort: o.value })}
                      className={[
                        "px-3 py-2 rounded-xl border text-sm transition-all",
                        sort === o.value
                          ? "bg-brand-500 text-white border-brand-500 font-medium"
                          : "bg-white text-slate-700 border-slate-200",
                      ].join(" ")}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Marque ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Marque</p>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
                  {availableBrands.map((brand) => {
                    const active = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => {
                          const next = active
                            ? selectedBrands.filter((b) => b !== brand)
                            : [...selectedBrands, brand];
                          pushFilters({ brands: next.join(",") });
                        }}
                        className={[
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all",
                          active
                            ? "bg-brand-500 text-white border-brand-500 font-medium"
                            : "bg-white text-slate-700 border-slate-200",
                        ].join(" ")}
                      >
                        <BrandLogo brand={brand} size={16} />
                        {brand}
                        {active && <Check size={12} className="flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Carburant ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Carburant</p>
                <div className="flex flex-wrap gap-2">
                  {["", ...FUELS].map((f) => (
                    <button
                      key={f || "all"}
                      type="button"
                      onClick={() => pushFilters({ fuel: f })}
                      className={[
                        "px-3 py-2 rounded-xl border text-sm transition-all",
                        fuel === f
                          ? "bg-brand-500 text-white border-brand-500 font-medium"
                          : "bg-white text-slate-700 border-slate-200",
                      ].join(" ")}
                    >
                      {f || "Tous"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Boîte de vitesses ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Boîte de vitesses</p>
                <div className="flex flex-wrap gap-2">
                  {["", ...TRANSMISSIONS].map((t) => (
                    <button
                      key={t || "all"}
                      type="button"
                      onClick={() => pushFilters({ transmission: t })}
                      className={[
                        "px-3 py-2 rounded-xl border text-sm transition-all",
                        transmission === t
                          ? "bg-brand-500 text-white border-brand-500 font-medium"
                          : "bg-white text-slate-700 border-slate-200",
                      ].join(" ")}
                    >
                      {t || "Toutes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Kilométrage max ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Kilométrage maximum</p>
                <select
                  value={maxKm}
                  onChange={(e) => pushFilters({ maxKm: e.target.value })}
                  aria-label="Kilométrage maximum"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 ring-brand-500/20 cursor-pointer appearance-none"
                >
                  {KM_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* ── Prix maximum ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Prix maximum</p>
                <select
                  value={maxPrice}
                  onChange={(e) => pushFilters({ maxPrice: e.target.value })}
                  aria-label="Prix maximum"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 ring-brand-500/20 cursor-pointer appearance-none"
                >
                  {PRICE_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* ── Budget minimum ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Budget minimum</p>
                <select
                  value={minPrice}
                  onChange={(e) => pushFilters({ minPrice: e.target.value })}
                  aria-label="Prix minimum"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 ring-brand-500/20 cursor-pointer appearance-none"
                >
                  {PRICE_MIN_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* ── Année ── */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Année</p>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={minYear}
                    onChange={(e) => pushFilters({ minYear: e.target.value })}
                    className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 ring-brand-500/20 cursor-pointer appearance-none"
                    aria-label="Année minimum"
                  >
                    <option value="">De…</option>
                    {YEAR_OPTIONS.slice().reverse().map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={maxYear}
                    onChange={(e) => pushFilters({ maxYear: e.target.value })}
                    className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 ring-brand-500/20 cursor-pointer appearance-none"
                    aria-label="Année maximum"
                  >
                    <option value="">À…</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer — boutons Réinitialiser + Voir les résultats */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 flex gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => { resetAll(); setMobileFiltersOpen(false); }}
                  className="flex-none flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
              >
                Voir {totalCount} résultat{totalCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
