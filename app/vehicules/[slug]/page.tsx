import type { Metadata } from "next";
import type React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleContactFormLazy from "@/components/vehicles/VehicleContactFormLazy";
import GarageAddressBlock from "@/components/layout/GarageAddressBlock";
import Image from "next/image";
import { getLogoSrc } from "@/lib/brandLogos";
import VehicleOptionsDisplay from "@/components/vehicles/VehicleOptionsDisplay";
import BackToListingButton from "@/components/vehicles/BackToListingButton";
import {
	Phone,
	MessageSquare,
	CheckCircle2,
	ShieldCheck,
	Star,
	CalendarDays,
	Gauge,
	Zap,
	Settings2,
	Activity,
	Palette,
	DoorOpen,
	Leaf,
	ClipboardList,
} from "lucide-react";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getVehicleImages } from "@/lib/utils/vehicle-images";
import { getActiveGarageId } from "@/lib/config/garage";
import { FormatVehicleDescription } from "@/lib/utils/formatVehicleDescription";
import { detectDominantColor, isColorUnknown } from "@/lib/utils/detectVehicleColor";
import { extractShortId, buildVehicleUrl, generateVehicleSlug } from "@/lib/utils/slug";
import type { Vehicle } from "@/types";

const GARAGE_ID = getActiveGarageId();

// Revalidation ISR : pages pré-buildées rafraîchies toutes les heures.
// Garantit que prix, statut et contenu sont à jour sans redeploiement complet.
export const revalidate = 3600;

// UUID v4 pattern — pour le fallback getById si le slug ressemble à un UUID
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getVehicle(slugParam: string): Promise<Vehicle | null> {
	// Cas 1 : format hybride — finit par 8 chars hex (shortId)
	const shortId = extractShortId(slugParam);
	if (shortId) {
		return vehicleDb.getByShortId(GARAGE_ID, shortId).catch(() => null);
	}

	// Cas 2 : UUID complet (backward compat — vieilles URLs /vehicules/uuid)
	if (UUID_RE.test(slugParam)) {
		return vehicleDb.getById(slugParam).catch(() => null);
	}

	// Cas 3 : slug pur sans shortId (legacy avant migration)
	return vehicleDb.getBySlug(GARAGE_ID, slugParam).catch(() => null);
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

	const vehicleSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const canonical = `https://www.garagemendonca.com${buildVehicleUrl(vehicleSlug, vehicle.id)}`;
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
	return slugs.map(({ slug, id }) => ({
		slug: `${slug}-${id.slice(0, 8)}`,
	}));
}

