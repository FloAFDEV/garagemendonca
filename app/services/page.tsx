import type { Metadata } from "next";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import { serviceRepository } from "@/lib/repositories";
import {
	Wrench,
	Settings,
	Paintbrush,
	CircuitBoard,
	CircleCheck,
	Phone,
	ArrowRight,
	ClipboardCheck,
	Car,
	Shield,
	Award,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Nos Services",
	description:
		"Mécanique, carrosserie, diagnostic et entretien à Drémil-Lafage (31). Spécialiste japonaises et boîte automatique depuis 2001. Jeunes conducteurs, seniors, PMR bienvenus. Diagnostic OBD en 10 min, devis gratuit.",
};

const iconMap: Record<string, React.ReactNode> = {
	wrench: <Wrench className="h-6 w-6 text-brand-500" aria-hidden="true" />,
	settings: (
		<Settings className="h-6 w-6 text-brand-500" aria-hidden="true" />
	),
	cpu: <CircuitBoard className="h-6 w-6 text-brand-500" aria-hidden="true" />,
	paintbrush: (
		<Paintbrush className="h-6 w-6 text-brand-500" aria-hidden="true" />
	),
};

const trustCards = [
	{
		Icon: ClipboardCheck,
		title: "Devis gratuit",
		sub: "Pièce & main-d'œuvre avant intervention",
	},
	{
		Icon: Car,
		title: "Spécialiste japonaises",
		sub: "Jeunes conducteurs · Seniors · Équipementier PMR",
	},
	{
		Icon: Shield,
		title: "Garantie",
		sub: "6 à 12 mois km illimités (Occasions)",
	},
	{
		Icon: Award,
		title: "160 points",
		sub: "De contrôle sur chaque véhicule",
	},
];

export default async function ServicesPage() {
	const services = await serviceRepository.getAll();
	return (
		<MainLayout>
			{/* ── Hero ── */}
			<section className="relative bg-dark-900 overflow-hidden pt-36 pb-20 ">
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none" />
				<Container className="relative">
					<div className="inline-flex items-center gap-2 mt-8 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-5">
						<span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
						<span className="text-brand-500 text-xs font-medium tracking-wide uppercase">
							Nos expertises
						</span>
					</div>
					<h1 className="ty-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
						Mécanique, carrosserie &amp; vente
						<br />
						<span className="text-brand-400">
							depuis 2001 à Drémil-Lafage
						</span>
					</h1>
					<p className="text-dark-300 text-base sm:text-lg leading-relaxed max-w-2xl">
						Mécaniciens qualifiés et continuellement formés,
						équipements dernière génération. Diagnostic en 10
						minutes, devis avant toute intervention.
					</p>
				</Container>
			</section>

			{/* ── Services ── */}
			<section className="py-20 bg-slate-50">
				<Container>
					<div className="space-y-12">
						{services.map((service, index) => {
							// Si index est impair (1, 3...), on met l'image à droite sur desktop
							const isImageRight = index % 2 !== 0;

							return (
								<div
									key={service.id}
									id={service.id}
									className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-brand-500/30 hover:shadow-2xl transition-all duration-500 scroll-mt-24"
								>
									{/* CHANGEMENT ICI : grid-cols-3 au lieu de grid-cols-2 */}
									<div className="grid grid-cols-1 lg:grid-cols-3">
										{/* Image Panel : Prend 1 col sur 3 (col-span-1) */}
										<div
											className={`relative min-h-[280px] lg:min-h-0 overflow-hidden lg:col-span-1 ${isImageRight ? "lg:order-last" : ""}`}
										>
											<Image
												src={service.images.find((i) => i.is_primary)?.url ?? service.images[0]?.url ?? ""}
												alt={service.images.find((i) => i.is_primary)?.alt ?? service.title}
												fill
												className="object-cover transition-transform duration-700 group-hover:scale-105"
												sizes="(max-width: 1024px) 100vw, 33vw" // Mise à jour de sizes pour l'optimisation
											/>
											<div className="absolute inset-0 bg-dark-900/10 group-hover:bg-transparent transition-colors duration-500" />
										</div>

										{/* Content Panel : Prend 2 cols sur 3 (lg:col-span-2) */}
										<div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative lg:col-span-2">
											{/* Icône */}
											<div className="h-14 w-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
												{iconMap[service.icon]}
											</div>

											{/* Titre */}
											<h2 className="ty-heading text-2xl sm:text-3xl text-slate-900 mb-4">
												{service.title}
											</h2>

											{/* Description */}
											<p className="text-slate-500 leading-relaxed mb-8 text-sm sm:text-base">
												{service.long_description}
											</p>

											{/* Features */}
											<div className="space-y-4 mb-10">
												<h3 className="ty-label text-brand-600">
													Prestations incluses
												</h3>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													{service.features.map(
														(feature) => (
															<div
																key={feature}
																className="flex items-start gap-3"
															>
																<CircleCheck className="h-5 w-5 text-brand-500 flex-shrink-0" />
																<span className="text-sm text-slate-700 leading-snug">
																	{feature}
																</span>
															</div>
														),
													)}
												</div>
											</div>

											{/* CTA */}
											<a
												href="tel:0532002038"
												className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-brand-500 text-white text-sm font-normal hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 w-fit"
											>
												<Phone className="h-4 w-4" />
												Demander un devis
											</a>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</Container>
			</section>

			{/* ── Trust Cards ── */}
			<section className="py-20 bg-dark-900">
				<Container>
					<div className="text-center mb-12">
						<h2 className="ty-heading text-2xl sm:text-3xl text-white">
							Pourquoi nous faire confiance&nbsp;?
						</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{trustCards.map(({ Icon, title, sub }) => (
							<div
								key={title}
								className="rounded-2xl border border-dark-700 bg-dark-800 p-8 hover:border-brand-500/50 transition-colors"
							>
								<Icon className="h-8 w-8 text-brand-500 mb-4" />
								<h3 className="ty-subheading text-white mb-2">
									{title}
								</h3>
								<p className="text-sm text-dark-400 leading-relaxed">
									{sub}
								</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── Final CTA ── */}
			<section className="py-20 bg-brand-500">
				<Container className="text-center text-white">
					<h2 className="ty-heading text-3xl md:text-4xl mb-6 text-white">
						Un problème mécanique ou de carrosserie ?
					</h2>
					<p className="text-brand-50 text-lg mb-10 max-w-2xl mx-auto">
						Nos experts sont à votre disposition pour un diagnostic
						rapide à Drémil-Lafage.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<a
							href="tel:0532002038"
							className="px-8 py-4 bg-white text-brand-600 rounded-xl font-normal hover:bg-slate-50 transition-colors"
						>
							Nous contacter
						</a>
						<Link
							href="/contact"
							className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-normal hover:bg-white/10 transition-colors"
						>
							Nous contacter par email
						</Link>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
