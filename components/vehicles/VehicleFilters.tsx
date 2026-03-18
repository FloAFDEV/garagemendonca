"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronDown, X, SlidersHorizontal, Check, RotateCcw } from "lucide-react";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";

/* ─────────── types ─────────── */
export type SortOption = "price-asc" | "price-desc" | "km-asc" | "year-desc";

export interface FilterState {
  brands: string[];
  fuels: string[];
  kmMax: number | null;
  priceMax: number | null;
  sortBy: SortOption;
}

export const INITIAL_FILTERS: FilterState = {
  brands: [],
  fuels: [],
  kmMax: null,
  priceMax: null,
  sortBy: "price-asc",
};

interface VehicleFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  availableBrands: string[];
  availableFuels: string[];
  totalCount: number;
  filteredCount: number;
}

/* ─────────── options statiques ─────────── */
const KM_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Tous kilométrages", value: null },
  { label: "Moins de 30 000 km", value: 30000 },
  { label: "Moins de 50 000 km", value: 50000 },
  { label: "Moins de 80 000 km", value: 80000 },
  { label: "Moins de 100 000 km", value: 100000 },
  { label: "Moins de 150 000 km", value: 150000 },
];

const PRICE_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Tous les prix", value: null },
  { label: "Moins de 8 000 €", value: 8000 },
  { label: "Moins de 10 000 €", value: 10000 },
  { label: "Moins de 12 000 €", value: 12000 },
  { label: "Moins de 15 000 €", value: 15000 },
  { label: "Moins de 20 000 €", value: 20000 },
  { label: "Moins de 25 000 €", value: 25000 },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Prix croissant", value: "price-asc" },
  { label: "Prix décroissant", value: "price-desc" },
  { label: "Kilométrage croissant", value: "km-asc" },
  { label: "Plus récent", value: "year-desc" },
];

/* ─────────── sous-composant : logo marque ─────────── */
function BrandLogo({ brand }: { brand: string }) {
  const logoPath = BRAND_LOGO_MAP[brand];

  if (!logoPath) {
    return (
      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#64748b] flex-shrink-0">
        {brand[0]}
      </span>
    );
  }

  return (
    <Image
      src={logoPath}
      alt=""
      aria-hidden
      width={32}
      height={32}
      className="object-contain flex-shrink-0"
    />
  );
}

