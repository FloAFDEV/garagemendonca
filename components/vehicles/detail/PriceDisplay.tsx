/**
 * PriceDisplay — Bloc identité + prix dans la sidebar véhicule.
 *
 * Affiche : logo marque + brand/model/year + prix + kilométrage.
 * Server Component — aucun état client.
 *
 * Rendu en Fragment (pas de wrapper div propre) —
 * le conteneur bordé est géré par VehiclePriceSidebar.
 */

import Image from "next/image";
import { getLogoSrc } from "@/lib/brandLogos";

interface PriceDisplayProps {
	brand: string;
	model: string;
	year: number;
	price: number;
	mileage: number;
}

export default function PriceDisplay({ brand, model, year, price, mileage }: PriceDisplayProps) {
	return (
		<>
			<div className="mt-4 m-4 flex items-center gap-3">
				<Image
					src={getLogoSrc(brand)}
					alt={brand}
					width={44}
					height={44}
					className="object-contain border rounded-md p-1 bg-white flex-shrink-0"
				/>
				<div>
					<p className="font-medium text-[#0f172a] leading-tight">{brand} {model}</p>
					<p className="text-slate-400 text-sm leading-tight mt-0.5">{year}</p>
				</div>
			</div>
			<div className="ty-value font-heading text-3xl sm:text-4xl">{price.toLocaleString("fr-FR")} €</div>
			<p className="text-slate-500 text-sm mt-1 font-medium">{mileage.toLocaleString("fr-FR")} km</p>
		</>
	);
}
