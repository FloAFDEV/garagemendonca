/**
 * VehicleContactCTA — Boutons de conversion dans la sidebar véhicule.
 *
 * Deux CTAs statiques : appel téléphonique + scroll vers formulaire.
 * Server Component — pas d'état client, pas de props dynamiques.
 *
 * ⚠️  Numéro de téléphone et ancre #contact-vehicule sont des constantes
 *     métier figées — ne pas les extraire en config sans coordination SEO/tracking.
 */

import { Phone, MessageSquare } from "lucide-react";

export default function VehicleContactCTA() {
	return (
		<div className="space-y-4">
			<a href="tel:0532002038" className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-brand-500/20">
				<Phone size={18} /> 05 32 00 20 38
			</a>
			<a href="#contact-vehicule" className="btn-secondary w-full justify-center py-4 text-sm border-2 border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50">
				<MessageSquare size={17} /> Envoyer un message
			</a>
		</div>
	);
}
