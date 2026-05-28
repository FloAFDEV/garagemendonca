/**
 * AdminVehicleRow — structure visuelle unifiée pour une ligne de véhicule admin.
 *
 * Rendu en fragment : le parent fournit le wrapper (Link ou div[role=button])
 * avec `flex items-center gap-3`. Ce composant gère uniquement le contenu :
 *   [thumbnail] [title+subtitle] [price+statusSlot+afterPrice?] [trailingSlot?]
 *
 * Usage dashboard  : wrapper = <Link>, statusSlot = <VehicleStatusBadge>, trailing = <ArrowRight>
 * Usage admin list : wrapper = <div role=button>, statusSlot = <StatusSelect>, stopRightPropagation
 */
"use client";
import { Car, Star } from "lucide-react";
import type { Vehicle } from "@/types";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import clsx from "clsx";

interface AdminVehicleRowProps {
	vehicle: Vehicle;
	/** Badge statut — StatusSelect (admin list) ou VehicleStatusBadge (dashboard) */
	statusSlot: React.ReactNode;
	/** Contenu optionnel sous le badge statut — ex: date dans le dashboard */
	afterPrice?: React.ReactNode;
	/** Élément de fin de ligne — ex: ArrowRight dans le dashboard */
	trailingSlot?: React.ReactNode;
	/** Stoppe la propagation du clic sur la colonne droite (admin list) */
	stopRightPropagation?: boolean;
}

export function AdminVehicleRow({
	vehicle,
	statusSlot,
	afterPrice,
	trailingSlot,
	stopRightPropagation,
}: AdminVehicleRowProps) {
	const t = useAdminTokens();
	const displayUrl =
		vehicle.thumbnailUrl ??
		vehicle.vehicleImages?.[0]?.url ??
		vehicle.images?.[0];

	return (
		<>
			{/* Thumbnail */}
			<div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700 flex items-center justify-center">
				{displayUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={displayUrl} alt="" className="w-full h-full object-cover" />
				) : (
					<Car size={14} className={t.txtFaint} aria-hidden="true" />
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className={clsx("font-medium text-sm truncate flex items-center gap-1", t.txt)}>
					{vehicle.featured && (
						<Star
							size={10}
							className="text-amber-400 fill-amber-400 flex-shrink-0"
							aria-hidden="true"
						/>
					)}
					{vehicle.brand} {vehicle.model}
				</p>
				<p className={clsx("text-xs mt-0.5 truncate", t.txtSubtle)}>
					{vehicle.year} · {vehicle.mileage.toLocaleString("fr-FR")} km · {vehicle.fuel}
					{vehicle.color ? ` · ${vehicle.color}` : ""}
				</p>
			</div>

			{/* Prix + statut + afterPrice */}
			<div
				className="flex flex-col items-end gap-1 flex-shrink-0"
				onClick={stopRightPropagation ? (e) => e.stopPropagation() : undefined}
			>
				<span className="font-heading font-medium text-brand-500 text-sm">
					{vehicle.price.toLocaleString("fr-FR")} €
				</span>
				{statusSlot}
				{afterPrice}
			</div>

			{/* Élément de fin (flèche dashboard) */}
			{trailingSlot}
		</>
	);
}
