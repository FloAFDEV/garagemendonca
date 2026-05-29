import type { Metadata } from "next";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import VehicleCard from "@/components/vehicles/VehicleCard";
import QualityControlTooltip from "@/components/ui/QualityControlTooltip";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { getActiveGarageId } from "@/lib/config/garage";
import { QUALITY_CONTROL } from "@/lib/data/qualityControl";
import { resolveVehicleHref } from "@/lib/utils/slug";
import {
	Car,
	ShieldCheck,
	Wrench,
	FileCheck2,
	BadgeCheck,
	Phone,
	ArrowRight,
	Star,
	Info,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Notre offre — Véhicules d'occasion révisés et garantis",
	description:
		"Véhicules d'occasion soigneusement sélectionnés, inspectés en 160 points, révisés et garantis 6 à 12 mois. Japonaises, boîtes automatiques. Garage Mendonca à Drémil-Lafage (31).",
	alternates: {
		canonical: "https://www.garagemendonca.com/produit",
	},
	openGraph: {
		title: "Notre offre — Véhicules d'occasion · Garage Auto Mendonca",
		description:
			"Sélection VO révisée et garantie. Inspection 160 points, japonaises, boîtes automatiques. Financement et reprise étudiés.",
		type: "website",
		locale: "fr_FR",
		url: "https://www.garagemendonca.com/produit",
		siteName: "Garage Auto Mendonca",
		images: [
			{
				url: "/images/og-image.webp",
				width: 1200,
				height: 630,
				alt: "Véhicules d'occasion Garage Mendonca",
			},
		],
	},
};

const FIVE_STARS = [0, 1, 2, 3, 4] as const;
const GARAGE_ID = getActiveGarageId();
const BASE_URL = "https://www.garagemendonca.com";

// Badges de garantie — le badge "160 points" est rendu interactif dans JSX
const guarantees = [
	{
		id: "garantie",
		Icon: ShieldCheck,
		title: "Garantie incluse",
		desc: "6 à 12 mois kilométrage illimité sur chaque véhicule.",
		interactive: false,
	},
	{
		id: "revision",
		Icon: Wrench,
		title: "Révision complète",
		desc: "Chaque véhicule est entièrement révisé avant mise en vente.",
		interactive: false,
	},
	{
		id: "carnet",
		Icon: FileCheck2,
		title: "Carnet d'entretien",
		desc: "Historique d'entretien vérifié et transparent.",
		interactive: false,
	},
	{
		id: "controle",
		Icon: BadgeCheck,
		title: `${QUALITY_CONTROL.total} points de contrôle`,
		desc: "CT standard + charte qualité interne Garage Mendonça.",
		interactive: true,
	},
] as const;

