import type { ServicePricing } from "@/types";

interface Props {
	pricing: ServicePricing[];
}

function isSurDevis(price: string): boolean {
	return price === "Sur devis" || price.includes("Sur devis");
}

export default function ServicePricingBlock({ pricing }: Props) {
	if (pricing.length === 0) return null;

	return (
		<div>
			<h3 className="ty-label text-brand-600 mb-5">Tarifs indicatifs</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{pricing.map((item) => (
					<div
						key={item.label}
						className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-1.5"
					>
						<span className="text-xs text-slate-500 leading-snug">
							{item.label}
						</span>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm font-semibold text-slate-900">
								{item.price}
							</span>
							{isSurDevis(item.price) && (
								<span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
									Sur devis
								</span>
							)}
						</div>
						{item.note && (
							<span className="text-[11px] text-slate-400 leading-snug">
								{item.note}
							</span>
						)}
					</div>
				))}
			</div>
			<p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
				Tarifs indicatifs TTC. Devis gratuit et sans engagement avant toute
				intervention.
			</p>
		</div>
	);
}
