/**
 * VehicleBreadcrumb — Fil d'Ariane pour /vehicules/[slug] (route de transition).
 *
 * Structure fixe : Accueil / Occasions / {vehicleName}
 * Masqué sur mobile (hidden sm:block) — cohérent avec le design existant.
 *
 * ⚠️  Ce composant est LOCAL à la route /vehicules/[slug].
 *     La route /occasions/[cat]/[slug] a un breadcrumb différent (4 niveaux
 *     avec catégorie) — ne pas partager ce composant sans audit préalable.
 */

import Link from "next/link";

interface VehicleBreadcrumbProps {
	vehicleName: string;
}

export default function VehicleBreadcrumb({ vehicleName }: VehicleBreadcrumbProps) {
	return (
		<nav aria-label="Fil d'Ariane" className="hidden sm:block mb-3">
			<ol className="flex items-center gap-2 text-xs text-[#64748b]">
				<li>
					<Link href="/" className="hover:text-brand-600 transition-colors">
						Accueil
					</Link>
				</li>
				<li aria-hidden="true">/</li>
				<li>
					<Link href="/vehicules" className="hover:text-brand-600 transition-colors">
						Véhicules
					</Link>
				</li>
				<li aria-hidden="true">/</li>
				<li className="text-[#0f172a] font-medium truncate max-w-[120px] sm:max-w-[200px]">
					{vehicleName}
				</li>
			</ol>
		</nav>
	);
}
