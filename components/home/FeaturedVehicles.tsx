import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { vehicles } from "@/lib/data";
import VehicleCard from "@/components/vehicles/VehicleCard";

const guarantees = [
  "Garantie 6 à 12 mois km illimités",
  "Vérification en 160 points",
  "250–500 km parcourus avant vente",
  "Révision boîte automatique incluse",
];

export default function FeaturedVehicles() {
  const featured = vehicles.filter((v) => v.featured).slice(0, 3);

  return (
    <section className="py-24 bg-dark-50">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
          <div>
            <div className="section-divider" />
            <span className="eyebrow">Notre stock</span>
            <h2 className="section-title">
              Véhicules d&apos;occasion<br />boîte automatique
            </h2>
            <p className="section-subtitle mt-3 max-w-lg">
              Pour rouler dans une nouvelle voiture sans casser votre tirelire.
              Des véhicules en bon état, bien entretenus, à faible kilométrage.
            </p>
          </div>
          <Link
            href="/vehicules"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors mt-6 lg:mt-0 group"
          >
            Voir tout le stock ({vehicles.length} véhicules)
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* ── Bannière garanties réelles ── */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck size={22} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  Tous nos véhicules sont expertisés et garantis
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {guarantees.map((g) => (
                    <span key={g} className="text-dark-400 text-xs flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-brand-500 rounded-full" aria-hidden="true" />
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/vehicules"
              className="btn-primary text-sm py-2.5 flex-shrink-0"
            >
              Voir le stock complet
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