/* ─────────── composant ─────────── */
export default async function VehicleDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const vehicle = await getVehicle(slug);
	if (!vehicle) notFound();

	// Redirect 301 vers l'URL canonique hybride si l'URL actuelle ne correspond pas
	const vehicleSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const canonicalParam = `${vehicleSlug}-${vehicle.id.slice(0, 8)}`;
	if (slug !== canonicalParam) {
		permanentRedirect(`/vehicules/${canonicalParam}`);
	}

	const [relatedVehicles, detectedColor] = await Promise.all([
		vehicleDb.getRelated(vehicle.id, GARAGE_ID, 3).catch(() => []),
		isColorUnknown(vehicle.color) && vehicle.thumbnailUrl
			? detectDominantColor(vehicle.thumbnailUrl)
			: Promise.resolve(null),
	]);

	const displayColor = !isColorUnknown(vehicle.color)
		? vehicle.color!
		: (detectedColor ?? null);

	const isAvailable = vehicle.status !== "sold";
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const vehicleLabel = `${vehicleName} · ${vehicle.price.toLocaleString("fr-FR")} €`;

	/* JSON-LD */
	const vehicleCanonical = `https://www.garagemendonca.com${buildVehicleUrl(vehicleSlug, vehicle.id)}`;
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
		color: displayColor ?? undefined,
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
				<Container className="pt-24 sm:pt-28 pb-16 sm:pb-8">
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
							<li className="text-[#0f172a] font-medium truncate max-w-[120px] sm:max-w-[200px]">
								{vehicleName}
							</li>
						</ol>
					</nav>

					<BackToListingButton className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-brand-600 transition-colors mb-6 text-sm font-medium" />

					{/* ── En-tête ── */}
					<div className="flex flex-wrap items-start justify-between gap-4 mb-8">
						<div className="flex items-start gap-4">
							<div className="w-16 h-16 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex items-center justify-center">
								<Image
									src={getLogoSrc(vehicle.brand)}
									alt={vehicle.brand}
									width={48}
									height={48}
									className="object-contain"
								/>
							</div>
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
								<h1 className="ty-heading text-[#0f172a] text-2xl sm:text-3xl md:text-4xl leading-tight">
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
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 lg:gap-10 items-start relative">
						{/* ════ Colonne gauche ════ */}
						<div className="space-y-10 min-w-0">
							<VehicleGallery
								images={getVehicleImages(vehicle)}
								vehicleName={vehicleName}
								vehicleImages={vehicle.vehicleImages}
							/>

							{/* Description & Confiance */}
							<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 md:p-8">
								<h2 className="ty-subheading text-[#0f172a] text-lg mb-4 sm:mb-5">
									Description du véhicule
								</h2>
								<FormatVehicleDescription
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

							{/* FICHE TECHNIQUE */}
							<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-6 md:p-8">
								{/* Header */}
								<div className="flex items-center gap-3 mb-6 sm:mb-8">
									<div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
										<ClipboardList size={16} className="text-brand-500" aria-hidden="true" />
									</div>
									<h2 className="font-heading font-medium text-[#0f172a] text-lg sm:text-xl tracking-tight">
										Fiche Technique
									</h2>
									<div className="h-px flex-1 bg-slate-100" aria-hidden="true" />
								</div>

								{/* Grille specs — 1 col mobile / 2 col sm / 3 col lg */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
									{(
										[
											{ icon: CalendarDays, label: "Année",        value: String(vehicle.year) },
											{ icon: Gauge,        label: "Kilométrage",  value: `${vehicle.mileage.toLocaleString("fr-FR")} km` },
											{ icon: Zap,          label: "Énergie",      value: vehicle.fuel },
											{ icon: Settings2,    label: "Transmission", value: vehicle.transmission },
											...(vehicle.power ? [{ icon: Activity, label: "Puissance", value: `${vehicle.power} ch` }] : []),
											...(displayColor     ? [{ icon: Palette,  label: "Teinte",  value: displayColor }] : []),
											{ icon: DoorOpen, label: "Portes", value: `${vehicle.doors} portes` },
											...(vehicle.critAir  ? [{ icon: Leaf, label: "Crit'Air", value: `Classe ${vehicle.critAir}` }] : []),
										] as { icon: React.ElementType; label: string; value: string }[]
									).map(({ icon: Icon, label, value }) => (
										<div
											key={label}
											className="group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-default"
										>
											{/* Icône */}
											<div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-brand-200 group-hover:bg-brand-50 transition-colors duration-200">
												<Icon size={16} className="text-slate-400 group-hover:text-brand-500 transition-colors duration-200" aria-hidden="true" />
											</div>
											{/* Texte */}
											<div className="min-w-0 flex-1">
												<p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 leading-none mb-1">
													{label}
												</p>
												<p className="text-sm font-medium text-[#0f172a] leading-tight truncate">
													{value}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* ════ Colonne droite STICKY ════ */}
						<aside className="lg:sticky lg:top-[120px] space-y-6 self-start h-fit">
							{/* Carte Prix & CTA */}
							<div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8">
								<div className="mb-4 pb-4 border-b border-slate-100">
									<div className="mt-4 m-4 flex items-center gap-3">
										<Image
											src={getLogoSrc(vehicle.brand)}
											alt={vehicle.brand}
											width={44}
											height={44}
											className="object-contain border rounded-md p-1 bg-white flex-shrink-0"
										/>
										<div>
											<p className="font-medium text-[#0f172a] leading-tight">
												{vehicle.brand} {vehicle.model}
											</p>
											<p className="text-slate-400 text-sm leading-tight mt-0.5">
												{vehicle.year}
											</p>
										</div>
									</div>
									<div className="ty-value font-heading text-3xl sm:text-4xl">
										{vehicle.price.toLocaleString("fr-FR")}{" "}
										€
									</div>
									<p className="text-slate-500 text-sm mt-1 font-medium">
										{vehicle.mileage.toLocaleString("fr-FR")} km
									</p>
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

								<ul className="mt-5 space-y-3">
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
						className="mt-16 border-t border-slate-100 pt-12 scroll-mt-24"
					>
						<div className="max-w-2xl mx-auto">
							<div className="mb-8 text-center">
								<div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-brand-600 text-xs font-medium mb-4">
									<MessageSquare size={13} />
									Demande d&apos;information
								</div>
								<h2 className="ty-heading text-[#0f172a] text-2xl sm:text-3xl mb-3">
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
						<section className="mt-16 border-t border-slate-100 pt-12">
							<div className="flex items-center justify-between mb-6">
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
								{relatedVehicles.map((v) => (
									<VehicleCard key={v.id} vehicle={v} />
								))}
							</div>
						</section>
					)}
				</Container>
			</div>

			{/* CTA Mobile Sticky */}
			<div
				className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 pt-3 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]"
				style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
			>
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
