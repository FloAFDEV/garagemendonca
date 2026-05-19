import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleContactFormLazy from "@/components/vehicles/VehicleContactFormLazy";
import GarageAddressBlock from "@/components/layout/GarageAddressBlock";
import Image from "next/image";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";
import VehicleOptionsDisplay from "@/components/vehicles/VehicleOptionsDisplay";
import {
	ArrowLeft,
	Phone,
	MessageSquare,
	CheckCircle2,
	ShieldCheck,
	Star,
} from "lucide-react";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getVehicleImages } from "@/lib/utils/vehicle-images";
import { getActiveGarageId } from "@/lib/config/garage";
import type { Vehicle } from "@/types";

const GARAGE_ID = getActiveGarageId();

// Revalidation ISR : pages pré-buildées rafraîchies toutes les heures.
// Garantit que prix, statut et contenu sont à jour sans redeploiement complet.
export const revalidate = 3600;

// UUID v4 pattern — pour le fallback getById si le slug ressemble à un UUID
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getVehicle(slug: string): Promise<Vehicle | null> {
	const bySlug = await vehicleDb.getBySlug(GARAGE_ID, slug).catch(() => null);
	if (bySlug) return bySlug;

	if (UUID_RE.test(slug)) {
		return vehicleDb.getById(slug).catch(() => null);
	}
	return null;
}

/* ─────────── carnet d'entretien parser ─────────── */
const CARNET_LINE_RE = /^\s*-?\s*(\d{2}\/\d{2}\/\d{4})\s*:\s*([\d\s]+km)\s*$/;

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
	params: Promise<{ slug: string }>;
}

/* ─────────── metadata ─────────── */
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const vehicle = await getVehicle(slug);
	if (!vehicle) return { title: "Véhicule introuvable" };

	const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.price.toLocaleString("fr-FR")} € | Garage Mendonça`;
	const desc =
		vehicle.meta_description ??
		`${vehicle.brand} ${vehicle.model} ${vehicle.year}, ${vehicle.mileage.toLocaleString("fr-FR")} km, ${vehicle.fuel}, boîte ${vehicle.transmission}. Révisé et garanti. Garage Mendonça.`;

	const canonical = `https://www.garagemendonca.com/vehicules/${vehicle.slug ?? vehicle.id}`;
	const ogImage = `${canonical}/opengraph-image`;

	return {
		title,
		description: desc,
		keywords: [
			vehicle.brand,
			vehicle.model,
			`${vehicle.brand} ${vehicle.model} occasion`,
			`${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
			vehicle.fuel,
			vehicle.transmission,
		],
		robots: { index: vehicle.status !== "draft", follow: true },
		alternates: { canonical },
		openGraph: {
			title,
			description: desc,
			url: canonical,
			type: "website",
			siteName: "Garage Mendonça",
			locale: "fr_FR",
			images: [{ url: ogImage, width: 1200, height: 630, alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}` }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: desc,
			images: [ogImage],
		},
	};
}

export async function generateStaticParams() {
	if (!SUPABASE_ENABLED || !GARAGE_ID) return [];
	const slugs = await vehicleDb.listSlugs(GARAGE_ID).catch(() => []);
	return slugs.map(({ slug }) => ({ slug }));
}

