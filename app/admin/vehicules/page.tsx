"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { vehicles as initialVehicles } from "@/lib/data";
import { Vehicle } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Car,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
  Essence: "orange",
  Diesel: "gray",
  Hybride: "green",
  Électrique: "green",
  GPL: "blue",
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = vehicles.filter(
    (v) =>
      `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-white text-2xl">
              Véhicules
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} en stock
            </p>
          </div>
          <Link href="/admin/vehicules/nouveau" className="btn-primary text-sm">
            <Plus size={16} />
            Ajouter
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500"
          />
          <input
            type="text"
            placeholder="Rechercher un véhicule…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  {["Véhicule", "Année", "Km", "Carburant", "Prix", "Actions"].map(
                    (th) => (
                      <th
                        key={th}
                        className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider"
                      >
                        {th}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-dark-800 last:border-0 hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-dark-500 text-xs mt-0.5">
                          {vehicle.color} · {vehicle.transmission}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-300 text-sm">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4 text-dark-300 text-sm">
                      {vehicle.mileage.toLocaleString("fr-FR")} km
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={fuelVariants[vehicle.fuel] ?? "gray"}>
                        {vehicle.fuel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-heading font-bold text-brand-400 text-sm">
                        {vehicle.price.toLocaleString("fr-FR")} €
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vehicules/${vehicle.id}`}
                          target="_blank"
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                          title="Voir la fiche"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/vehicules/${vehicle.id}/modifier`}
                          className="p-2 text-dark-400 hover:text-blue-400 hover:bg-dark-700 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </Link>
                        {deleteConfirm === vehicle.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors font-medium"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs text-dark-500 hover:text-white rounded-lg transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(vehicle.id)}
                            className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <Car size={40} className="text-dark-700 mx-auto mb-3" />
                      <p className="text-dark-500 text-sm">
                        Aucun véhicule trouvé
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
