/**
 * OccasionsBreadcrumb — Fil d'Ariane pour /occasions/[cat]/[slug].
 *
 * Structure : Accueil / Occasions / {categoryLabel} / {vehicleName}
 * Le niveau 3 (catégorie) est un lien cliquable vers /occasions/{categorySlug}.
 * Masqué sur mobile (hidden sm:block) — cohérent avec le design existant.
 *
 * ⚠️  Ce composant est LOCAL à la route /occasions/[cat]/[slug].
 *     Ne pas partager avec /vehicules/[slug] (3 niveaux, structure fixe).
 *     Ne pas fusionner avec VehicleBreadcrumb — divergence intentionnelle.
 *
 * Props :
 *   categorySlug  — segment URL de la catégorie
 *   categoryLabel — libellé affiché (category.label ?? categorySlug depuis la page)
 *   vehicleName   — libellé du véhicule courant (niveau actif, non-lien)
 */

import Link from "next/link";

interface OccasionsBreadcrumbProps {
	categorySlug: string;
	/** Libellé résolu dans la page : category?.label ?? categorySlug */
	categoryLabel: string;
	vehicleName: string;
}

export default function OccasionsBreadcrumb({
	categorySlug,
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