/* ─────────── sous-composant : dropdown générique ─────────── */
function Dropdown({
  label,
  active,
  children,
  badge,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
  badge?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 ${
          active
            ? "bg-brand-500 text-white border-brand-500 shadow-sm"
            : "bg-white text-[#0f172a] border-slate-200 hover:border-brand-400 hover:text-brand-600"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label}
        {badge ? (
          <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${active ? "bg-white text-brand-600" : "bg-brand-500 text-white"}`}>
            {badge}
          </span>
        ) : null}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-w-[220px] overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────── composant principal ─────────── */
export default function VehicleFilters({
  filters,
  onChange,
  availableBrands,
  availableFuels,
  totalCount,
  filteredCount,
}: VehicleFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const set = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
      onChange({ ...filters, [key]: value }),
    [filters, onChange]
  );

  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    set("brands", next);
  };

  const toggleFuel = (fuel: string) => {
    const next = filters.fuels.includes(fuel)
      ? filters.fuels.filter((f) => f !== fuel)
      : [...filters.fuels, fuel];
    set("fuels", next);
  };

  const activeCount =
    filters.brands.length +
    filters.fuels.length +
    (filters.kmMax !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0);

  const isFiltered = activeCount > 0;

  const reset = () => onChange({ ...INITIAL_FILTERS, sortBy: filters.sortBy });

  /* ── Contenu du dropdown Marques ── */
  const brandDropdownContent = (
    <ul className="max-h-64 overflow-y-auto py-2" role="listbox" aria-multiselectable="true" aria-label="Marques">
      {availableBrands.sort().map((brand) => {
        const selected = filters.brands.includes(brand);
        return (
          <li key={brand}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => toggleBrand(brand)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors text-left"
            >
              <BrandLogo brand={brand} />
              <span className="flex-1 font-medium text-[#0f172a]">{brand}</span>
              <span className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${selected ? "bg-brand-500 border-brand-500" : "border-slate-300"}`} aria-hidden="true">
                {selected && <Check size={12} className="text-white" />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  /* ── Contenu dropdown Km ── */
  const kmDropdownContent = (
    <ul className="py-2" role="listbox" aria-label="Kilométrage maximum">
      {KM_OPTIONS.map(({ label, value }) => {
        const selected = filters.kmMax === value;
        return (
          <li key={label}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => { set("kmMax", value); }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${selected ? "bg-brand-50 text-brand-600 font-semibold" : "hover:bg-slate-50 text-[#0f172a]"}`}
            >
              {label}
              {selected && <Check size={14} className="text-brand-500 flex-shrink-0" aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ul>
  );

  /* ── Contenu dropdown Prix ── */
  const priceDropdownContent = (
    <ul className="py-2" role="listbox" aria-label="Prix maximum">
      {PRICE_OPTIONS.map(({ label, value }) => {
        const selected = filters.priceMax === value;
        return (
          <li key={label}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => { set("priceMax", value); }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${selected ? "bg-brand-50 text-brand-600 font-semibold" : "hover:bg-slate-50 text-[#0f172a]"}`}
            >
              {label}
              {selected && <Check size={14} className="text-brand-500 flex-shrink-0" aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Marque */}
      <Dropdown
        label="Marque"
        active={filters.brands.length > 0}
        badge={filters.brands.length || undefined}
      >
        {brandDropdownContent}
      </Dropdown>

      {/* Prix max */}
      <Dropdown
        label={filters.priceMax ? `≤ ${filters.priceMax.toLocaleString("fr-FR")} €` : "Prix maximum"}
        active={filters.priceMax !== null}
      >
        {priceDropdownContent}
      </Dropdown>

      {/* Km max */}
      <Dropdown
        label={filters.kmMax ? `≤ ${filters.kmMax.toLocaleString("fr-FR")} km` : "Kilométrage"}
        active={filters.kmMax !== null}
      >
        {kmDropdownContent}
      </Dropdown>

      {/* Carburant — pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {availableFuels.map((fuel) => {
          const selected = filters.fuels.includes(fuel);
          return (
            <button
              key={fuel}
              type="button"
              onClick={() => toggleFuel(fuel)}
              aria-pressed={selected}
              className={`px-3 py-2.5 min-h-[44px] rounded-xl border text-xs font-semibold transition-all duration-150 ${
                selected
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white text-[#475569] border-slate-200 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {fuel}
            </button>
          );
        })}
      </div>

      {/* Séparateur */}
      <div className="w-px h-6 bg-slate-200 hidden sm:block" aria-hidden="true" />

      {/* Tri */}
      <select
        value={filters.sortBy}
        onChange={(e) => set("sortBy", e.target.value as SortOption)}
        className="pl-3 pr-8 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-[#475569] bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
        aria-label="Trier les véhicules"
      >
        {SORT_OPTIONS.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Reset */}
      {isFiltered && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-[#475569] bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Réinitialiser
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-8 space-y-4">
      {/* ── Barre principale ── */}
      <div className="flex flex-col gap-3">
        {/* Compteur + toggle mobile */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0f172a]">
            <span className="text-brand-600 font-black">{filteredCount}</span>
            {" "}véhicule{filteredCount > 1 ? "s" : ""}
            {isFiltered && <span className="text-[#64748b] font-normal"> sur {totalCount}</span>}
          </p>

          {/* Toggle mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className={`sm:hidden flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${mobileOpen || isFiltered ? "bg-brand-500 text-white border-brand-500" : "bg-white border-slate-200 text-[#475569]"}`}
            aria-expanded={mobileOpen}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filtres
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-brand-600 text-xs font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtres : desktop toujours visible, mobile conditionnel */}
        <div className={`${mobileOpen ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-2`}>
          {filterBar}
        </div>
      </div>

      {/* ── Chips filtres actifs ── */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
          {filters.brands.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {b}
              <button type="button" onClick={() => toggleBrand(b)} aria-label={`Retirer le filtre ${b}`} className="p-1 hover:text-brand-900">
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}
          {filters.fuels.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {f}
              <button type="button" onClick={() => toggleFuel(f)} aria-label={`Retirer le filtre ${f}`} className="p-1 hover:text-brand-900">
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          ))}
          {filters.kmMax !== null && (
            <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              ≤ {filters.kmMax.toLocaleString("fr-FR")} km
              <button type="button" onClick={() => set("kmMax", null)} aria-label="Retirer le filtre kilométrage" className="p-1 hover:text-brand-900">
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          )}
          {filters.priceMax !== null && (
            <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              ≤ {filters.priceMax.toLocaleString("fr-FR")} €
              <button type="button" onClick={() => set("priceMax", null)} aria-label="Retirer le filtre prix" className="p-1 hover:text-brand-900">
                <X size={11} aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
