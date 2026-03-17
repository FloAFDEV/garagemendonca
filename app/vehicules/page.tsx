"use client";

import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleFilters, { FilterState, INITIAL_FILTERS } from "@/components/vehicles/VehicleFilters";
import { vehicles } from "@/lib/data";
import { Car, ClipboardCheck, Wrench, BookOpen, ShieldCheck } from "lucide-react";

/* Options dérivées du catalogue (recalculées une fois au module level) */
const ALL_BRANDS = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
const ALL_FUELS  = Array.from(new Set(vehicles.map((v) => v.fuel)));

export default function VehiculesPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const filtered = useMemo(() => {
    let list = [...vehicles];

    if (filters.brands.length > 0)
      list = list.filter((v) => filters.brands.includes(v.brand));

    if (filters.fuels.length > 0)
      list = list.filter((v) => filters.fuels.includes(v.fuel));

    if (filters.kmMax !== null)
      list = list.filter((v) => v.mileage <= filters.kmMax!);

    if (filters.priceMax !== null)
      list = list.filter((v) => v.price <= filters.priceMax!);

    switch (filters.sortBy) {
      case "price-asc":  list.sort((a, b) => a.price - b.price);   break;
      case "price-desc": list.sort((a, b) => b.price - a.price);   break;
      case "km-asc":     list.sort((a, b) => a.mileage - b.mileage); break;
      case "year-desc":  list.sort((a, b) => b.year - a.year);     break;
    }

    return list;
  }, [filters]);

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

      {/* ── Catalogue ── */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="container mx-auto px-4">

          {/* Filtres */}
          <VehicleFilters
            filters={filters}
            onChange={setFilters}
            availableBrands={ALL_BRANDS}
            availableFuels={ALL_FUELS}
            totalCount={vehicles.length}
            filteredCount={filtered.length}
          />

          {/* Grille */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((vehicle, i) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i === 0} />
              ))}
            </div>
          ) : (
            /* État vide */
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
              <Car size={48} className="text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-heading font-bold text-[#0f172a] text-xl mb-2">
                Aucun véhicule pour ces critères
              </h2>
              <p className="text-[#475569] text-sm mb-6 max-w-xs mx-auto">
                Essayez d&apos;élargir votre recherche en modifiant ou en supprimant certains filtres.
              </p>
              <button
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="btn-primary"
              >
                Voir tous les véhicules
              </button>
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
              { Icon: ShieldCheck,    label: "Garantie 6 à 12 mois km illimités" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Icon size={17} className="text-brand-500" strokeWidth={1.75} aria-hidden="true" />
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
