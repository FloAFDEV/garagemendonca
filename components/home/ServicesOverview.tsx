import Link from "next/link";
import { Wrench, Settings, Paintbrush, ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";

const services = [
	{
		id: "entretien",
		num: "01",
		Icon: Wrench,
		title: "Entretien & Révision",
		description:
			"Service de proximité pour tous véhicules toutes marques. Préconisations constructeur toujours respectées.",
		items: [
			"Révision garantie constructeur",
			"Pneus, clim & amortisseurs",
			"Contrôle technique",
			"Courroie de distribution",
		],
	},
	{
		id: "mecanique",
		num: "02",
		Icon: Settings,
		title: "Mécanique & Électronique",
		description:
			"Spécialiste véhicules japonais et boîtes automatiques. Réparation électronique à coût maîtrisé, devis avant intervention.",
		items: [
			"Spécialiste japonaises",
			"Moteur, embrayage, boîte auto",
			"Réparation pièces électro.",
			"Devis pièce & main-d'œuvre",
		],
	},
	{
		id: "carrosserie",
		num: "04",
		Icon: Paintbrush,
		title: "Carrosserie & Vitrage",
		description:
			"Nouvelle cabine de peinture. Tôlerie, collision, pare-brise toutes marques. Véhicule de courtoisie inclus.",
		items: [
			"Nouvelle cabine de peinture",
			"Pare-brise & lunette arrière",
			"Véhicule de courtoisie",
			"Dossier assurance inclus",
		],
	},
];

export default function ServicesOverview() {
	return (
		<section className="py-28 bg-[#f8fafc]">
			<Container>
				{/* ── Header ── */}
				<AnimateOnScroll>
					<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
						<div>
							<div className="section-divider" />
							<span className="eyebrow">Ce que nous faisons</span>
							<h2 className="section-title max-w-lg">
								Spécialistes de la mécanique,
								<br />
								la carrosserie et la vente
							</h2>
						</div>
						<Link
							href="/services"
							className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-normal transition-colors mt-6 lg:mt-0 group text-sm focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
						>
							Tous nos services en détail
							<ArrowRight
								size={14}
								className="group-hover:translate-x-1 transition-transform"
							/>
						</Link>
					</div>
				</AnimateOnScroll>

				{/* ── Grille cartes ── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
					{services.map(
						({ id, num, Icon, title, description, items }, i) => (
							<AnimateOnScroll key={id} delay={i * 90}>
								<Link
									href={`/services#${id}`}
									className="group relative bg-white rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
								>
									{/* Filigrane numéro — décoratif */}
									<span
										className="absolute top-2 right-4 font-heading font-light text-6xl text-slate-50 select-none z-0 group-hover:text-brand-50/80 transition-colors pointer-events-none tracking-tight"
										aria-hidden="true"
									>
										{num}
									</span>

									<div className="relative z-10 flex flex-col h-full">
										{/* Icône */}
										<div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center mb-4 ring-1 ring-brand-100 group-hover:bg-brand-100 transition-all duration-200 flex-shrink-0">
											<Icon
												size={16}
												className="text-brand-500"
												strokeWidth={1.5}
											/>
										</div>

										{/* Trait */}
										<div
											className="w-8 h-px bg-brand-500 mb-4"
											aria-hidden="true"
										/>

										{/* Titre */}
										<h3 className="ty-subheading text-[#0f172a] text-sm mb-2 leading-snug pr-8">
											{title}
										</h3>

										{/* Description */}
										<p className="font-light text-[#64748b] text-[11px] leading-[1.65] mb-5">
											{description}
										</p>

										{/* Liste */}
										<ul className="space-y-1.5 mb-6 flex-1">
											{items.map((item) => (
												<li
													key={item}
													className="flex items-center gap-2 text-[11px] font-light text-[#64748b]"
												>
													<span className="w-1 h-1 bg-brand-500/70 rounded-full flex-shrink-0" />
													{item}
												</li>
											))}
										</ul>

										{/* CTA */}
										<div className="flex items-center gap-1.5 text-[11px] font-normal text-slate-400 group-hover:text-brand-500 transition-all duration-200 group-hover:gap-2">
											En savoir plus
											<ArrowRight size={11} />
										</div>
									</div>
								</Link>
							</AnimateOnScroll>
						),
					)}
				</div>
			</Container>
		</section>
	);
}
