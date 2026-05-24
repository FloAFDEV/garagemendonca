/**
 * VehicleDetailHeader — En-tête d'une fiche véhicule.
 *
 * Affiche : logo marque + badge À la une + badge disponibilité + badge marketing.
 * Server Component — pas d'état client.
 */

import Image from "next/image";
import { Star } from "lucide-react";
import { getLogoSrc } from "@/lib/brandLogos";
import { getMarketingBadge } from "@/lib/vehicles/helpers";
import type { Vehicle } from "@/types";

interface VehicleDetailHeaderProps {
	vehicle: Vehicle;
	isAvailable: boolean;
}

export default function VehicleDetailHeader({
	vehicle,
	isAvailable,
}: VehicleDetailHeaderProps) {
	const badge = getMarketingBadge(vehicle.features as Record<string, unknown>);

	return (
		<div className="flex flex-wrap items-start justify-between gap-3 mb-3 sm:mb-6">
			<div className="flex items-start gap-3">
				{/* Logo marque */}
				<div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 sm:p-2 flex items-center justify-center">
					<Image
						src={getLogoSrc(vehicle.brand)}
						alt={vehicle.brand}
						width={48}
						height={48}
						className="object-contain"
					/>
				</div>

				<div>
					{/* Badges de statut */}
					<div className="flex items-center flex-wrap gap-2 mb-1.5">
						{vehicle.featured && (
							<span className="inline-flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
								<Star size={10} fill="currentColor" aria-hidden="true" /> À la une
							</span>
						)}
						<span
							className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
								isAvailable
									? "bg-emerald-100 text-emerald-700"
									: "bg-slate-200 text-slate-500"
							}`}
						>
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									isAvailable ? "bg-emerald-500" : "bg-slate-400"
								}`}
								aria-hidden="true"
							/>
							{isAvailable ? "Disponible" : "Vendue"}
						</span>
						{badge && (
							<span
								className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
									badge.variant === "arrivage"
										? "bg-amber-100 text-amber-700"
										: "bg-slate-200 text-slate-600"
								}`}
							>
								{badge.label}
							</span>
						)}
					</div>

					{/* Titre */}
					<h1 className="ty-heading text-[#0f172a] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
						{vehicle.brand} {vehicle.model}
						{vehicle.features?.["Finition"] && (
							<span className="text-slate-400 font-medium text-base sm:text-xl ml-2">
								{" — "}
								{vehicle.features["Finition"]}
							</span>
						)}
					</h1>
				</div>
			</div>
		</div>
	);
}
