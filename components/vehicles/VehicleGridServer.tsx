/**
 * VehicleGridServer — Server Component async pour le grid du catalogue.
 *
 * Séparé des pages listing pour permettre le streaming RSC via <Suspense> :
 * le hero + les filtres + la pagination s'affichent immédiatement depuis le
 * cache (totalCount, brands, categories), puis ce composant stream les cards
 * dès que listPaginated() répond.
 *
 * Usage :
 *   <Suspense fallback={<VehicleGridFallback />}>
 *     <VehicleGridServer garageId={...} page={...} filters={...} />
 *   </Suspense>
 */

import Link from "next/link";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { vehicleDb, type VehicleListFilters } from "@/lib/db/vehicle.repository";
import { VEHICLES_PER_PAGE } from "@/lib/vehicles/pagination";

interface VehicleGridServerProps {
  garageId: string;
  page: number;
  filters: VehicleListFilters;
  emptyHref?: string;
  emptyExtra?: string;
}

export async function VehicleGridServer({
  garageId,
  page,
  filters,
  emptyHref = "/vehicules",
  emptyExtra,
}: VehicleGridServerProps) {
  const vehicles = await vehicleDb
    .listPaginated(garageId, page, VEHICLES_PER_PAGE, filters)
    .catch((err) => {
      console.error("[VehicleGridServer] listPaginated failed:", err);
      return [];
    });

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg mb-2">Aucun véhicule ne correspond à vos critères.</p>
        {emptyExtra && <p className="text-sm mb-6">{emptyExtra}</p>}
        <Link
          href={emptyHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors mt-4"
        >
          Voir tous les véhicules
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
      {vehicles.map((vehicle, i) =>
        i < 4 ? (
          <VehicleCard key={vehicle.id} vehicle={vehicle} priority />
        ) : (
          <AnimateOnScroll key={vehicle.id} delay={(i - 4) * 60}>
            <VehicleCard vehicle={vehicle} />
          </AnimateOnScroll>
        ),
      )}
    </div>
  );
}

/** Fallback skeleton affiché pendant le streaming du grid. */
export function VehicleGridFallback() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="aspect-[3/2] sm:aspect-[4/3] bg-slate-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-5 bg-slate-200 rounded w-1/3 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
