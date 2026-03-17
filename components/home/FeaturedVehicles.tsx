import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { vehicles } from "@/lib/data";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const guarantees = [
  "Garantie 6 à 12 mois km illimités",
  "Vérification en 160 points",
  "250–500 km parcourus avant vente",
  "Révision boîte automatique incluse",
];

export default function FeaturedVehicles() {
  /* 4 derniers arrivages triés par createdAt décroissant */
  const latest = [...vehicles]
    .sort((a, b) => {
      const da = a.createdAt ?? "0000-00-00";
      const db = b.createdAt ?? "0000-00-00";
      return db.localeCompare(da);
    })
    .slice(0, 4);

  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
            <div>
              <div className="section-divider" />
              <span className="eyebrow">Derniers arrivages</span>
              <h2 className="section-title">
                Nos dernières occasions
              </h2>
              <p className="section-subtitle mt-3 max-w-lg">
                Fraîchement entrées en stock, révisées et garanties 6 à 12 mois
                kilométrage illimité. Boîte automatique, toutes prêtes à rouler.
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
        </AnimateOnScroll>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {latest.map((vehicle, i) => (
            <AnimateOnScroll key={vehicle.id} delay={i * 90}>
              <VehicleCard vehicle={vehicle} priority={i === 0} />
            </AnimateOnScroll>
          ))}
        </div>

        {/* ── Bannière garanties ── */}
        <AnimateOnScroll delay={150}>
          <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-3">
                <ShieldCheck size={22} className="text-brand-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#0f172a] font-semibold text-sm mb-1">
                    Tous nos véhicules sont expertisés et garantis
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {guarantees.map((g) => (
                      <span key={g} className="text-[#475569] text-xs flex items-center gap-1.5">
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
        </AnimateOnScroll>
      </div>
    </section>
  );
}
