import Link from "next/link";
import { Wrench, Settings, Paintbrush, ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";
import { serviceRepository } from "@/lib/repositories";

const iconMap: Record<string, React.ElementType> = {
	wrench: Wrench,
	settings: Settings,
	paintbrush: Paintbrush,
};

const numMap: Record<string, string> = {
	entretien: "01",
	mecanique: "02",
	carrosserie: "03",
};

const reassuranceItems = [
	{
		label: "Depuis 2001",
		desc: "Plus de 20 ans au service des conducteurs de la région toulousaine.",
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		),
	},
	{
		label: "Spécialiste japonaises & boîtes auto",
		desc: "Toyota, Nissan, Honda, Suzuki, Mazda — boîte automatique incluse.",
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="7.5" cy="15.5" r="5.5" />
				<path d="M21 2L11.5 11.5" />
				<path d="M15.5 7.5l2 2" />
				<path d="M18.5 4.5l1 1" />
			</svg>
		),
	},
	{
		label: "Devis transparent avant intervention",
		desc: "Prix pièce et main-d'œuvre communiqué systématiquement avant tout travail.",
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				<polyline points="9 12 11 14 15 10" />
			</svg>
		),
	},
	{
		label: "98 % de clients satisfaits",
		desc: "Accueil avec ou sans rendez-vous, service fiable et bienveillant.",
		icon: (
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M8 14s1.5 2 4 2 4-2 4-2" />
				<line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" />
				<line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" />
			</svg>
		),
	},
];

export default async function ServicesOverview() {
	const services = await serviceRepository.getAll();
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
							<p className="section-subtitle mt-3 max-w-lg text-sm leading-relaxed">
								Depuis 2001, Vitor Mendonça et son équipe interviennent sur tous types de véhicules. Devis pièce et main-d&apos;œuvre systématique avant toute intervention, spécialistes des véhicules japonais et boîtes automatiques.
							</p>
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
					{services.filter((s) => s.is_active).map((service, i) => {
						const Icon = iconMap[service.icon] ?? Wrench;
						const num = numMap[service.slug] ?? String(i + 1).padStart(2, "0");
						return (
							<AnimateOnScroll key={service.id} delay={i * 90}>
								<Link
									href={`/services#${service.id}`}
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
											{service.title}
										</h3>

										{/* Description */}
										<p className="font-light text-[#64748b] text-[11px] leading-[1.65] mb-5">
											{service.short_description}
										</p>

										{/* Liste */}
										<ul className="space-y-1.5 mb-6 flex-1">
											{service.features.slice(0, 4).map((item) => (
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
						);
					})}
				</div>

				{/* ── Bande de réassurance ── */}
				<AnimateOnScroll>
					<div className="mt-14 bg-slate-100/70 rounded-2xl py-8 px-6 sm:px-10">
						<dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
							{reassuranceItems.map(({ label, desc, icon }) => (
								<div key={label} className="flex items-start gap-4">
									<div
										className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center ring-1 ring-brand-100 text-brand-600 flex-shrink-0"
										aria-hidden="true"
									>
										{icon}
									</div>
									<div>
										<dt className="font-medium text-[#0f172a] text-sm leading-snug">
											{label}
										</dt>
										<dd className="font-light text-[#64748b] text-xs leading-relaxed mt-1">
											{desc}
										</dd>
									</div>
								</div>
							))}
						</dl>
					</div>
				</AnimateOnScroll>
			</Container>
		</section>
	);
}
