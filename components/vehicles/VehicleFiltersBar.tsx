"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

const BRANDS = [
  "Citroën", "Dacia", "Daihatsu", "Ford", "Genesis", "Honda", "Hyundai",
  "Infiniti", "Kia", "KGM", "Mazda", "Mitsubishi", "Nissan",
  "Peugeot", "Renault", "SsangYong", "Suzuki", "Toyota", "Volkswagen",
];

const FUELS = ["Essence", "Diesel", "Hybride", "GPL"];
const TRANSMISSIONS = ["Automatique", "Manuelle"];

const KM_OPTIONS: { label: string; value: string }[] = [
  { label: "Tous kilométrages", value: "" },
  { label: "< 30 000 km", value: "30000" },
  { label: "< 50 000 km", value: "50000" },
  { label: "< 80 000 km", value: "80000" },
  { label: "< 100 000 km", value: "100000" },
  { label: "< 150 000 km", value: "150000" },
];

const PRICE_OPTIONS: { label: string; value: string }[] = [
  { label: "Tous les prix", value: "" },
  { label: "< 5 000 €", value: "5000" },
  { label: "< 8 000 €", value: "8000" },
  { label: "< 10 000 €", value: "10000" },
  { label: "< 12 000 €", value: "12000" },
  { label: "< 15 000 €", value: "15000" },
  { label: "< 20 000 €", value: "20000" },
];

const selectClass = (active: boolean) =>
  `bg-white border rounded-xl px-3 py-2.5 text-sm font-normal focus:ring-2 ring-brand-500/20 outline-none appearance-none transition-all cursor-pointer ${
    active
      ? "border-brand-500 text-brand-600"
      : "border-slate-200 text-slate-700"
  }`;

interface VehicleFiltersBarProps {
  totalCount: number;
}

export default function VehicleFiltersBar({ totalCount }: VehicleFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const brand = searchParams.get("brand") ?? "";
  const fuel = searchParams.get("fuel") ?? "";
  const transmission = searchParams.get("transmission") ?? "";
  const maxKm = searchParams.get("maxKm") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const hasFilters = !!(brand || fuel || transmission || maxKm || maxPrice);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      // Revenir toujours à la page 1 (URL canonique = /vehicules)
      router.push(`/vehicules${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router],
  );

  const resetAll = () => {
    router.push("/vehicules", { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-normal text-slate-800 uppercase tracking-wide">
          <span className="text-brand-600 text-lg">{totalCount}</span>{" "}
          véhicule{totalCount !== 1 ? "s" : ""} disponible{totalCount !== 1 ? "s" : ""}
        </p>
        <SlidersHorizontal size={16} className="text-slate-400 sm:hidden" aria-hidden />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Marque */}
        <select
          value={brand}
          onChange={(e) => updateFilter("brand", e.target.value)}
          aria-label="Filtrer par marque"
          className={selectClass(!!brand)}
        >
          <option value="">Toutes les marques</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Motorisation */}
        <select
          value={fuel}
          onChange={(e) => updateFilter("fuel", e.target.value)}
          aria-label="Filtrer par motorisation"
          className={selectClass(!!fuel)}
        >
          <option value="">Toutes les motorisations</option>
          {FUELS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {/* Boîte de vitesses */}
        <select
          value={transmission}
          onChange={(e) => updateFilter("transmission", e.target.value)}
          aria-label="Filtrer par boîte de vitesses"
          className={selectClass(!!transmission)}
        >
          <option value="">Toutes les boîtes</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Kilométrage max */}
        <select
          value={maxKm}
          onChange={(e) => updateFilter("maxKm", e.target.value)}
          aria-label="Kilométrage maximum"
          className={selectClass(!!maxKm)}
        >
          {KM_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Prix max */}
        <select
          value={maxPrice}
          onChange={(e) => updateFilter("maxPrice", e.target.value)}
          aria-label="Prix maximum"
          className={selectClass(!!maxPrice)}
        >
          {PRICE_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Réinitialiser */}
        {hasFilters && (
          <button
            onClick={resetAll}
            className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
            aria-label="Réinitialiser les filtres"
            title="Réinitialiser les filtres"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