export default async function ProduitPage() {
	// FeaturedVehicles gère son propre fetch (4 véhicules, source unique).
	// Ici on charge uniquement les non-featured pour la section "Autres véhicules".
	const allRecent = await vehicleDb
		.listPaginated(GARAGE_ID, 1, 8, {})
		.catch(() => []);
	const rest = allRecent.filter((v) => !v.featured).slice(0, 3);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Notre offre — Véhicules d'occasion · Garage Mendonça",
		description:
			"Sélection de véhicules d'occasion inspectés en 160 points, révisés et garantis",
		url: `${BASE_URL}/produit`,
		itemListElement: rest.map((v, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${BASE_URL}${resolveVehicleHref(v)}`,
			name: `${v.brand} ${v.model} ${v.year}`,
		})),
	};

	return (
		<MainLayout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
			/>

			{/* ── Hero ── */}
			<section className="relative bg-[#0f172a] pt-36 pb-24 overflow-hidden">
				<div
					className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl pointer-events-none"
					aria-hidden="true"
				/>
				<Container className="relative">
					<div className="max-w-3xl">
						<div className="flex items-center gap-3 mb-6">
							<div
								className="w-8 h-px bg-brand-500"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-normal text-xs uppercase tracking-caps">
								Nos véhicules d'occasion
							</span>
						</div>
						<h1 className="ty-display text-white text-5xl md:text-6xl mb-6">
							Occasion de qualité,{" "}
							<span className="text-brand-500">garantie incluse</span>
						</h1>
						<p className="text-slate-300 text-xl leading-relaxed max-w-2xl mb-4">
							Chaque véhicule est inspecté selon{" "}
							<QualityControlTooltip variant="inline" triggerClassName="text-white hover:text-brand-400 transition-colors font-medium">
								{QUALITY_CONTROL.total} points de contrôle
							</QualityControlTooltip>
							, révisé par nos mécaniciens et garanti. Financement
							et reprise étudiés ensemble.
						</p>
						<p className="text-slate-400 text-sm leading-relaxed max-w-xl mb-10">
							Notre protocole va au-delà du contrôle technique
							standard&nbsp;: nous y ajoutons une charte qualité
							interne qui couvre le confort, les équipements
							électroniques et les finitions.
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<Link
								href="/vehicules"
								className="btn-primary text-base py-4 px-8"
							>
								<Car size={18} aria-hidden="true" />
								Voir tout le stock
							</Link>
							<a
								href="tel:0532002038"
								className="btn-outline text-base py-4 px-8"
							>
								<Phone size={18} aria-hidden="true" />
								Nous contacter
							</a>
						</div>
					</div>
				</Container>
			</section>

			{/* ── Badges garanties ── */}
			<section className="py-16 bg-white border-b border-slate-200">
				<Container>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{guarantees.map(({ id, Icon, title, desc, interactive }) => {
							const card = (
								<div className="text-center">
									<div
										className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${
											interactive
												? "bg-brand-500 border border-brand-600 group-hover:bg-brand-600"
												: "bg-brand-50 border border-brand-100"
										}`}
										aria-hidden="true"
									>
										<Icon
											className={`h-5 w-5 ${interactive ? "text-white" : "text-brand-500"}`}
											strokeWidth={1.75}
										/>
									</div>
									<h3 className="ty-subheading text-[#0f172a] text-sm mb-1 flex items-center justify-center gap-1.5 flex-wrap">
										{title}
										{interactive && (
											<Info
												size={12}
												className="text-brand-400 flex-shrink-0"
												aria-hidden="true"
											/>
										)}
									</h3>
									<p className="text-[#475569] text-xs leading-relaxed">
										{desc}
									</p>
								</div>
							);

							if (interactive) {
								return (
									<QualityControlTooltip
										key={id}
										triggerClassName="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl"
									>
										{card}
									</QualityControlTooltip>
								);
							}

							return <div key={id}>{card}</div>;
						})}
					</div>
				</Container>
			</section>

			{/* ── Véhicules à la une — même composant que la homepage ── */}
			<FeaturedVehicles />

			{/* ── Autres véhicules ── */}
			{rest.length > 0 && (
				<section className="py-20 bg-white">
					<Container>
						<div className="flex items-end justify-between mb-10">
							<div>
								<div className="section-divider" />
								<span className="eyebrow">
									Disponibles maintenant
								</span>
								<h2 className="section-title">
									Autres véhicules
								</h2>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
							{rest.map((vehicle) => (
								<VehicleCard key={vehicle.id} vehicle={vehicle} />
							))}
						</div>

						<div className="text-center">
							<Link
								href="/vehicules"
								className="btn-primary text-base px-10 py-4"
							>
								<Car size={18} aria-hidden="true" />
								Voir tous les véhicules
							</Link>
						</div>
					</Container>
				</section>
			)}

			{/* ── Chiffres clés ── */}
			<section className="py-16 bg-[#f8fafc] border-t border-slate-200">
				<Container>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto">
						{[
							{ value: "30+", label: "Ans d'expérience" },
							{ value: "+1 200", label: "Véhicules vendus" },
							{ value: "98%", label: "Clients satisfaits" },
							{ value: "9", label: "Véhicules de prêt" },
						].map(({ value, label }) => (
							<div key={label}>
								<div className="ty-display font-heading text-4xl text-brand-500 mb-1">
									{value}
								</div>
								<div className="text-[#475569] text-sm">
									{label}
								</div>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── Avis clients ── */}
			<section className="py-16 bg-white">
				<Container>
					<div className="max-w-2xl mx-auto text-center mb-10">
						<div className="section-divider mx-auto" />
						<span className="eyebrow">Ils nous font confiance</span>
						<h2 className="section-title">
							Ce que disent nos clients
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						{[
							{
								name: "Thomas R.",
								note: "Achat d'une Volkswagen Golf. Véhicule impeccable, révision faite, garantie 12 mois. Je recommande vivement !",
							},
							{
								name: "Marie-Claire D.",
								note: "Service au top, transparent sur les prix. La voiture était comme neuve. Merci à toute l'équipe !",
							},
							{
								name: "Karim B.",
								note: "Troisième véhicule acheté ici. Toujours aussi sérieux. Financement rapide et sans surprise.",
							},
						].map(({ name, note }) => (
							<div
								key={name}
								className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6 shadow-sm"
							>
								<div
									className="flex gap-0.5 mb-3"
									aria-label="5 étoiles sur 5"
								>
									{FIVE_STARS.map((i) => (
										<Star
											key={i}
											size={14}
											className="text-brand-500 fill-brand-500"
											aria-hidden="true"
										/>
									))}
								</div>
								<p className="text-[#475569] text-sm leading-relaxed mb-4">
									"{note}"
								</p>
								<p className="ty-subheading text-[#0f172a] text-sm">
									{name}
								</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── CTA final ── */}
			<section className="py-16 bg-[#0f172a] relative">
				<div
					className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600"
					aria-hidden="true"
				/>
				<Container className="text-center">
					<h2 className="ty-display text-white text-3xl md:text-4xl mb-4">
						Un véhicule vous intéresse ?
					</h2>
					<p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
						Contactez-nous pour un essai, un financement ou une reprise.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a
							href="tel:0532002038"
							className="btn-primary text-base py-4 px-8"
						>
							<Phone size={18} aria-hidden="true" />
							05 32 00 20 38
						</a>
						<Link
							href="/contact"
							className="btn-outline text-base py-4 px-8"
						>
							Demander des infos
							<ArrowRight size={17} aria-hidden="true" />
						</Link>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
