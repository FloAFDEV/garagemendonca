import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { getActiveGarageId } from "@/lib/config/garage";

export const metadata: Metadata = {
	title: "Occasions — Véhicules d'occasion à Drémil-Lafage (31)",
	description:
		"Catalogue complet de véhicules d'occasion révisés et garantis — Garage Mendonca à Drémil-Lafage. Voitures, utilitaires, japonaises, boîtes automatiques. Inspection 160 points, garantie 6 à 12 mois.",
	alternates: { canonical: "https://www.garagemendonca.com/occasions" },
	openGraph: {
		title: "Occasions — Garage Auto Mendonca · Drémil-Lafage",
		description:
			"Toutes nos occasions : voitures, utilitaires, japonaises, boîtes automatiques. Révisées, garanties, inspectées en 160 points.",
		type: "website",
		locale: "fr_FR",
		url: "https://www.garagemendonca.com/occasions",
		siteName: "Garage Auto Mendonca",
		images: [{ url: "/images/og-image.webp", width: 1200, height: 630, alt: "Occasions Garage Mendonca" }],
	},
};

const GARAGE_ID = getActiveGarageId();
const BASE_URL  = "https://www.garagemendonca.com";

// Couleurs par défaut si la catégorie n'en a pas
const DEFAULT_COLORS = [
	"#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6",
];

export default async function OccasionsPage() {
	const [categories, totalCount] = await Promise.all([
		vehicleCategoryRepository.getAll(GARAGE_ID).catch(() => []),
		vehicleDb.countPublic(GARAGE_ID).catch(() => 0),
	]);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type":    "ItemList",
		name:       "Véhicules d'occasion — Garage Mendonça",
		url:        `${BASE_URL}/occasions`,
		description: "Catalogue de véhicules d'occasion révisés et garantis par catégorie",
		itemListElement: categories.map((cat, i) => ({
			"@type":    "ListItem",
			position:  i + 1,
			url:        `${BASE_URL}/occasions/${cat.slug}`,
			name:       cat.label,
		})),
	};

	return (
		<MainLayout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* ── Hero ── */}
			<section className="bg-[#0f172a] pt-24 pb-14 relative overflow-hidden">
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
				<Container className="relative">
					<nav aria-label="Fil d'Ariane" className="mb-6">
						<ol className="flex items-center gap-2 text-xs text-slate-400">
							<li><Link href="/" className="hover:text-brand-400 transition-colors">Accueil</Link></li>
							<li aria-hidden="true">/</li>
							<li className="text-white font-medium">Occasions</li>
						</ol>
					</nav>
					<div className="max-w-2xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-px bg-brand-500" aria-hidden="true" />
							<span className="text-brand-400 text-xs uppercase tracking-caps font-normal">
								Notre stock · {totalCount} véhicule{totalCount !== 1 ? "s" : ""}
							</span>
						</div>
						<h1 className="ty-display text-white text-4xl sm:text-5xl md:text-6xl mb-5">
							Véhicules d'occasion{" "}
							<span className="text-brand-500">révisés &amp; garantis</span>
						</h1>
						<p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
							Chaque véhicule est inspecté en 160 points, révisé par nos mécaniciens
							et garanti 6 à 12 mois. Japonaises, boîtes automatiques, financement
							et reprise étudiés.
						</p>
						<Link href="/vehicules" className="btn-primary text-base py-3.5 px-8 inline-flex items-center gap-2">
							<Car size={17} aria-hidden="true" />
							Voir tout le stock
						</Link>
					</div>
				</Container>
			</section>

			{/* ── Catégories — masquées si une seule catégorie active ── */}
			{categories.length > 1 && (
				<section className="py-16 bg-white border-b border-slate-100">
					<Container>
						<div className="mb-8">
							<div className="section-divider" />
							<span className="eyebrow">Parcourir par type</span>
							<h2 className="section-title">
								Nos <span className="text-brand-500">catégories</span>
							</h2>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
							{categories.map((cat, i) => {
								const color = cat.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
								return (
									<Link
										key={cat.slug}
										href={`/occasions/${cat.slug}`}
										className="group flex flex-col items-center text-center p-5 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:border-brand-200 hover:bg-white hover:shadow-md transition-all duration-200"
									>
										{cat.icon ? (
											<span
												className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200"
												aria-hidden="true"
											>
												{cat.icon}
											</span>
										) : (
											<span
												className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"
												style={{ backgroundColor: `${color}18`, color }}
												aria-hidden="true"
											>
												<Car size={18} />
											</span>
										)}
										<span className="font-heading font-semibold text-[#0f172a] text-sm group-hover:text-brand-600 transition-colors">
											{cat.label}
										</span>
										{cat.description && (
											<span className="text-slate-400 text-xs mt-1 leading-snug line-clamp-2">
												{cat.description}
											</span>
										)}
										<span className="mt-3 inline-flex items-center gap-1 text-brand-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
											Voir
											<ArrowRight size={11} />
										</span>
									</Link>
								);
							})}
						</div>
					</Container>
				</section>
			)}

			{/* ── Véhicules en vedette ── */}
			<FeaturedVehicles />

			{/* ── CTA ── */}
			<section className="py-14 bg-[#0f172a] relative">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />
				<Container className="text-center">
					<h2 className="ty-display text-white text-3xl md:text-4xl mb-4">
						Une question sur un véhicule ?
					</h2>
					<p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
						Contactez-nous pour un essai, un financement ou une reprise. Réponse sous 24h.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="tel:0532002038" className="btn-primary text-base py-4 px-8">
							05 32 00 20 38
						</a>
						<Link href="/contact" className="btn-outline text-base py-4 px-8">
							Demander des infos
							<ArrowRight size={17} aria-hidden="true" />
						</Link>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
