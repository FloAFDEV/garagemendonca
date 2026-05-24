/**
 * VehicleQualityCard — Carte description + checklist de confiance.
 *
 * Contient :
 *   - Description marketing formatée (ou description générique)
 *   - Checklist 4 points : CT, révision, 160 points, garantie
 *
 * Server Component — pas d'état client.
 */

import type React from "react";
import { CheckCircle2 } from "lucide-react";
import { FormatVehicleDescription } from "@/lib/utils/formatVehicleDescription";
import QualityControlTooltip from "@/components/ui/QualityControlTooltip";
import type { Vehicle } from "@/types";

interface VehicleQualityCardProps {
	vehicle: Vehicle;
}

export default function VehicleQualityCard({ vehicle }: VehicleQualityCardProps) {
	const garantie =
		vehicle.features?.garantie ??
		(vehicle.features as Record<string, unknown> | undefined)?.["Garantie"];

	const checklistItems: React.ReactNode[] = [
		"Contrôle technique à jour",
		"Révision effectuée",
		<QualityControlTooltip
			key="qc"
			variant="inline"
			triggerClassName="text-sm font-normal text-slate-700"
		>
			Vérification 160 points
		</QualityControlTooltip>,
		garantie ? `Garantie ${garantie}` : "Garantie 6 à 12 mois",
	];

	return (
		<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 md:p-8">
			<FormatVehicleDescription
				text={vehicle.description_marketing ?? vehicle.description ?? ""}
			/>
			<div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
				{checklistItems.map((item, idx) => (
					<div
						key={idx}
						className="flex items-center gap-3 text-sm font-normal text-slate-700"
					>
						<CheckCircle2
							size={16}
							className="text-emerald-500 flex-shrink-0"
							aria-hidden="true"
						/>
						{item}
					</div>
				))}
			</div>
		</div>
	);
}
