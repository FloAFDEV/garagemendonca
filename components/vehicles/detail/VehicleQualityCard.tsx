/**
 * VehicleQualityCard — Carte description + checklist de confiance.
 *
 * Composant UI pur — aucune logique métier interne.
 * Les calculs de texte (description fallback, garantie label) sont effectués
 * dans la page appelante et passés comme props.
 *
 * Server Component — pas d'état client.
 */

import type React from "react";
import { CheckCircle2 } from "lucide-react";
import { FormatVehicleDescription } from "@/lib/utils/formatVehicleDescription";
import QualityControlTooltip from "@/components/ui/QualityControlTooltip";

interface VehicleQualityCardProps {
	/** Texte brut calculé dans la page : vehicle.description_marketing ?? vehicle.description ?? "" */
	descriptionText: string;
	/** Label garantie calculé dans la page — logique || / ?? conservée côté page. */
	garantieLabel: string;
}

export default function VehicleQualityCard({
	descriptionText,
	garantieLabel,
}: VehicleQualityCardProps) {
	const checklistItems: React.ReactNode[] = [
		"Contrôle technique à jour",
		"Révision effectuée",
		<QualityControlTooltip key="qc" variant="inline" triggerClassName="text-sm font-normal text-slate-700">
			Vérification 160 points
		</QualityControlTooltip>,
		garantieLabel,
	];

	return (
		<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 md:p-8">
			<FormatVehicleDescription text={descriptionText} />
			<div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
				{checklistItems.map((item, idx) => (
					<div key={idx} className="flex items-center gap-3 text-sm font-normal text-slate-700">
						<CheckCircle2 size={16} className="text-emerald-500" /> {item}
					</div>
				))}
			</div>
		</div>
	);
}
