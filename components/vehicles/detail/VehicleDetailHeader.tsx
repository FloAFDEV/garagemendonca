/**
 * VehicleDetailHeader — En-tête d'une fiche véhicule.
 *
 * Affiche : logo marque + badge À la une + badge disponibilité + badge marketing.
 * Server Component — pas d'état client, aucune logique métier.
 *
 * La logique de résolution du badge marketing (getMarketingBadge) reste
 * dans la page appelante — ce composant est purement présentationnel.
 */

import Image from "next/image";
import { Star } from "lucide-react";
import { getLogoSrc } from "@/lib/brandLogos";
import type { Vehicle } from "@/types";

interface MarketingBadge {
	label: string;
	variant: string;
}

interface VehicleDetailHeaderProps {
	vehicle: Vehicle;
	isAvailable: boolean;
	/** Résultat de getMarketingBadge() — calculé dans la page. Null si aucun badge. */
	marketingBadge: MarketingBadge | null;
}

export default function VehicleDetailHeader({
	vehicle,
	isAvailable,
	marketingBadge,
}: VehicleDetailHeaderProps) {
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
					{/* Badges */}
					<div className="flex items-center flex-wrap gap-2 mb-1.5">
						{vehicle.featured && (
							<span className="inline-flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
								<Star size={10} fill="currentColor" /> À la une
							</span>
						)}
						<span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
							<span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`} />
							{isAvailable ? "Disponible" : "Vendue"}
						</span>
						{(() => {
							if (!marketingBadge) return null;
							return (
								<span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${marketingBadge.variant === "arrivage" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
									{marketingBadge.label}
								</span>
							);
						})()}
					</div>

					{/* H1 — invariant SEO absolu */}
					<h1 className="ty-heading text-[#0f172a] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
						{vehicle.brand} {vehicle.model}
						{vehicle.features?.["Finition"] && (
							<span className="text-slate-400 font-medium text-base sm:text-xl ml-2">
								{" — "}{vehicle.features["Finition"]}
							</span>
						)}
					</h1>
				</div>
			</div>
		</div>
	);
}
