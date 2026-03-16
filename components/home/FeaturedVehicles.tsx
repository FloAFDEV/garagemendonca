import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { vehicles } from "@/lib/data";
import VehicleCard from "@/components/vehicles/VehicleCard";

export default function FeaturedVehicles() {
  const featured = vehicles.filter((v) => v.featured).slice(0, 3);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
          <div>
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
              Notre stock
            </span>
            <h2 className="section-title">Véhicules d&apos;occasion</h2>
            <p className="section-subtitle mt-3 max-w-lg">
              Des véhicules soigneusement sélectionnés, contrôlés et garantis.
              Chaque voiture fait l&apos;objet d&apos;une inspection complète avant mise en vente.
            </p>
          </div>
          <Link
            href="/vehicules"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors mt-6 lg:mt-0 group"
          >
            Voir tout le stock ({vehicles.length} véhicules)
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}
