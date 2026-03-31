import Link from "next/link";
import { Phone } from "lucide-react";

interface Props {
	cta_label: string;
	cta_url: string;
	phone: string;
}

export default function ServiceCTA({ cta_label, cta_url, phone }: Props) {
	// Nettoyer le numéro pour l'attribut href
	const phoneHref = `tel:${phone.replace(/\s/g, "")}`;

	return (
		<div className="bg-brand-500 rounded-2xl px-8 py-10 text-center">
			<h3 className="ty-heading text-xl sm:text-2xl text-white mb-2">
				Besoin d&apos;un devis ?
			</h3>
			<p className="text-brand-50 text-sm mb-8">
				Réponse sous 24h · Devis gratuit · Sans engagement
			</p>
			<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
				<a
					href={phoneHref}
					className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-brand-600 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
				>
					<Phone size={15} aria-hidden="true" />
					{phone}
				</a>
				<Link
					href={cta_url}
					className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/40 text-white text-sm font-normal hover:bg-white/10 transition-colors"
				>
					{cta_label}
				</Link>
			</div>
		</div>
	);
}
