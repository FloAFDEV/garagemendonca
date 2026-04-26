"use client";

import Link from "next/link";
import Image from "next/image";
import { useVehicles } from "@/lib/queries/useVehicles";
import { VehicleCardSkeleton } from "@/components/ui/Skeleton";
import { QueryErrorFallback } from "@/lib/ui/errorBoundary";
import type { UIVehicle, UIVehicleFilters } from "@/types/ui";

interface VehicleGridProps {
  filters?: UIVehicleFilters;
  columns?: 2 | 3 | 4;
}

const GRID_COLS = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function VehicleGrid({ filters, columns = 3 }: VehicleGridProps) {
  const { data, isLoading, isError, error, refetch } = useVehicles(filters);

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${GRID_COLS[columns]}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorFallback
        error={error instanceof Error ? error : new Error("Erreur de chargement")}
        resetQuery={() => refetch()}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-gray-500">Aucun véhicule disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${GRID_COLS[columns]}`}>
      {data.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: UIVehicle }) {
  const href = vehicle.slug ? `/vehicules/${vehicle.slug}` : `/vehicules/${vehicle.id}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="block">
        <div className="relative h-52 w-full overflow-hidden bg-gray-100">
          {vehicle.thumbnailUrl ? (
            <Image
              src={vehicle.thumbnailUrl}
              alt={vehicle.label}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl text-gray-300">🚗</span>
            </div>
          )}
          {vehicle.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-900">
              En vedette
            </span>
          )}
          {vehicle.isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-red-600 px-4 py-1 text-sm font-bold text-white">
                VENDU
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
            {vehicle.label}
          </h3>
          <p className="mt-1 text-xl font-bold text-blue-700">{vehicle.formattedPrice}</p>

          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <li>{vehicle.formattedMileage}</li>
            <li>{vehicle.fuel}</li>
            <li>{vehicle.transmission}</li>
          </ul>
        </div>
      </Link>
    </article>
  );
}
