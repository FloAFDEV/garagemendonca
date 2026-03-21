"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleFilters, {
  FilterState,
  INITIAL_FILTERS,
} from "@/components/vehicles/VehicleFilters";
import { Vehicle } from "@/types";
import { Car } from "lucide-react";

interface Props {
  vehicles: Vehicle[];
  allBrands: string[];
  allFuels: string[];
}

function CatalogueContent({ vehicles, allBrands, allFuels }: Props) {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand");

  const [filters, setFilters] = useState<FilterState>({
    ...INITIAL_FILTERS,
    brands: brandParam ? [brandParam] : [],
  });
  const [hideSold, setHideSold] = useState(true);

  const filtered = useMemo(() => {
    let list = [...vehicles];
    if (hideSold) list = list.filter((v) => v.status !== "sold");

    if (filters.brands.length > 0)
      list = list.filter((v) => filters.brands.includes(v.brand));

    if (filters.fuels.length > 0)
      list = list.filter((v) => filters.fuels.includes(v.fuel));

    if (filters.kmMax !== null)
      list = list.filter((v) => v.mileage <= filters.kmMax!);

    if (filters.priceMax !== null)
      list = list.filter((v) => v.price <= filters.priceMax!);

    switch (filters.sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "km-asc":
        list.sort((a, b) => a.mileage - b.mileage);
        break;
      case "year-desc":
        list.sort((a, b) => b.year - a.year);
        break;
    }

    return list;
  }, [vehicles, filters, hideSold]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <VehicleFilters
            filters={filters}
            onChange={setFilters}
            availableBrands={allBrands}
            availableFuels={allFuels}
            totalCount={vehicles.length}
            filteredCount={filtered.length}
            hideSold={hideSold}
            onToggleHideSold={() => setHideSold((v) => !v)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((vehicle, i) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              priority={i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <Car
            size={48}
            className="text-slate-300 mx-auto mb-4"
            aria-hidden="true"
          />
          <h2 className="ty-subheading text-[#0f172a] text-xl mb-2">
            Aucun véhicule pour ces critères
          </h2>
          <p className="text-[#475569] text-sm mb-6 max-w-xs mx-auto">
            Essayez d&apos;élargir votre recherche en modifiant ou en
            supprimant certains filtres.
          </p>
          <button
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="btn-primary"
          >
            Voir tous les véhicules
          </button>
        </div>
      )}
    </>
  );
}

export default function VehiclesCatalogue(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded-xl w-2/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <CatalogueContent {...props} />
    </Suspense>
  );
}
