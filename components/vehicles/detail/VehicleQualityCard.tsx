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
import { Check, ShieldCheck } from "lucide-react";
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
			<div className="mt-6 pt-5 border-t border-slate-100">
				<div className="flex items-center gap-2 mb-3.5">
					<ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
					<span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
						État &amp; entretien
					</span>
				</div>
				<ul className="space-y-2.5">
					{checklistItems.map((item, idx) => (
						<li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700 leading-snug">
							<Check size={13} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
							<span>{item}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
