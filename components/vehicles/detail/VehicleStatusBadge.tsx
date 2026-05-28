/**
 * VehicleStatusBadge — Badge garantie conditionnel dans la sidebar véhicule.
 *
 * Rendu : null si garantie absente, sinon badge emerald avec label.
 * Server Component — pas d'état client.
 *
 * La résolution de la valeur garantie (??  features.garantie / features["Garantie"])
 * est effectuée dans VehiclePriceSidebar — ce composant reçoit la valeur résolue.
 */

import { ShieldCheck } from "lucide-react";

interface VehicleStatusBadgeProps {
	/** Valeur garantie résolue (nullish coalescing côté orchestrateur). Null = pas d'affichage. */
	garantie: string | null | undefined;
}

export default function VehicleStatusBadge({ garantie }: VehicleStatusBadgeProps) {
	if (!garantie) return null;
	return (
		<span className="inline-flex items-center gap-1.5 mt-2 text-xs font-light px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full">
			<ShieldCheck size={12} className="text-emerald-500" /> Garantie {garantie}
		</span>
	);
}
