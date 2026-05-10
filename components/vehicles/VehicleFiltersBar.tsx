"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, RotateCcw, ChevronDown, Check } from "lucide-react";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";

// ─── Données statiques ───────────────────────────────────────────

const AVAILABLE_BRANDS = [
  "Citroën", "Dacia", "Daihatsu", "Ford", "Genesis", "Honda",
  "Hyundai", "Infiniti", "Kia", "KGM", "Mazda", "Mitsubishi",
  "Nissan", "Peugeot", "Renault", "SsangYong", "Suzuki", "Toyota", "Volkswagen",
];

const FUELS = ["Essence", "Diesel", "Hybride", "GPL"];
const TRANSMISSIONS = ["Automatique", "Manuelle"];

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
  { label: "< 5 000 €", value: "5000" },
  { label: "< 8 000 €", value: "8000" },
  { label: "< 10 000 €", value: "10000" },
  { label: "< 12 000 €", value: "12000" },
  { label: "< 15 000 €", value: "15000" },
  { label: "< 20 000 €", value: "20000" },
];

// ─── Helpers ─────────────────────────────────────────────────────

function selectClass(active: boolean) {
  return [
    "bg-white border rounded-xl px-3 py-2.5 text-sm outline-none appearance-none cursor-pointer transition-all",
    "focus:ring-2 ring-brand-500/20",
    active ? "border-brand-500 text-brand-600" : "border-slate-200 text-slate-700",
  ].join(" ");
}

// ─── Composant logo marque ────────────────────────────────────────

function BrandLogo({ brand, size = 24 }: { brand: string; size?: number }) {
  const src = BRAND_LOGO_MAP[brand];
  if (!src) {
    return (
      <span
        style={{ width: size, height: size }}
        className="rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-medium text-slate-400 border border-slate-200 flex-shrink-0 uppercase"
      >
        {brand.slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="object-contain flex-shrink-0" />
  );
}

// ─── Multi-select marques ─────────────────────────────────────────

function BrandMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (brands: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

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
            ? "bg-brand-500 text-white border-brand-500"
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
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl w-72 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Sélection rapide */}
          {selected.length > 0 && (
            <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
              <span className="text-xs text-slate-500">{selected.length} sélectionné{selected.length > 1 ? "s" : ""}</span>
              <button
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* Grille marques */}
          <ul className="max-h-72 overflow-y-auto py-2">
            {AVAILABLE_BRANDS.map((brand) => {
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
                    {active && (
                      <Check size={14} className="text-brand-500 flex-shrink-0" />
                    )}
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

// ─── Composant principal ──────────────────────────────────────────

export default function VehicleFiltersBar({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lire l'état des filtres depuis l'URL
  const qUrl = searchParams.get("q") ?? "";
  const brandsStr = searchParams.get("brands") ?? "";
  const selectedBrands = brandsStr ? brandsStr.split(",").filter(Boolean) : [];
  const fuel = searchParams.get("fuel") ?? "";
  const transmission = searchParams.get("transmission") ?? "";
  const maxKm = searchParams.get("maxKm") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  // État local du champ texte (débounce avant écriture URL)
  const [searchInput, setSearchInput] = useState(qUrl);

  // Sync si l'URL change (ex: bouton "retour")
  useEffect(() => { setSearchInput(qUrl); }, [qUrl]);

  const hasFilters = !!(qUrl || brandsStr || fuel || transmission || maxKm || maxPrice);

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

  // Débounce : ne pousse l'URL qu'après 350 ms de silence
  useEffect(() => {
    if (searchInput === qUrl) return;
    const t = setTimeout(() => pushFilters({ q: searchInput }), 350);
    return () => clearTimeout(t);
  }, [searchInput, qUrl, pushFilters]);

  const handleBrandsChange = (brands: string[]) => {
    pushFilters({ brands: brands.join(",") });
  };

  const updateSelect = (key: string, value: string) => pushFilters({ [key]: value });

  const resetAll = () => {
    setSearchInput("");
    router.push("/vehicules", { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Compteur */}
      <p className="text-sm font-normal text-slate-800 uppercase tracking-wide">
        <span className="text-brand-600 text-lg">{totalCount}</span>{" "}
        véhicule{totalCount !== 1 ? "s" : ""} disponible{totalCount !== 1 ? "s" : ""}
      </p>

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* ── Recherche texte ── */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Marque, modèle…"
            aria-label="Rechercher un véhicule"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 ring-brand-500/20 transition-all"
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

        {/* ── Multi-select marques ── */}
        <BrandMultiSelect selected={selectedBrands} onChange={handleBrandsChange} />

        {/* ── Carburant ── */}
        <select
          value={fuel}
          onChange={(e) => updateSelect("fuel", e.target.value)}
          aria-label="Filtrer par carburant"
          className={selectClass(!!fuel)}
        >
          <option value="">Carburant</option>
          {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* ── Boîte ── */}
        <select
          value={transmission}
          onChange={(e) => updateSelect("transmission", e.target.value)}
          aria-label="Filtrer par boîte de vitesses"
          className={selectClass(!!transmission)}
        >
          <option value="">Boîte auto / manuelle</option>
          {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* ── Km max ── */}
        <select
          value={maxKm}
          onChange={(e) => updateSelect("maxKm", e.target.value)}
          aria-label="Kilométrage maximum"
          className={selectClass(!!maxKm)}
        >
          {KM_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
        </select>

        {/* ── Prix max ── */}
        <select
          value={maxPrice}
          onChange={(e) => updateSelect("maxPrice", e.target.value)}
          aria-label="Prix maximum"
          className={selectClass(!!maxPrice)}
        >
          {PRICE_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
        </select>

        {/* ── Reset ── */}
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

      {/* Chips filtres actifs */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {selectedBrands.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs text-brand-700"
            >
              <BrandLogo brand={b} size={14} />
              {b}
              <button onClick={() => handleBrandsChange(selectedBrands.filter((x) => x !== b))} className="hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          ))}
          {qUrl && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
              «{qUrl}»
              <button onClick={() => { setSearchInput(""); pushFilters({ q: "" }); }} className="hover:text-red-500">
                <X size={10} />
              </button>
            </span>
          )}
          {fuel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
              {fuel}
              <button onClick={() => updateSelect("fuel", "")} className="hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {transmission && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
              {transmission}
              <button onClick={() => updateSelect("transmission", "")} className="hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {maxKm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
              &lt; {parseInt(maxKm).toLocaleString("fr-FR")} km
              <button onClick={() => updateSelect("maxKm", "")} className="hover:text-red-500"><X size={10} /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
              &lt; {parseInt(maxPrice).toLocaleString("fr-FR")} €
              <button onClick={() => updateSelect("maxPrice", "")} className="hover:text-red-500"><X size={10} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
