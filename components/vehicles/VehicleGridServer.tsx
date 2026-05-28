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
          // Délai plafonné à 80ms : cascade rapide, perception instantanée au retour nav.
        // Formule : 15ms × rang au-delà des 4 cards prioritaires, max 80ms.
        <AnimateOnScroll key={vehicle.id} delay={Math.min((i - 4) * 15, 80)}>
            <VehicleCard vehicle={vehicle} />
          </AnimateOnScroll>
        ),
      )}
    </div>
  );
}

/**
 * Skeleton carte véhicule — structure identique à la vraie VehicleCard.
 * Mobile et desktop matchent pixel-pour-pixel pour éviter tout CLS quand
 * le contenu remplace le skeleton.
 */
function CardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-black/[0.07] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.06)] animate-pulse">
      {/* Image — même ratio que VehicleCard */}
      <div className="aspect-[3/2] sm:aspect-[4/3] bg-slate-200" />

      {/* Mobile (< sm) */}
      <div className="sm:hidden flex flex-col gap-1 px-2.5 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-1">
          <div className="h-3.5 bg-slate-200 rounded w-3/5" />
          <div className="h-4 w-14 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 bg-slate-100 rounded w-2/5" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mt-0.5" />
        <div className="h-2.5 bg-slate-100 rounded w-3/4" />
      </div>

      {/* Desktop (sm+) */}
      <div className="hidden sm:flex sm:flex-col p-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((j) => (
            <div key={j} className="h-5 flex-1 bg-slate-100 rounded-md" />
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Fallback Suspense pour le streaming du grid — structure identique à la grille réelle. */
export function VehicleGridFallback() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
