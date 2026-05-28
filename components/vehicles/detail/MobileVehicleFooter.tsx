/**
 * MobileVehicleFooter — Barre de conversion sticky mobile en bas d'écran.
 *
 * Visible uniquement en dessous du breakpoint sm (sm:hidden).
 * Server Component — pas d'état client.
 *
 * ⚠️  Masquée sur desktop — ne pas retirer sm:hidden sans audit responsive.
 *     Safe-area inset préservé pour les appareils iOS avec barre système.
 */

import { Phone, MessageSquare } from "lucide-react";

interface MobileVehicleFooterProps {
	/** Prix brut en euros — formaté en fr-FR dans ce composant (UI layer). */
	price: number;
	year: number;
	mileage: number;
	/** Valeur brute de la garantie (ex. "12 mois") — affichée si présente. */
	garantie?: string | null;
}

export default function MobileVehicleFooter({ price, year, mileage, garantie }: MobileVehicleFooterProps) {
	return (
		<div
			className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 pt-2.5 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]"
			style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
		>
			<div className="flex-1 min-w-0">
				<p className="ty-value font-heading text-xl leading-none tabular-nums">{price.toLocaleString("fr-FR")} €</p>
				<p className="text-xs text-slate-500 mt-1 tabular-nums leading-none truncate">
					{year} · {mileage.toLocaleString("fr-FR")} km{garantie ? ` · ${garantie}` : ""}
				</p>
			</div>
			<a href="tel:0532002038" className="btn-primary py-3 px-5 shadow-md shadow-brand-500/20 shrink-0"><Phone size={18} /></a>
			<a href="#contact-vehicule" className="btn-secondary py-3 px-4 shrink-0"><MessageSquare size={18} /></a>
		</div>
	);
}
