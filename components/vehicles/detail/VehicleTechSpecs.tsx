/**
 * VehicleTechSpecs — Fiche technique d'un véhicule (grille de caractéristiques).
 *
 * Affiche : année, kilométrage, énergie, transmission, puissance, teinte, portes, Crit'Air.
 * Server Component — pas d'état client.
 */

import type React from "react";
import {
	CalendarDays,
	Gauge,
	Zap,
	Settings2,
	Activity,
	Palette,
	DoorOpen,
	Leaf,
	ClipboardList,
} from "lucide-react";
import type { Vehicle } from "@/types";

interface VehicleTechSpecsProps {
	vehicle: Vehicle;
	displayColor: string | null;
}

interface SpecItem {
	icon: React.ElementType;
	label: string;
	value: string;
}

export default function VehicleTechSpecs({ vehicle, displayColor }: VehicleTechSpecsProps) {
	const specs: SpecItem[] = [
		{ icon: CalendarDays, label: "Année",        value: String(vehicle.year) },
		{ icon: Gauge,        label: "Kilométrage",  value: `${vehicle.mileage.toLocaleString("fr-FR")} km` },
		{ icon: Zap,          label: "Énergie",      value: vehicle.fuel },
		{ icon: Settings2,    label: "Transmission", value: vehicle.transmission },
		...(vehicle.power    ? [{ icon: Activity, label: "Puissance", value: `${vehicle.power} ch` }] : []),
		...(displayColor     ? [{ icon: Palette,  label: "Teinte",    value: displayColor }] : []),
		{ icon: DoorOpen, label: "Portes", value: `${vehicle.doors} portes` },
		...(vehicle.critAir  ? [{ icon: Leaf,     label: "Crit'Air",  value: `Classe ${vehicle.critAir}` }] : []),
	];

	return (
		<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-6 md:p-8">
			{/* En-tête section */}
			<div className="flex items-center gap-3 mb-6 sm:mb-8">
				<div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
					<ClipboardList size={16} className="text-brand-500" aria-hidden="true" />
				</div>
				<h2 className="font-heading font-medium text-[#0f172a] text-lg sm:text-xl tracking-tight">
					Fiche Technique
				</h2>
				<div className="h-px flex-1 bg-slate-100" aria-hidden="true" />
			</div>

			{/* Grille de caractéristiques */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
				{specs.map(({ icon: Icon, label, value }) => (
					<div
						key={label}
						className="group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-default"
					>
						<div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-brand-200 group-hover:bg-brand-50 transition-colors duration-200">
							<Icon
								size={16}
								className="text-slate-400 group-hover:text-brand-500 transition-colors duration-200"
								aria-hidden="true"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 leading-none mb-1">
								{label}
							</p>
							<p className="text-sm font-medium text-[#0f172a] leading-tight truncate">
								{value}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
