// Toujours rendu dynamiquement → voit les modifications admin en temps réel
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { vehicleRepository } from "@/lib/repositories";
import Image from "next/image";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";
import VehicleOptionsDisplay from "@/components/vehicles/VehicleOptionsDisplay";
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

/* ─────────── carnet d'entretien parser ─────────── */
const CARNET_LINE_RE =
	/^\s*-?\s*(\d{2}\/\d{2}\/\d{4})\s*:\s*([\d\s]+km)\s*$/;

type DescSegment =
	| { kind: "text"; text: string }
	| { kind: "carnet"; rows: Array<{ date: string; km: string }> };

function parseDescription(raw: string): DescSegment[] {
	const lines = raw.split("\n");
	const segments: DescSegment[] = [];
	let textLines: string[] = [];
	let carnetRows: Array<{ date: string; km: string }> = [];

	const flushText = () => {
		if (textLines.length) {
			segments.push({ kind: "text", text: textLines.join("\n") });
			textLines = [];
		}
	};
	const flushCarnet = () => {
		if (carnetRows.length) {
			segments.push({ kind: "carnet", rows: carnetRows });
			carnetRows = [];
		}
	};

	for (const line of lines) {
		const m = line.match(CARNET_LINE_RE);
		if (m) {
			flushText();
			carnetRows.push({ date: m[1], km: m[2].trim() });
		} else {
			flushCarnet();
			textLines.push(line);
		}
	}
	flushCarnet();
	flushText();
	return segments;
}

