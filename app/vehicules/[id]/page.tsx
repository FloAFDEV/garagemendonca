import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleCard from "@/components/vehicles/VehicleCard";
import {
	getVehicleById,
	getRelatedVehicles,
	getVehicleStaticParams,
} from "@/lib/vehicles";
import Image from "next/image";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";
import {
	ArrowLeft,
	Phone,
	MessageSquare,
	Calendar,
	Gauge,
	Fuel,
	Zap,
	Settings2,
	DoorOpen,
	Palette,
	Wind,
	CheckCircle2,
	ShieldCheck,
	RefreshCw,
	CreditCard,
	Star,
} from "lucide-react";

/* ─────────── types ─────────── */
interface PageProps {
	params: Promise<{ id: string }>;
}

/* ─────────── metadata ─────────── */
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params;
	const vehicle = await getVehicleById(id);
	if (!vehicle) return { title: "Véhicule introuvable" };

	const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.price.toLocaleString("fr-FR")} €`;
	const desc = `${vehicle.brand} ${vehicle.model} ${vehicle.year}, ${vehicle.mileage.toLocaleString("fr-FR")} km, ${vehicle.fuel}, ${vehicle.transmission}. ${vehicle.description.slice(0, 110)}… Garage Mendonça, Drémil-Lafage (31).`;

	return {
		title,
		description: desc,
		openGraph: {
			title,
			description: desc,
			images: [
				{
					url: vehicle.images[0],
					width: 1200,
					height: 630,
					alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
				},
			],
		},
	};
}

export async function generateStaticParams() {
	return getVehicleStaticParams();
}

/* ─────────── composant ─────────── */
export default async function VehicleDetailPage({ params }: PageProps) {
	const { id } = await params;
	const [vehicle, related] = await Promise.all([
		getVehicleById(id),
		getRelatedVehicles(id, 3),
	]);
	if (!vehicle) notFound();

	const isAvailable = vehicle.status !== "sold";
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const contactHref = `/contact?vehicule=${encodeURIComponent(vehicleName)}`;

	/* Infos clés */
	const specs = [
		{ Icon: Calendar, label: "Année", value: vehicle.year.toString() },
		{
			Icon: Gauge,
			label: "Kilométrage",
			value: `${vehicle.mileage.toLocaleString("fr-FR")} km`,
		},
		{ Icon: Fuel, label: "Carburant", value: vehicle.fuel },
		{ Icon: Settings2, label: "Boîte", value: vehicle.transmission },
		{ Icon: Zap, label: "Puissance", value: `${vehicle.power} ch` },
		{ Icon: DoorOpen, label: "Portes", value: `${vehicle.doors} portes` },
		{ Icon: Palette, label: "Couleur", value: vehicle.color },
		...(vehicle.critAir
			? [
					{
						Icon: Wind,
						label: "Crit'Air",
						value: `Vignette ${vehicle.critAir}`,
					},
				]
			: []),
	];

	/* Section confiance */
	const trustPoints = [
		{
			Icon: ShieldCheck,
			title: "Révisé & garanti",
			desc: "Contrôle en 160 points. Garantie 6 à 12 mois kilométrage illimité.",
		},
		{
			Icon: RefreshCw,
			title: "Reprise possible",
			desc: "Votre véhicule repris et estimé directement dans notre garage.",
		},
		{
			Icon: CreditCard,
			title: "Financement étudié",
			desc: "Solutions de financement adaptées, étudiées ensemble lors de votre visite.",
		},
	];

	/* JSON-LD */
	const jsonLdCar = {
		"@context": "https://schema.org",
		"@type": "Car",
		name: `${vehicle.brand} ${vehicle.model}`,
		brand: { "@type": "Brand", name: vehicle.brand },
		modelDate: vehicle.year.toString(),
		mileageFromOdometer: {
			"@type": "QuantitativeValue",
			value: vehicle.mileage,
			unitCode: "KMT",
		},
		fuelType: vehicle.fuel,
		vehicleTransmission: vehicle.transmission,
		numberOfDoors: vehicle.doors,
		color: vehicle.color,
		offers: {
			"@type": "Offer",
			priceCurrency: "EUR",
			price: vehicle.price,
			availability: isAvailable
				? "https://schema.org/InStock"
				: "https://schema.org/SoldOut",
			seller: { "@type": "AutoDealer", name: "Garage Auto Mendonça" },
		},
	};

	const jsonLdBreadcrumb = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Accueil",
				item: "https://garagemendonça.vercel.app/",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Occasions",
				item: "https://garagemendonça.vercel.app/vehicules",
			},
			{ "@type": "ListItem", position: 3, name: vehicleName },
		],
	};

	return (
		<MainLayout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLdBreadcrumb),
				}}
			/>

			<div className="bg-[#f8fafc] min-h-screen">
				<Container className="pt-28 pb-28 sm:pb-12">
					{/* ── Navigation ── */}
					<nav aria-label="Fil d'Ariane" className="mb-3">
						<ol className="flex items-center gap-2 text-xs text-[#64748b]">
							<li>
								<Link
									href="/"
									className="hover:text-brand-600 transition-colors"
								>
									Accueil
								</Link>
							</li>
							<li aria-hidden="true">/</li>
							<li>
								<Link
									href="/vehicules"
									className="hover:text-brand-600 transition-colors"
								>
									Occasions
								</Link>
							</li>
							<li aria-hidden="true">/</li>
							<li className="text-[#0f172a] font-medium truncate max-w-[200px]">
								{vehicleName}
							</li>
						</ol>
					</nav>

					<Link
						href="/vehicules"
						className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-brand-600 transition-colors mb-6 text-sm font-medium"
					>
						<ArrowLeft size={15} aria-hidden="true" />
						Retour aux véhicules
					</Link>

					{/* ── En-tête ── */}
					<div className="flex flex-wrap items-start justify-between gap-4 mb-8">
						<div className="flex items-start gap-4">
							{/* Logo marque */}
							{BRAND_LOGO_MAP[vehicle.brand] && (
								<div className="w-16 h-16 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex items-center justify-center">
									<Image
										src={BRAND_LOGO_MAP[vehicle.brand]}
										alt={vehicle.brand}
										width={48}
										height={48}
										className="object-contain w-full h-full"
									/>
								</div>
							)}
							<div>
								<div className="flex items-center gap-2 mb-2 flex-wrap">
									{vehicle.featured && (
										<span className="inline-flex items-center gap-1.5 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
											<Star
												size={11}
												aria-hidden="true"
											/>
											À la une
										</span>
									)}
									<span
										className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
											isAvailable
												? "bg-emerald-100 text-emerald-700"
												: "bg-slate-200 text-slate-500"
										}`}
									>
										<span
											className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`}
											aria-hidden="true"
										/>
										{isAvailable ? "Disponible" : "Vendu"}
									</span>
								</div>
								<h1 className="font-heading font-black text-[#0f172a] text-3xl md:text-4xl leading-tight">
									{vehicle.brand} {vehicle.model}
									{vehicle.features?.["Finition"] && (
										<span className="text-[#64748b] font-medium text-xl ml-2">
											{vehicle.features["Finition"]}
										</span>
									)}
								</h1>
								<p className="text-[#64748b] mt-1.5 text-sm">
									{vehicle.year} ·{" "}
									{vehicle.mileage.toLocaleString("fr-FR")} km
									· {vehicle.fuel} · {vehicle.transmission} ·{" "}
									{vehicle.power} ch
								</p>
							</div>
						</div>
						{/* Prix desktop */}
						<div className="hidden sm:block text-right">
							<div
								className="font-heading font-black text-4xl text-[#0f172a]"
								aria-label={`${vehicle.price.toLocaleString("fr-FR")} euros TTC`}
							>
								{vehicle.price.toLocaleString("fr-FR")}&nbsp;€
							</div>
							<p className="text-[#64748b] text-sm mt-0.5">
								Prix TTC · Financement disponible
							</p>
						</div>
					</div>

					{/* ── Layout principal ── */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
						{/* ════ Colonne gauche ════ */}
						<div className="space-y-6 min-w-0">
							{/* Galerie interactive */}
							<VehicleGallery
								images={vehicle.images}
								vehicleName={vehicleName}
							/>
							{/* Caractéristiques techniques */}
							{vehicle.features &&
								Object.keys(vehicle.features).length > 0 && (
									<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
										<h2 className="font-heading font-bold text-[#0f172a] text-xl mb-5">
											Caractéristiques techniques
										</h2>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
											{[
												{
													label: "Marque",
													value: vehicle.brand,
												},
												{
													label: "Modèle",
													value: vehicle.model,
												},
												{
													label: "Année",
													value: vehicle.year.toString(),
												},
												{
													label: "Kilométrage",
													value: `${vehicle.mileage.toLocaleString("fr-FR")} km`,
												},
												{
													label: "Carburant",
													value: vehicle.fuel,
												},
												{
													label: "Boîte",
													value: vehicle.transmission,
												},
												{
													label: "Puissance",
													value: `${vehicle.power} ch`,
												},
												{
													label: "Couleur",
													value: vehicle.color,
												},
												{
													label: "Portes",
													value: `${vehicle.doors} portes`,
												},
												...(vehicle.critAir
													? [
															{
																label: "Crit'Air",
																value: `Vignette ${vehicle.critAir}`,
															},
														]
													: []),
												...Object.entries(
													vehicle.features,
												).map(([label, value]) => ({
													label,
													value,
												})),
											].map(({ label, value }) => (
												<div
													key={label}
													className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0"
												>
													<span className="text-sm text-[#64748b]">
														{label}
													</span>
													<span className="text-sm font-semibold text-[#0f172a] text-right ml-4">
														{value}
													</span>
												</div>
											))}
										</div>
									</div>
								)}

							{/* Description */}
							<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
								<h2 className="font-heading font-bold text-[#0f172a] text-xl mb-4">
									Description
								</h2>
								<p className="text-[#475569] leading-relaxed text-[15px] max-w-2xl">
									{vehicle.description}
								</p>
								<ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
									{[
										"Contrôle technique à jour",
										"Carnet d'entretien vérifié",
										"Révision effectuée",
										"Garantie 6 à 12 mois km illimités",
										"Vérification 160 points",
										"250 à 500 km parcourus avant vente",
									].map((item) => (
										<li
											key={item}
											className="flex items-center gap-2.5 text-sm text-[#334155]"
										>
											<CheckCircle2
												size={15}
												className="text-emerald-500 flex-shrink-0"
												aria-hidden="true"
											/>
											{item}
										</li>
									))}
								</ul>
							</div>

							{/* Section confiance */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{trustPoints.map(({ Icon, title, desc }) => (
									<div
										key={title}
										className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3"
									>
										<div
											className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0"
											aria-hidden="true"
										>
											<Icon
												size={18}
												className="text-brand-600"
												aria-hidden="true"
											/>
										</div>
										<div>
											<h3 className="font-semibold text-[#0f172a] text-sm mb-1">
												{title}
											</h3>
											<p className="text-[#64748b] text-xs leading-relaxed">
												{desc}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* ════ Colonne droite sticky ──── */}
						<aside className="space-y-4 lg:sticky lg:top-24 self-start">
							{" "}
							{/* Carte prix + CTA */}
							<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
								{/* Prix (mobile uniquement — desktop affiché dans l'en-tête) */}
								<div className="sm:hidden mb-5 pb-5 border-b border-slate-100">
									<div
										className="font-heading font-black text-4xl text-[#0f172a]"
										aria-label={`${vehicle.price.toLocaleString("fr-FR")} euros TTC`}
									>
										{vehicle.price.toLocaleString("fr-FR")}{" "}
										€
									</div>
									<p className="text-[#64748b] text-sm mt-0.5">
										Prix TTC · Financement disponible
									</p>
								</div>

								{/* Résumé rapide */}
								<div className="grid grid-cols-3 gap-2 mb-5">
									{[
										{ label: "Année", value: vehicle.year },
										{
											label: "Km",
											value: `${Math.round(vehicle.mileage / 1000)}k`,
										},
										{
											label: "Énergie",
											value: vehicle.fuel,
										},
									].map(({ label, value }) => (
										<div
											key={label}
											className="text-center bg-[#f8fafc] rounded-xl py-3"
										>
											<div className="font-bold text-[#0f172a] text-sm leading-none mb-1">
												{value}
											</div>
											<div className="text-xs text-[#64748b]">
												{label}
											</div>
										</div>
									))}
								</div>

								{/* CTAs */}
								<div className="space-y-2.5">
									<a
										href="tel:0532002038"
										className="btn-primary w-full justify-center text-base py-3.5"
										aria-label="Appeler le garage pour ce véhicule"
									>
										<Phone size={17} aria-hidden="true" />
										05 32 00 20 38
									</a>
									<Link
										href={contactHref}
										className="btn-secondary w-full justify-center text-sm"
										aria-label={`Envoyer un message à propos du ${vehicleName}`}
									>
										<MessageSquare
											size={16}
											aria-hidden="true"
										/>
										Demander un renseignement
									</Link>
								</div>

								{/* Réassurances */}
								<ul className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
									{[
										"Essai possible sur rendez-vous",
										"Financement étudié ensemble",
										"Reprise de votre véhicule",
										"Accueil avec ou sans rendez-vous",
									].map((item) => (
										<li
											key={item}
											className="flex items-center gap-2 text-sm text-[#475569]"
										>
											<CheckCircle2
												size={14}
												className="text-brand-500 flex-shrink-0"
												aria-hidden="true"
											/>
											{item}
										</li>
									))}
								</ul>
							</div>
							{/* Adresse garage */}
							<div className="bg-[#0f172a] rounded-2xl p-5 text-white">
								<div className="text-xs text-brand-400 font-semibold uppercase tracking-widest mb-2">
									Garage Auto Mendonça
								</div>
								<p className="text-sm text-slate-300 leading-relaxed mb-4">
									6 Avenue de la Mouyssaguese
									<br />
									31280 Drémil-Lafage
									<br />
									Lun–Jeu 8h–19h · Ven 8h–18h
								</p>
								<a
									href="https://maps.google.com/maps?q=6+Avenue+de+la+Mouyssaguese,+31280+Drémil-Lafage"
									target="_blank"
									rel="noopener noreferrer"
									className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors"
									aria-label="Voir le garage sur Google Maps (nouvel onglet)"
								>
									Voir sur Google Maps →
								</a>
							</div>
						</aside>
					</div>

					{/* ── Véhicules similaires ── */}
					{related.length > 0 && (
						<section
							className="mt-16"
							aria-labelledby="similaires-title"
						>
							<div className="flex items-center justify-between mb-6">
								<h2
									id="similaires-title"
									className="font-heading font-bold text-[#0f172a] text-2xl"
								>
									Vous pourriez aussi aimer
								</h2>
								<Link
									href="/vehicules"
									className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
								>
									Voir tout le stock →
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{related.map((v) => (
									<VehicleCard key={v.id} vehicle={v} />
								))}
							</div>
						</section>
					)}
				</Container>
			</div>

			{/* ── CTA sticky mobile ── */}
			<div
				className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
				role="region"
				aria-label="Actions rapides"
			>
				<div className="flex-1 min-w-0">
					<p className="text-[10px] text-[#64748b] leading-none mb-0.5">
						Prix TTC
					</p>
					<p
						className="font-heading font-black text-xl text-[#0f172a] leading-none"
						aria-label={`${vehicle.price.toLocaleString("fr-FR")} euros`}
					>
						{vehicle.price.toLocaleString("fr-FR")} €
					</p>
				</div>
				<a
					href="tel:0532002038"
					className="btn-primary text-sm py-3 px-5 flex-shrink-0"
					aria-label="Appeler le garage"
				>
					<Phone size={15} aria-hidden="true" />
					Appeler
				</a>
				<Link
					href={contactHref}
					className="btn-secondary text-sm py-3 px-4 flex-shrink-0"
					aria-label="Envoyer un message"
				>
					<MessageSquare size={15} aria-hidden="true" />
					Message
				</Link>
			</div>
		</MainLayout>
	);
}
