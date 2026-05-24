/**
 * VehicleRelatedSection — Grille de suggestions véhicules similaires.
 *
 * Rendering grid pur — aucune logique de tri, slicing ou fallback interne.
 * La condition d'affichage (vehicles.length > 0) est gérée dans la page appelante.
 * Le ranking et le filtrage sont assurés par vehicleDb.getRelated() côté DB.
 *
 * Server Component — pas d'état client.
 *
 * ⚠️  Ne pas transformer ce composant en "RelatedSystem" :
 *     - pas de tri client
 *     - pas de slicing
 *     - pas de fetch conditionnel
 *     - pas de fallback "si < 3 alors..."
 */

import Link from "next/link";
import VehicleCard from "@/components/vehicles/VehicleCard";
import type { Vehicle } from "@/types";

interface VehicleRelatedSectionProps {
	/** Véhicules déjà filtrés et classés par vehicleDb.getRelated() — passés tels quels. */
	vehicles: Vehicle[];
}

export default function VehicleRelatedSection({ vehicles }: VehicleRelatedSectionProps) {
	return (
		<section className="mt-16 border-t border-slate-100 pt-12">
			<div className="flex items-center justify-between mb-6">
				<h2 className="ty-heading text-[#0f172a] text-3xl">Suggestions</h2>
				<Link href="/vehicules" className="text-sm font-normal text-brand-600 hover:text-brand-700 underline underline-offset-4">
					Voir tout le stock
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
				{vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
			</div>
		</section>
	);
}
