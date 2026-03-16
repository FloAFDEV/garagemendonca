import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { vehicles } from "@/lib/data";
import VehicleCard from "@/components/vehicles/VehicleCard";

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
            <h2 className="section-title">Véhicules d&apos;occasion</h2>
            <p className="section-subtitle mt-3 max-w-lg">
              Des véhicules soigneusement sélectionnés, contrôlés et garantis.
              Chaque voiture fait l&apos;objet d&apos;une inspection complète avant mise en vente.
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

        {/* ── Grille ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* ── Bannière garantie ── */}
        <div className="mt-10 bg-dark-900 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-dark-700">
          <div>
            <p className="text-white font-semibold text-sm">
              Tous nos véhicules sont inspectés, révisés et garantis
            </p>
            <p className="text-dark-400 text-xs mt-1">
              Contrôle technique récent · Carnet d&apos;entretien · Garantie mécanique incluse
            </p>
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
    </section>
  );
}
