"use client";

import Link from "next/link";
import { useVehiclesAdmin } from "@/lib/queries/useVehicles";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { QueryErrorFallback } from "@/lib/ui/errorBoundary";
import type { UIVehicle } from "@/types/ui";
import type { VehicleStatus } from "@/types";

interface VehicleTableProps {
  garageId: string;
}

const STATUS_BADGE: Record<VehicleStatus, string> = {
  draft:     "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  sold:      "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<VehicleStatus, string> = {
  draft:     "Brouillon",
  published: "Publié",
  scheduled: "Planifié",
  sold:      "Vendu",
};

export function VehicleTable({ garageId }: VehicleTableProps) {
  const { data, isLoading, isError, error, refetch } = useVehiclesAdmin(garageId);

  if (isError) {
    return (
      <QueryErrorFallback
        error={error instanceof Error ? error : new Error("Erreur de chargement")}
        resetQuery={() => refetch()}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Véhicule</th>
            <th className="px-4 py-3">Année</th>
            <th className="px-4 py-3">Prix</th>
            <th className="px-4 py-3">Kilométrage</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={6} />
            ))
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                Aucun véhicule trouvé.
              </td>
            </tr>
          ) : (
            data.map((vehicle) => (
              <VehicleRow key={vehicle.id} vehicle={vehicle} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VehicleRow({ vehicle }: { vehicle: UIVehicle }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{vehicle.label}</div>
        {vehicle.slug && (
          <div className="text-xs text-gray-400">{vehicle.slug}</div>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600">{vehicle.year}</td>
      <td className="px-4 py-3 font-semibold text-gray-900">{vehicle.formattedPrice}</td>
      <td className="px-4 py-3 text-gray-600">{vehicle.formattedMileage}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[vehicle.status]}`}
        >
          {STATUS_LABEL[vehicle.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {vehicle.slug && (
            <Link
              href={`/vehicules/${vehicle.slug}`}
              target="_blank"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Voir
            </Link>
          )}
          <Link
            href={`/admin/vehicules/${vehicle.id}/modifier`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Modifier
          </Link>
        </div>
      </td>
    </tr>
  );
}
