/**
 * VehiclePriceSidebar — Sidebar commerciale d'une fiche véhicule.
 *
 * Orchestrateur : compose PriceDisplay, VehicleStatusBadge, VehicleContactCTA,
 * VehicleServicesList et GarageAddressBlock dans le layout sticky.
 *
 * Server Component — pas d'état client.
 *
 * Seule logique de résolution ici : garantie (nullish coalescing ?? sur features)
 * — pas de valeur fallback métier, uniquement affichage conditionnel.
 */

import GarageAddressBlock from "@/components/layout/GarageAddressBlock";
import PriceDisplay from "@/components/vehicles/detail/PriceDisplay";
import VehicleStatusBadge from "@/components/vehicles/detail/VehicleStatusBadge";
import VehicleContactCTA from "@/components/vehicles/detail/VehicleContactCTA";
import VehicleServicesList from "@/components/vehicles/detail/VehicleServicesList";
import type { Vehicle } from "@/types";

interface VehiclePriceSidebarProps {
	vehicle: Vehicle;
}

export default function VehiclePriceSidebar({ vehicle }: VehiclePriceSidebarProps) {
	// Résolution nullish — pas de fallback texte (contrairement à la checklist QualityCard)
	const garantie = vehicle.features?.garantie ?? (vehicle.features as Record<string, unknown> | undefined)?.["Garantie"] as string | undefined;

	return (
		<aside className="lg:sticky lg:top-[120px] space-y-6 self-start h-fit">
			<div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8">
				<div className="mb-4 pb-4 border-b border-slate-100">
					<PriceDisplay
						brand={vehicle.brand}
						model={vehicle.model}
						year={vehicle.year}
						price={vehicle.price}
						mileage={vehicle.mileage}
					/>
					<VehicleStatusBadge garantie={garantie} />
				</div>
				<VehicleContactCTA />
				<VehicleServicesList />
			</div>
			<GarageAddressBlock />
		</aside>
	);
}
