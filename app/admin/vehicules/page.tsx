"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { vehicles as initialVehicles } from "@/lib/data";
import { Vehicle, VehicleStatus } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Car,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { updateVehicleStatus } from "./actions";

const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
  Essence: "orange",
  Diesel: "gray",
  Hybride: "green",
  Électrique: "green",
  GPL: "blue",
};

/* ─── Config statuts ─── */
const STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; className: string }
> = {
  published: {
    label: "Publié",
    className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  draft: {
    label: "Brouillon",
    className: "bg-dark-700 text-dark-400 border border-dark-600",
  },
  scheduled: {
    label: "Programmé",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  sold: {
    label: "Vendu",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
};

const STATUS_ORDER: VehicleStatus[] = ["published", "draft", "scheduled", "sold"];

function StatusSelect({
  vehicleId,
  current,
  onChange,
}: {
  vehicleId: string;
  current: VehicleStatus;
  onChange: (id: string, status: VehicleStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[current];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${cfg.className} transition-opacity hover:opacity-80`}
      >
        {cfg.label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1 z-20 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden min-w-[130px]">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onChange(vehicleId, s);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-dark-700 ${
                  s === current ? "text-white" : "text-dark-300"
                }`}
              >
                {STATUS_CONFIG[s].label}
                {s === current && " ✓"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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

  const handleStatusChange = (id: string, status: VehicleStatus) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status,
              ...(status === "sold" && !v.sold_at
                ? { sold_at: new Date().toISOString() }
                : {}),
            }
          : v
      )
    );
    updateVehicleStatus(id, status);
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
              {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} au total
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
                  {["Véhicule", "Année", "Km", "Carburant", "Prix", "Statut", "Actions"].map(
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
                        {/* Date publication programmée */}
                        {vehicle.status === "scheduled" && vehicle.published_at && (
                          <div className="text-blue-400 text-xs mt-1">
                            📅 {new Date(vehicle.published_at).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                        {/* Date de vente */}
                        {vehicle.status === "sold" && vehicle.sold_at && (
                          <div className="text-dark-500 text-xs mt-1">
                            Vendu le {new Date(vehicle.sold_at).toLocaleDateString("fr-FR")}
                          </div>
                        )}
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
                    {/* Statut — dropdown inline */}
                    <td className="px-6 py-4">
                      <StatusSelect
                        vehicleId={vehicle.id}
                        current={vehicle.status ?? "draft"}
                        onChange={handleStatusChange}
                      />
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
                              className="px-2 py-1 text-xs bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium"
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
                    <td colSpan={7} className="text-center py-16">
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
