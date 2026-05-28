/**
 * VehicleContactSection — Section formulaire de contact d'une fiche véhicule.
 *
 * Wrapper UI pur : heading statique + card + VehicleContactFormLazy.
 * Server Component — pas d'état client, pas de logique de données.
 *
 * ⚠️  L'ancre id="contact-vehicule" est référencée par :
 *     - VehicleContactCTA (href="#contact-vehicule")
 *     - MobileVehicleFooter (href="#contact-vehicule")
 *     Ne pas modifier sans mettre à jour les deux composants.
 */

import { MessageSquare } from "lucide-react";
import VehicleContactFormLazy from "@/components/vehicles/VehicleContactFormLazy";

interface VehicleContactSectionProps {
	vehicleId: string;
	vehicleName: string;
	vehicleLabel: string;
	garageId: string;
	isAvailable: boolean;
}

export default function VehicleContactSection({
	vehicleId,
	vehicleName,
	vehicleLabel,
	garageId,
	isAvailable,
}: VehicleContactSectionProps) {
	return (
		<section id="contact-vehicule" className="mt-16 scroll-mt-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100 py-16">
			<div className="max-w-2xl mx-auto">
				<div className="mb-8 text-center">
					<div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-brand-600 text-xs font-medium mb-4">
						<MessageSquare size={13} /> Demande d&apos;information
					</div>
					<h2 className="ty-heading text-[#0f172a] text-2xl sm:text-3xl mb-3">Intéressé par ce véhicule ?</h2>
					<p className="text-slate-500 text-base">Envoyez-nous un message — nous vous répondons dans les plus brefs délais.</p>
				</div>
				<div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
					<VehicleContactFormLazy
						vehicleId={vehicleId}
						vehicleName={vehicleName}
						vehicleLabel={vehicleLabel}
						garageId={garageId}
						isAvailable={isAvailable}
					/>
				</div>
			</div>
		</section>
	);
}
