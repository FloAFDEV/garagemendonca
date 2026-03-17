import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { vehicles } from "@/lib/data";
import { Car, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Véhicules d'occasion",
  description:
    "Découvrez notre stock de véhicules d'occasion sélectionnés, contrôlés et garantis. Toutes marques, tous budgets à Drémil-Lafage.",
};

export default function VehiculesPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-dark-900 pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-widest mb-4">
              Notre stock
            </span>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Véhicules{" "}
              <span className="text-gradient">d&apos;occasion</span>
            </h1>
            <p className="text-[#475569] text-xl leading-relaxed max-w-2xl">
              Chaque véhicule de notre stock est soigneusement inspecté,
              révisé et contrôlé avant mise en vente. Garantie qualité Garage
              Mendonca.
            </p>
          </div>
        </div>
      </section>

      {/* Vehicles grid */}
      <section className="py-16 bg-dark-50">
        <div className="container mx-auto px-4">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[#475569]">
              <Car size={18} className="text-brand-600" />
              <span className="font-semibold">
                {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} disponible
                {vehicles.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#475569]">
              <SlidersHorizontal size={16} />
              Tous les véhicules
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          {/* Empty state fallback */}
          {vehicles.length === 0 && (
            <div className="text-center py-20">
              <Car size={48} className="text-slate-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-[#0f172a] text-xl mb-2">
                Aucun véhicule disponible
              </h3>
              <p className="text-[#475569]">
                Notre stock est en cours de renouvellement. Contactez-nous pour
                connaître nos prochaines arrivées.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Guarantee banner */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
            {[
              { icon: "✅", label: "Contrôle technique récent" },
              { icon: "🔧", label: "Révision complète effectuée" },
              { icon: "📋", label: "Carnet d'entretien vérifié" },
              { icon: "🛡️", label: "Garantie véhicule d'occasion" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-[#0f172a] text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