/* ─────────── composant ─────────── */
export default async function VehicleDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const vehicle = await getVehicle(slug);
	if (!vehicle) notFound();

	const relatedVehicles = await vehicleDb
		.getRelated(vehicle.id, GARAGE_ID, 3)
		.catch(() => []);

	const isAvailable = vehicle.status !== "sold";
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const vehicleLabel = `${vehicleName} · ${vehicle.price.toLocaleString("fr-FR")} €`;

	/* JSON-LD */
	const vehicleCanonical = `https://www.garagemendonca.com/vehicules/${vehicle.slug ?? vehicle.id}`;
	const jsonLdCar = {
		"@context": "https://schema.org",
		"@type": "Car",
		name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
		url: vehicleCanonical,
		description: vehicle.meta_description ?? (vehicle.description_marketing ?? vehicle.description ?? "").slice(0, 200),
		image: `${vehicleCanonical}/opengraph-image`,
		brand: { "@type": "Brand", name: vehicle.brand },
		model: `${vehicle.model}`,
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
		vehicleEngine: vehicle.power
			? { "@type": "EngineSpecification", enginePower: { "@type": "QuantitativeValue", value: vehicle.power, unitCode: "BHP" } }
			: undefined,
		offers: {
			"@type": "Offer",
			url: vehicleCanonical,
			priceCurrency: "EUR",
			price: vehicle.price,
			availability: isAvailable
				? "https://schema.org/InStock"
				: "https://schema.org/SoldOut",
			seller: {
				"@type": "AutoDealer",
				name: "Garage Auto Mendonça",
			},
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
					</div>

					{/* ── Layout principal ── */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start relative">
						{/* ════ Colonne gauche ════ */}
						<div className="space-y-10 min-w-0">
							<VehicleGallery
								images={getVehicleImages(vehicle)}
								vehicleName={vehicleName}
								vehicleImages={vehicle.vehicleImages}
							/>

							{/* Description & Confiance */}
							<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 md:p-10">
								<h2 className="ty-subheading text-[#0f172a] text-xl mb-6">
									Description du véhicule
								</h2>
								<DescriptionRenderer
									text={vehicle.description_marketing ?? vehicle.description ?? ""}
								/>
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
								</div>
							)}
						</div>

						{/* ════ Colonne droite STICKY ════ */}
						<aside className="lg:sticky lg:top-[120px] space-y-6 self-start h-fit">
							{/* Carte Prix & CTA */}
							<div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
								<div className="mb-6 pb-6 border-b border-slate-100">
									<div className="mt-4 m-4 flex items-center gap-2">
										{BRAND_LOGO_MAP[vehicle.brand] && (
											<Image
												src={
													BRAND_LOGO_MAP[
														vehicle.brand
													]
												}
												alt={vehicle.brand}
												width={50}
												height={50}
												className="object-contain border rounded-md p-1 bg-white"
											/>
										)}
										{vehicle.brand} {vehicle.model}{" "}
										{vehicle.year}
									</div>
									<div className="ty-value font-heading text-4xl">
										{vehicle.price.toLocaleString("fr-FR")}{" "}
										€
									</div>
									<p className="text-slate-400 text-sm mt-1 font-medium italic">
										Prix TTC
									</p>{" "}
								</div>

								<div className="space-y-4">
									<a
										href="tel:0532002038"
										className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-brand-500/20"
									>
										<Phone size={18} /> 05 32 00 20 38
									</a>
									{/* Scroll vers le formulaire inline en bas de page */}
									<a
										href="#contact-vehicule"
										className="btn-secondary w-full justify-center py-4 text-sm border-2 border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50"
									>
										<MessageSquare size={17} /> Envoyer un message
									</a>
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

							{/* Adresse Garage — données depuis DB */}
							<GarageAddressBlock />
						</aside>
					</div>

					{/* ── Formulaire de contact inline ─────────────────────────── */}
					<section
						id="contact-vehicule"
						className="mt-24 border-t border-slate-100 pt-16 scroll-mt-24"
					>
						<div className="max-w-2xl mx-auto">
							<div className="mb-8 text-center">
								<div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-brand-600 text-xs font-medium mb-4">
									<MessageSquare size={13} />
									Demande d&apos;information
								</div>
								<h2 className="ty-heading text-[#0f172a] text-3xl mb-3">
									Intéressé par ce véhicule ?
								</h2>
								<p className="text-slate-500 text-base">
									Envoyez-nous un message — nous vous répondons sous 24 h.
								</p>
							</div>
							<div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
								<VehicleContactFormLazy
									vehicleId={vehicle.id}
									vehicleName={vehicleName}
									vehicleLabel={vehicleLabel}
									garageId={GARAGE_ID}
									isAvailable={isAvailable}
								/>
							</div>
						</div>
					</section>

					{/* Véhicules similaires */}
					{relatedVehicles.length > 0 && (
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
								{relatedVehicles.map((v) => (
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
				<a href="#contact-vehicule" className="btn-secondary py-3.5 px-4">
					<MessageSquare size={18} />
				</a>
			</div>
		</MainLayout>
	);
}
