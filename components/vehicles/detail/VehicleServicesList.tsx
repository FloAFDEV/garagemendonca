/**
 * VehicleServicesList — Liste de réassurance dans la sidebar véhicule.
 *
 * 4 items statiques : essai, reprise, financement, spécialité boîte auto.
 * Server Component — aucune logique, aucun prop.
 *
 * Contenu métier figé — modification à valider avec le gérant avant toute mise à jour.
 */

import { ShieldCheck } from "lucide-react";

const SERVICES = [
	"Essai possible sur RDV",
	"Reprise de votre véhicule",
	"Financement personnalisé",
	"Spécialiste boîte auto",
] as const;

export default function VehicleServicesList() {
	return (
		<ul className="mt-5 space-y-3">
			{SERVICES.map((item) => (
				<li key={item} className="flex items-center gap-3 text-sm font-light text-slate-600">
					<ShieldCheck size={18} className="text-brand-500" /> {item}
				</li>
			))}
		</ul>
	);
}