function DescriptionRenderer({ text }: { text: string }) {
	const segments = parseDescription(text);
	const hasCarnet = segments.some((s) => s.kind === "carnet");

	if (!hasCarnet) {
		return (
			<p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
				{text}
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{segments.map((seg, i) => {
				if (seg.kind === "text") {
					if (!seg.text.trim()) return null;
					return (
						<p
							key={i}
							className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-line"
						>
							{seg.text}
						</p>
					);
				}
				return (
					<div
						key={i}
						className="overflow-x-auto rounded-xl border border-slate-100"
					>
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-100">
									<th className="text-left py-2.5 px-4 text-[10px] uppercase tracking-widest font-medium text-slate-400">
										Date
									</th>
									<th className="text-left py-2.5 px-4 text-[10px] uppercase tracking-widest font-medium text-slate-400">
										Kilométrage
									</th>
								</tr>
							</thead>
							<tbody>
								{seg.rows.map((row) => (
									<tr
										key={row.date}
										className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
									>
										<td className="py-2.5 px-4 text-slate-600">
											{row.date}
										</td>
										<td className="py-2.5 px-4 text-slate-700 font-medium">
											{row.km}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				);
			})}
		</div>
	);
}

/* ─────────── types ─────────── */
interface PageProps {
	params: Promise<{ id: string }>;
}

/* ─────────── metadata ─────────── */
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params;
	const vehicle = await vehicleRepository.getById(id);
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
	return vehicleRepository.getStaticParams();
}

/* ─────────── composant ─────────── */
export default async function VehicleDetailPage({ params }: PageProps) {
	const { id } = await params;
	const [vehicle, related] = await Promise.all([
		vehicleRepository.getById(id),
		vehicleRepository.getRelated(id, 3),
	]);
	if (!vehicle) notFound();

	const isAvailable = vehicle.status !== "sold";
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const contactHref = `/contact?vehicule=${encodeURIComponent(vehicleName)}`;

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

	return (
		<MainLayout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }}
			/>

			<div className="bg-[#f8fafc] min-h-screen">
				<Container className="pt-28 pb-28 sm:pb-12 mt-8">
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
						Retour aux annonces
					</Link>

					{/* ── En-tête ── */}
					<div className="flex flex-wrap items-start justify-between gap-4 mb-8">
						<div className="flex items-start gap-4">
							{BRAND_LOGO_MAP[vehicle.brand] && (
								<div className="w-16 h-16 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex items-center justify-center">
									<Image
										src={BRAND_LOGO_MAP[vehicle.brand]}
										alt={vehicle.brand}
										width={48}
										height={48}
										className="object-contain"
									/>
								</div>
							)}
							<div>
								<div className="flex items-center gap-2 mb-2">
									{vehicle.featured && (
										<span className="inline-flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-full">
											<Star
												size={11}
												fill="currentColor"
											/>{" "}
											À la une
										</span>
									)}
									<span
										className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
									>
										<span
											className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`}
										/>
										{isAvailable ? "Disponible" : "Vendue"}
									</span>
								</div>
								<h1 className="ty-heading text-[#0f172a] text-3xl md:text-4xl leading-tight">
									{vehicle.brand} {vehicle.model}
									{vehicle.features?.["Finition"] && (
										<span className="text-slate-400 font-medium text-xl ml-2">
											{" — "}
											{vehicle.features["Finition"]}
										</span>
									)}
								</h1>
							</div>
						</div>
						<div className="hidden text-right">
							<div className="ty-value font-heading text-4xl">
								{vehicle.price.toLocaleString("fr-FR")} €
							</div>
							<p className="text-slate-400 text-sm mt-0.5 font-medium">
								Prix TTC · Révisé & Garanti
							</p>
						</div>
					</div>

					{/* ── Layout principal ── */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start relative">
						{/* ════ Colonne gauche ════ */}
						<div className="space-y-10 min-w-0">
							<VehicleGallery
								images={vehicle.images}
								vehicleName={vehicleName}
							/>

							{/* Description & Confiance */}
							<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 md:p-10">
								<h2 className="ty-subheading text-[#0f172a] text-xl mb-6">
									Description du véhicule
								</h2>
								<DescriptionRenderer text={vehicle.description} />
								<div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
									{[
										"Contrôle technique à jour",
										"Révision effectuée",
										"Vérification 160 points",
										"Garantie 6 à 12 mois",
									].map((item) => (
										<div
											key={item}
											className="flex items-center gap-3 text-sm font-normal text-slate-700"
										>
											<CheckCircle2
												size={16}
												className="text-emerald-500"
											/>{" "}
											{item}
										</div>
									))}
								</div>
							</div>

							{/* Options équipement */}
							{vehicle.options &&
								Object.keys(vehicle.options).length > 0 && (
									<VehicleOptionsDisplay
										options={vehicle.options}
									/>
								)}

							{/* SECTION TECHNIQUE & OPTIONS */}
							{vehicle.features && (
								<div className="space-y-12">
									{/* Fiche Technique */}
									<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
										<h2 className="ty-heading text-[#0f172a] text-2xl mb-10 flex items-center gap-4 text-center sm:text-left">
											Fiche Technique{" "}
											<div className="h-px flex-1 bg-slate-100" />
										</h2>
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8">
											{[
												{
													label: "Année",
													value: vehicle.year,
												},
												{
													label: "Kilométrage",
													value: `${vehicle.mileage.toLocaleString("fr-FR")} km`,
												},
												{
													label: "Énergie",
													value: vehicle.fuel,
												},
												{
													label: "Transmission",
													value: vehicle.transmission,
												},
												{
													label: "Puissance",
													value: `${vehicle.power} ch`,
												},
												{
													label: "Teinte",
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
																value: `Classe ${vehicle.critAir}`,
															},
														]
													: []),
											].map(({ label, value }) => (
												<div
													key={label}
													className="group"
												>
													<p className="ty-label mb-1.5 text-slate-600">
														{label}
													</p>
													<p className="text-base ty-value">
														{value}
													</p>
													<div className="mt-2 h-0.5 w-6 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
												</div>
											))}
										</div>
									</div>

									{/* Équipements & Options Dynamiques */}
									<div className="px-2">
										<h3 className="ty-subheading text-[#0f172a] text-xl mb-8 flex items-center gap-4">
											Équipements & Confort{" "}
											<div className="h-px flex-1 bg-slate-100" />
										</h3>
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-6 gap-x-8">
											{Object.entries(
												vehicle.features,
											).map(([key, value]) => {
												if (Array.isArray(value)) {
													return value.map(
														(option, idx) => (
															<div
																key={`${key}-${idx}`}
																className="pl-4 border-l-2 border-slate-100 hover:border-brand-500 transition-colors py-1 group"
															>
																<span className="text-sm font-normal text-slate-700 group-hover:text-brand-600 transition-colors leading-tight block">
																	{option}
																</span>
															</div>
														),
													);
												}
												if (
													key === "Options" ||
													!value ||
													value === "Non" ||
													key === "Finition" ||
													key === "Motorisation" ||
													key === "Carnet d'entretien" ||
													key === "Contrôle technique"
												)
													return null;
												return (
													<div
														key={key}
														className="pl-4 border-l-2 border-slate-100 hover:border-brand-500 py-1 group"
													>
														<span className="ty-label block mb-0.5">
															{key}
														</span>
														<span className="text-sm font-normal text-[#0f172a] group-hover:text-brand-600 transition-colors leading-tight block">
															{String(value)}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							)}
						</div>

						{/* ════ Colonne droite STICKY ════ */}
						<aside className="lg:sticky lg:top-[120px] space-y-6 self-start h-fit">
							{/* Carte Prix & CTA */}
							<div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
								<div className="mb-6 pb-6 border-b border-slate-100">
									<div className="ty-value font-heading text-4xl">
										{vehicle.price.toLocaleString("fr-FR")}{" "}
										€
									</div>
									<p className="text-slate-400 text-sm mt-1 font-medium italic">
										Prix TTC
									</p>
								</div>

								<div className="space-y-4">
									<a
										href="tel:0532002038"
										className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-brand-500/20"
									>
										<Phone size={18} /> 05 32 00 20 38
									</a>
									<Link
										href={contactHref}
										className="btn-secondary w-full justify-center py-4 text-sm border-2 border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50"
									>
										<MessageSquare size={17} /> Envoyer un message
									</Link>
								</div>

								<ul className="mt-8 space-y-4">
									{[
										"Essai possible sur RDV",
										"Reprise de votre véhicule",
										"Financement personnalisé",
										"Spécialiste boîte auto",
									].map((item) => (
										<li
											key={item}
											className="flex items-center gap-3 text-sm font-light text-slate-600"
										>
											<ShieldCheck
												size={18}
												className="text-brand-500"
											/>{" "}
											{item}
										</li>
									))}
								</ul>
							</div>

							{/* Adresse Garage */}
							<div className="bg-[#0f172a] rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
								<div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
									<ArrowLeft
										size={80}
										className="rotate-135"
									/>
								</div>
								<div className="ty-label text-brand-400 mb-4 text-base">
									Garage Mendonça
								</div>
								<p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
									6 Avenue de la Mouyssaguese
									<br />
									31280 Drémil-Lafage
									<br />
									Lun–Jeu 8h–19h · Ven 8h–18h
								</p>
								<a
									href="https://maps.google.com"
									target="_blank"
									className="inline-flex items-center gap-2 text-brand-400 hover:text-red-500 text-xs font-medium transition-colors uppercase tracking-widest"
								>
									Itinéraire Maps{" "}
									<ArrowLeft
										size={12}
										className="rotate-180"
									/>
								</a>
							</div>
						</aside>
					</div>

					{/* Véhicules similaires */}
					{related.length > 0 && (
						<section className="mt-24 border-t border-slate-100 pt-16">
							<div className="flex items-center justify-between mb-10">
								<h2 className="ty-heading text-[#0f172a] text-3xl">
									Suggestions
								</h2>
								<Link
									href="/vehicules"
									className="text-sm font-normal text-brand-600 hover:text-brand-700 underline underline-offset-4"
								>
									Voir tout le stock
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{related.map((v) => (
									<VehicleCard key={v.id} vehicle={v} />
								))}
							</div>
						</section>
					)}
				</Container>
			</div>

			{/* CTA Mobile Sticky */}
			<div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-4 flex items-center gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
				<div className="flex-1">
					<p className="ty-value font-heading text-2xl leading-none">
						{vehicle.price.toLocaleString("fr-FR")} €
					</p>
				</div>
				<a
					href="tel:0532002038"
					className="btn-primary py-3.5 px-6 shadow-md shadow-brand-500/20"
				>
					<Phone size={18} />
				</a>
				<Link href={contactHref} className="btn-secondary py-3.5 px-4">
					<MessageSquare size={18} />
				</Link>
			</div>
		</MainLayout>
	);
}
