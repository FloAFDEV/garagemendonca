"use client";

import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { vehicles } from "@/lib/data";
import { Car, SlidersHorizontal, ClipboardCheck, Wrench, BookOpen, ShieldCheck, X } from "lucide-react";

const FUELS = Array.from(new Set(vehicles.map((v) => v.fuel)));
const PRICE_MAX = Math.max(...vehicles.map((v) => v.price));
const PRICE_MIN = Math.min(...vehicles.map((v) => v.price));

export default function VehiculesPage() {
  const [fuelFilter, setFuelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "km-asc">("price-asc");

  const filtered = useMemo(() => {
    let list = fuelFilter ? vehicles.filter((v) => v.fuel === fuelFilter) : [...vehicles];
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "km-asc") list.sort((a, b) => a.mileage - b.mileage);
    return list;
  }, [fuelFilter, sortBy]);

  return (
    <MainLayout>
      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-36 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-brand-500" aria-hidden="true" />
              <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">Notre stock</span>
            </div>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Véhicules d&apos;occasion{" "}
              <span className="text-brand-500">révisés &amp; garantis</span>
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed max-w-2xl">
              Chaque véhicule est inspecté en 160 points, révisé et garanti 6 à 12 mois
              kilométrage illimité. Financement et reprise étudiés ensemble.
            </p>
          </div>
        </div>
      </section>

      {/* ── Grille véhicules ── */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-4">

          {/* Barre filtres */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 text-[#475569]">
              <Car size={18} className="text-brand-600" aria-hidden="true" />
              <span className="font-semibold text-[#0f172a]">
                {filtered.length} véhicule{filtered.length > 1 ? "s" : ""}
                {fuelFilter ? ` · ${fuelFilter}` : " disponibles"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtre carburant */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <SlidersHorizontal size={15} className="text-[#475569]" aria-hidden="true" />
                {FUELS.map((fuel) => (
                  <button
                    key={fuel}
                    onClick={() => setFuelFilter(fuelFilter === fuel ? null : fuel)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                      fuelFilter === fuel
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-white text-[#475569] border-slate-200 hover:border-brand-300 hover:text-brand-600"
                    }`}
                    aria-pressed={fuelFilter === fuel}
                  >
                    {fuel}
                  </button>
                ))}
                {fuelFilter && (
                  <button
                    onClick={() => setFuelFilter(null)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#475569] transition-colors"
                    aria-label="Effacer le filtre carburant"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#475569] bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
                aria-label="Trier les véhicules"
              >
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="km-asc">Kilométrage croissant</option>
              </select>
            </div>
          </div>

          {/* Grille */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i === 0} />
            ))}
          </div>

          {/* État vide */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Car size={48} className="text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-heading font-bold text-[#0f172a] text-xl mb-2">Aucun véhicule pour ce filtre</h2>
              <p className="text-[#475569] mb-4">
                Essayez un autre critère ou{" "}
                <button onClick={() => setFuelFilter(null)} className="text-brand-600 font-semibold hover:underline">
                  affichez tous les véhicules
                </button>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Bannière garanties ── */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 text-center">
            {[
              { Icon: ClipboardCheck, label: "Contrôle technique récent" },
              { Icon: Wrench,         label: "Révision complète effectuée" },
              { Icon: BookOpen,       label: "Carnet d'entretien vérifié" },
              { Icon: ShieldCheck,    label: "Garantie 6 à 12 mois" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Icon size={17} className="text-brand-500" strokeWidth={1.75} />
                </div>
                <span className="font-semibold text-[#0f172a] text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
