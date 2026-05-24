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
import QualityControlTooltip from "@/components/ui/QualityControlTooltip";
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
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getVehicleImages } from "@/lib/utils/vehicle-images";
import { getActiveGarageId } from "@/lib/config/garage";
import { FormatVehicleDescription } from "@/lib/utils/formatVehicleDescription";
import { getMarketingBadge } from "@/lib/vehicles/helpers";
import { detectDominantColor, isColorUnknown } from "@/lib/utils/detectVehicleColor";
import { extractShortId, buildOccasionUrl, generateVehicleSlug } from "@/lib/utils/slug";
import type { Vehicle } from "@/types";

const GARAGE_ID = getActiveGarageId();
const BASE_URL  = "https://www.garagemendonca.com";

export const revalidate = 3600;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getVehicle(slugParam: string): Promise<Vehicle | null> {
	const shortId = extractShortId(slugParam);
	if (shortId) return vehicleDb.getByShortId(GARAGE_ID, shortId).catch(() => null);
	if (UUID_RE.test(slugParam)) return vehicleDb.getById(slugParam).catch(() => null);
	return vehicleDb.getBySlug(GARAGE_ID, slugParam).catch(() => null);
}

interface PageProps {
	params: Promise<{ categorySlug: string; vehicleSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { categorySlug, vehicleSlug } = await params;
	const vehicle = await getVehicle(vehicleSlug);
	if (!vehicle) return { title: "Véhicule introuvable" };

	const vSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const canonical = `${BASE_URL}${buildOccasionUrl(categorySlug, vSlug, vehicle.id)}`;
	const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.price.toLocaleString("fr-FR")} € | Garage Mendonça`;
	const desc = vehicle.meta_description ??
		`${vehicle.brand} ${vehicle.model} ${vehicle.year}, ${vehicle.mileage.toLocaleString("fr-FR")} km, ${vehicle.fuel}, boîte ${vehicle.transmission}. Révisé et garanti. Garage Mendonça.`;
	const ogImage = `${canonical}/opengraph-image`;

	return {
		title,
		description: desc,
		keywords: [vehicle.brand, vehicle.model, `${vehicle.brand} ${vehicle.model} occasion`, vehicle.fuel, vehicle.transmission],
		robots: { index: vehicle.status !== "draft", follow: true },
		alternates: { canonical },
		openGraph: {
			title, description: desc, url: canonical, type: "website",
			siteName: "Garage Mendonça", locale: "fr_FR",
			images: [{ url: ogImage, width: 1200, height: 630, alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}` }],
		},
		twitter: { card: "summary_large_image", title, description: desc, images: [ogImage] },
	};
}

export async function generateStaticParams() {
	if (!SUPABASE_ENABLED || !GARAGE_ID) return [];
	const slugs = await vehicleDb.listSlugsWithCategory(GARAGE_ID).catch(() => []);
	return slugs
		.filter((r) => r.categorySlug)
		.map(({ slug, id, categorySlug }) => ({
			categorySlug: categorySlug!,
			vehicleSlug: `${slug}-${id.slice(0, 8)}`,
		}));
}

