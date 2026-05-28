/**
 * OccasionsBreadcrumb — Fil d'Ariane pour /occasions/[cat]/[slug].
 *
 * Structure : Accueil / Véhicules / {categoryLabel} / {vehicleName}
 * Masqué sur mobile (hidden sm:block) — cohérent avec le design existant.
 */

import Link from "next/link";

interface OccasionsBreadcrumbProps {
	categoryLabel: string;
	vehicleName: string;
}

export default function OccasionsBreadcrumb({
	categoryLabel,
	vehicleName,
}: OccasionsBreadcrumbProps) {
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
				<li>
					<Link href="/vehicules" className="hover:text-brand-600 transition-colors">
						{categoryLabel}
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