export default async function OccasionsVehicleDetailPage({ params }: PageProps) {
	const { categorySlug, vehicleSlug } = await params;
	const vehicle = await getVehicle(vehicleSlug);
	if (!vehicle) notFound();

	const vSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const canonicalParam = `${vSlug}-${vehicle.id.slice(0, 8)}`;

	// Redirect vers l'URL canonique correcte si le slug ou la catégorie diffèrent
	const vehicleCategorySlug = vehicle.categorySlug;
	if (!vehicleCategorySlug) {
		// Véhicule sans catégorie → fallback vers /vehicules/[slug]
		permanentRedirect(`/vehicules/${canonicalParam}`);
	}
	if (vehicleSlug !== canonicalParam || categorySlug !== vehicleCategorySlug) {
		permanentRedirect(buildOccasionUrl(vehicleCategorySlug, vSlug, vehicle.id));
	}

	const [relatedVehicles, detectedColor, category] = await Promise.all([
		vehicleDb.getRelated(vehicle.id, GARAGE_ID, 3).catch(() => []),
		isColorUnknown(vehicle.color) && vehicle.thumbnailUrl
			? detectDominantColor(vehicle.thumbnailUrl)
			: Promise.resolve(null),
		vehicleCategoryRepository.getBySlug(GARAGE_ID, vehicleCategorySlug).catch(() => null),
	]);

	const displayColor = !isColorUnknown(vehicle.color) ? vehicle.color! : (detectedColor ?? null);
	const isAvailable = vehicle.status !== "sold";
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const vehicleLabel = `${vehicleName} · ${vehicle.price.toLocaleString("fr-FR")} €`;

	const vehicleCanonical = `${BASE_URL}${buildOccasionUrl(vehicleCategorySlug, vSlug, vehicle.id)}`;
	const jsonLdCar = {
		"@context": "https://schema.org",
		"@type": "Car",
		name: vehicleName,
		url: vehicleCanonical,
		description: vehicle.meta_description ?? (vehicle.description_marketing ?? vehicle.description ?? "").slice(0, 200),
		image: `${vehicleCanonical}/opengraph-image`,
		brand: { "@type": "Brand", name: vehicle.brand },
		model: vehicle.model,
		modelDate: vehicle.year.toString(),
		mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" },
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
			availability: isAvailable ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
			seller: { "@type": "AutoDealer", name: "Garage Auto Mendonça" },
		},
	};

	return (
		<MainLayout>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }} />

			<div className="bg-[#f8fafc] min-h-screen">
				<Container className="pt-20 sm:pt-28 pb-28 sm:pb-8">
					{/* ── Breadcrumb ── */}
					<nav aria-label="Fil d'Ariane" className="hidden sm:block mb-3">
						<ol className="flex items-center gap-2 text-xs text-[#64748b]">
							<li><Link href="/" className="hover:text-brand-600 transition-colors">Accueil</Link></li>
							<li aria-hidden="true">/</li>
							<li><Link href="/occasions" className="hover:text-brand-600 transition-colors">Occasions</Link></li>
							<li aria-hidden="true">/</li>
							<li>
								<Link href={`/occasions/${vehicleCategorySlug}`} className="hover:text-brand-600 transition-colors">
									{category?.label ?? vehicleCategorySlug}
								</Link>
							</li>
							<li aria-hidden="true">/</li>
							<li className="text-[#0f172a] font-medium truncate max-w-[120px] sm:max-w-[200px]">{vehicleName}</li>
						</ol>
					</nav>

					<BackToListingButton className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-brand-600 transition-colors mb-3 sm:mb-5 text-sm font-medium" />

					{/* ── En-tête ── */}
					<div className="flex flex-wrap items-start justify-between gap-3 mb-3 sm:mb-6">
						<div className="flex items-start gap-3">
							<div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 sm:p-2 flex items-center justify-center">
								<Image src={getLogoSrc(vehicle.brand)} alt={vehicle.brand} width={48} height={48} className="object-contain" />
							</div>
							<div>
								<div className="flex items-center flex-wrap gap-2 mb-1.5">
									{vehicle.featured && (
										<span className="inline-flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
											<Star size={10} fill="currentColor" /> À la une
										</span>
									)}
									<span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
										<span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`} />
										{isAvailable ? "Disponible" : "Vendue"}
									</span>
									{(() => {
										const badge = getMarketingBadge(vehicle.features as Record<string, unknown>);
										if (!badge) return null;
										return (
											<span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.variant === "arrivage" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>
												{badge.label}
											</span>
										);
									})()}
								</div>
								<h1 className="ty-heading text-[#0f172a] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
									{vehicle.brand} {vehicle.model}
									{vehicle.features?.["Finition"] && (
										<span className="text-slate-400 font-medium text-base sm:text-xl ml-2">
											{" — "}{vehicle.features["Finition"]}
										</span>
									)}
								</h1>
							</div>
						</div>
					</div>

					{/* ── Layout principal ── */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 lg:gap-10 items-start relative">
						{/* ════ Colonne gauche ════ */}
						<div className="space-y-8 min-w-0">
							<VehicleGallery images={getVehicleImages(vehicle)} vehicleName={vehicleName} vehicleImages={vehicle.vehicleImages} />

							{/* Description & Confiance */}
							<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 md:p-8">
								<FormatVehicleDescription text={vehicle.description_marketing ?? vehicle.description ?? ""} />
								<div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
									{([
										"Contrôle technique à jour",
										"Révision effectuée",
										<QualityControlTooltip key="qc" variant="inline" triggerClassName="text-sm font-normal text-slate-700">
											Vérification 160 points
										</QualityControlTooltip>,
										(vehicle.features?.garantie || (vehicle.features as Record<string, unknown> | undefined)?.["Garantie"])
											? `Garantie ${vehicle.features?.garantie ?? (vehicle.features as Record<string, unknown>)["Garantie"]}`
											: "Garantie 6 à 12 mois",
									] as React.ReactNode[]).map((item, idx) => (
										<div key={idx} className="flex items-center gap-3 text-sm font-normal text-slate-700">
											<CheckCircle2 size={16} className="text-emerald-500" /> {item}
										</div>
									))}
								</div>
							</div>

							{vehicle.options && Object.keys(vehicle.options).length > 0 && (
								<VehicleOptionsDisplay options={vehicle.options} />
							)}

							{/* FICHE TECHNIQUE */}
							<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-6 md:p-8">
								<div className="flex items-center gap-3 mb-6 sm:mb-8">
									<div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
										<ClipboardList size={16} className="text-brand-500" aria-hidden="true" />
									</div>
									<h2 className="font-heading font-medium text-[#0f172a] text-lg sm:text-xl tracking-tight">Fiche Technique</h2>
									<div className="h-px flex-1 bg-slate-100" aria-hidden="true" />
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
									{([
										{ icon: CalendarDays, label: "Année",        value: String(vehicle.year) },
										{ icon: Gauge,        label: "Kilométrage",  value: `${vehicle.mileage.toLocaleString("fr-FR")} km` },
										{ icon: Zap,          label: "Énergie",      value: vehicle.fuel },
										{ icon: Settings2,    label: "Transmission", value: vehicle.transmission },
										...(vehicle.power ? [{ icon: Activity, label: "Puissance", value: `${vehicle.power} ch` }] : []),
										...(displayColor    ? [{ icon: Palette,  label: "Teinte",    value: displayColor }] : []),
										{ icon: DoorOpen, label: "Portes", value: `${vehicle.doors} portes` },
										...(vehicle.critAir ? [{ icon: Leaf, label: "Crit'Air", value: `Classe ${vehicle.critAir}` }] : []),
									] as { icon: React.ElementType; label: string; value: string }[]).map(({ icon: Icon, label, value }) => (
										<div key={label} className="group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-default">
											<div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-brand-200 group-hover:bg-brand-50 transition-colors duration-200">
												<Icon size={16} className="text-slate-400 group-hover:text-brand-500 transition-colors duration-200" aria-hidden="true" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</p>
												<p className="text-sm font-medium text-[#0f172a] leading-tight truncate">{value}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* ════ Colonne droite STICKY ════ */}
						<aside className="lg:sticky lg:top-[120px] space-y-6 self-start h-fit">
							<div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8">
								<div className="mb-4 pb-4 border-b border-slate-100">
									<div className="mt-4 m-4 flex items-center gap-3">
										<Image src={getLogoSrc(vehicle.brand)} alt={vehicle.brand} width={44} height={44} className="object-contain border rounded-md p-1 bg-white flex-shrink-0" />
										<div>
											<p className="font-medium text-[#0f172a] leading-tight">{vehicle.brand} {vehicle.model}</p>
											<p className="text-slate-400 text-sm leading-tight mt-0.5">{vehicle.year}</p>
										</div>
									</div>
									<div className="ty-value font-heading text-3xl sm:text-4xl">{vehicle.price.toLocaleString("fr-FR")} €</div>
									<p className="text-slate-500 text-sm mt-1 font-medium">{vehicle.mileage.toLocaleString("fr-FR")} km</p>
									{(() => {
										const garantie = vehicle.features?.garantie ?? (vehicle.features as Record<string, unknown> | undefined)?.["Garantie"] as string | undefined;
										if (!garantie) return null;
										return (
											<span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full">
												<ShieldCheck size={12} className="text-emerald-500" /> Garantie {garantie}
											</span>
										);
									})()}
								</div>
								<div className="space-y-4">
									<a href="tel:0532002038" className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-brand-500/20">
										<Phone size={18} /> 05 32 00 20 38
									</a>
									<a href="#contact-vehicule" className="btn-secondary w-full justify-center py-4 text-sm border-2 border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50">
										<MessageSquare size={17} /> Envoyer un message
									</a>
								</div>
								<ul className="mt-5 space-y-3">
									{["Essai possible sur RDV", "Reprise de votre véhicule", "Financement personnalisé", "Spécialiste boîte auto"].map((item) => (
										<li key={item} className="flex items-center gap-3 text-sm font-light text-slate-600">
											<ShieldCheck size={18} className="text-brand-500" /> {item}
										</li>
									))}
								</ul>
							</div>
							<GarageAddressBlock />
						</aside>
					</div>

					{/* ── Formulaire de contact ── */}
					<section id="contact-vehicule" className="mt-16 scroll-mt-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100 py-16">
						<div className="max-w-2xl mx-auto">
							<div className="mb-8 text-center">
								<div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-brand-600 text-xs font-medium mb-4">
									<MessageSquare size={13} /> Demande d&apos;information
								</div>
								<h2 className="ty-heading text-[#0f172a] text-2xl sm:text-3xl mb-3">Intéressé par ce véhicule ?</h2>
								<p className="text-slate-500 text-base">Envoyez-nous un message — nous vous répondons sous 24 h.</p>
							</div>
							<div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
								<VehicleContactFormLazy vehicleId={vehicle.id} vehicleName={vehicleName} vehicleLabel={vehicleLabel} garageId={GARAGE_ID} isAvailable={isAvailable} />
							</div>
						</div>
					</section>

					{/* Véhicules similaires */}
					{relatedVehicles.length > 0 && (
						<section className="mt-16 border-t border-slate-100 pt-12">
							<div className="flex items-center justify-between mb-6">
								<h2 className="ty-heading text-[#0f172a] text-3xl">Suggestions</h2>
								<Link href={`/occasions/${vehicleCategorySlug}`} className="text-sm font-normal text-brand-600 hover:text-brand-700 underline underline-offset-4">
									Voir plus de {category?.label?.toLowerCase() ?? "véhicules"}
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
								{relatedVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
							</div>
						</section>
					)}
				</Container>
			</div>

			{/* CTA Mobile Sticky */}
			<div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 pt-3 flex items-center gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
				<div className="flex-1">
					<p className="ty-value font-heading text-2xl leading-none">{vehicle.price.toLocaleString("fr-FR")} €</p>
				</div>
				<a href="tel:0532002038" className="btn-primary py-3.5 px-6 shadow-md shadow-brand-500/20"><Phone size={18} /></a>
				<a href="#contact-vehicule" className="btn-secondary py-3.5 px-4"><MessageSquare size={18} /></a>
			</div>
		</MainLayout>
	);
}
