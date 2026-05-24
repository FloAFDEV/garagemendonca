/**
 * /vehicules/[slug] — route de transition SEO
 *
 * Toujours noindex + follow. Jamais indexée directement.
 * L'URL canonique déclarée est /occasions/[cat]/[slug] dès que la catégorie est connue.
 *
 * Comportements :
 * 1. Véhicule avec catégorie → 301 permanent vers /occasions/[cat]/[slug]
 * 2. Véhicule sans catégorie → rendu complet (UX fallback) + noindex
 *    canonical = self (/vehicules/[slug]) en attendant l'assignation
 *
 * Transition finale : quand tous les vehicles ont un category_id,
 * supprimer le rendu et laisser uniquement le permanentRedirect.
 */
import type { Metadata } from "next";
import type React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleContactFormLazy from "@/components/vehicles/VehicleContactFormLazy";
import VehicleOptionsDisplay from "@/components/vehicles/VehicleOptionsDisplay";
import BackToListingButton from "@/components/vehicles/BackToListingButton";
import { MessageSquare } from "lucide-react";
import VehiclePriceSidebar from "@/components/vehicles/detail/VehiclePriceSidebar";
import MobileVehicleFooter from "@/components/vehicles/detail/MobileVehicleFooter";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getVehicleImages } from "@/lib/utils/vehicle-images";
import { getActiveGarageId } from "@/lib/config/garage";
import { getMarketingBadge } from "@/lib/vehicles/helpers";
import { detectDominantColor, isColorUnknown } from "@/lib/utils/detectVehicleColor";
import { extractShortId, buildOccasionUrl, buildVehicleUrl, generateVehicleSlug } from "@/lib/utils/slug";
import VehicleBreadcrumb from "@/components/vehicles/detail/VehicleBreadcrumb";
import VehicleDetailHeader from "@/components/vehicles/detail/VehicleDetailHeader";
import VehicleQualityCard from "@/components/vehicles/detail/VehicleQualityCard";
import VehicleTechSpecs from "@/components/vehicles/detail/VehicleTechSpecs";
import { buildVehicleFallbackCanonical, buildVehicleMetadata, buildVehicleJsonLd } from "@/lib/seo/vehicle";
import type { Vehicle } from "@/types";

const GARAGE_ID = getActiveGarageId();

// ISR — revalidation toutes les heures pour détecter l'assignation d'une catégorie
export const revalidate = 3600;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getVehicle(slugParam: string): Promise<Vehicle | null> {
	const shortId = extractShortId(slugParam);
	if (shortId) return vehicleDb.getByShortId(GARAGE_ID, shortId).catch(() => null);
	if (UUID_RE.test(slugParam)) return vehicleDb.getById(slugParam).catch(() => null);
	return vehicleDb.getBySlug(GARAGE_ID, slugParam).catch(() => null);
}

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const vehicle = await getVehicle(slug);
	if (!vehicle) return { title: "Véhicule introuvable" };

	// Route toujours noindex — Google indexe /occasions/[cat]/[slug] uniquement.
	// Canonical → /occasions/[cat]/[slug] si catégorie connue, sinon self-canonical.
	const canonical = buildVehicleFallbackCanonical(vehicle);
	return buildVehicleMetadata(vehicle, { canonical, noindex: true });
}

export async function generateStaticParams() {
	if (!SUPABASE_ENABLED || !GARAGE_ID) return [];
	// Uniquement les véhicules sans categorySlug — les catégorisés font un 301
	// et n'ont pas besoin d'être pré-générés à cette URL.
	const slugs = await vehicleDb.listSlugsWithCategory(GARAGE_ID).catch(() => []);
	return slugs
		.filter(({ categorySlug }) => !categorySlug)
		.map(({ slug, id }) => ({ slug: `${slug}-${id.slice(0, 8)}` }));
}

export default async function VehicleDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const vehicle = await getVehicle(slug);
	if (!vehicle) notFound();

	const vSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const canonicalParam = `${vSlug}-${vehicle.id.slice(0, 8)}`;

	// Véhicule catégorisé → redirect 301 vers URL canonique /occasions/[cat]/[slug]
	const categorySlug = vehicle.categorySlug;
	if (categorySlug) {
		permanentRedirect(buildOccasionUrl(categorySlug, vSlug, vehicle.id));
	}

	// Normalisation de l'URL (slug mal formé sans catégorie)
	if (slug !== canonicalParam) {
		permanentRedirect(buildVehicleUrl(vSlug, vehicle.id));
	}

	// ─── Rendu complet pour véhicules sans catégorie ───────────────

	const [relatedVehicles, detectedColor] = await Promise.all([
		vehicleDb.getRelated(vehicle.id, GARAGE_ID, 3).catch(() => []),
		isColorUnknown(vehicle.color) && vehicle.thumbnailUrl
			? detectDominantColor(vehicle.thumbnailUrl)
			: Promise.resolve(null),
	]);

	const displayColor = !isColorUnknown(vehicle.color) ? vehicle.color! : (detectedColor ?? null);
	const isAvailable = vehicle.status !== "sold";
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const vehicleLabel = `${vehicleName} · ${vehicle.price.toLocaleString("fr-FR")} €`;
	const marketingBadge = getMarketingBadge(vehicle.features as Record<string, unknown>);
	// Logique originale || / ?? préservée — comportement falsy intentionnel
	const garantieRaw = (vehicle.features?.garantie || (vehicle.features as Record<string, unknown> | undefined)?.["Garantie"])
		? (vehicle.features?.garantie ?? (vehicle.features as Record<string, unknown>)["Garantie"] as string)
		: null;
	const garantieLabel = garantieRaw ? `Garantie ${garantieRaw}` : "Garantie 6 à 12 mois";
	const descriptionText = vehicle.description_marketing ?? vehicle.description ?? "";
	const vehicleCanonical = `https://www.garagemendonca.com${buildVehicleUrl(vSlug, vehicle.id)}`;

	const jsonLdCar = buildVehicleJsonLd(vehicle, vehicleCanonical, displayColor);

	return (
		<MainLayout>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }} />

			<div className="bg-[#f8fafc] min-h-screen">
				<Container className="pt-20 sm:pt-28 pb-28 sm:pb-8">
					<VehicleBreadcrumb vehicleName={vehicleName} />

					<BackToListingButton className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-brand-600 transition-colors mb-3 sm:mb-5 text-sm font-medium" />

					<VehicleDetailHeader
						vehicle={vehicle}
						isAvailable={isAvailable}
						marketingBadge={marketingBadge}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 lg:gap-10 items-start relative">
						<div className="space-y-8 min-w-0">
							<VehicleGallery images={getVehicleImages(vehicle)} vehicleName={vehicleName} vehicleImages={vehicle.vehicleImages} />

							<VehicleQualityCard
								descriptionText={descriptionText}
								garantieLabel={garantieLabel}
							/>

							{vehicle.options && Object.keys(vehicle.options).length > 0 && (
								<VehicleOptionsDisplay options={vehicle.options} />
							)}

							<VehicleTechSpecs vehicle={vehicle} displayColor={displayColor} />
						</div>

						<VehiclePriceSidebar vehicle={vehicle} />
					</div>

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

					{relatedVehicles.length > 0 && (
						<section className="mt-16 border-t border-slate-100 pt-12">
							<div className="flex items-center justify-between mb-6">
								<h2 className="ty-heading text-[#0f172a] text-3xl">Suggestions</h2>
								<Link href="/vehicules" className="text-sm font-normal text-brand-600 hover:text-brand-700 underline underline-offset-4">
									Voir tout le stock
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
								{relatedVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
							</div>
						</section>
					)}
				</Container>
			</div>

			<MobileVehicleFooter price={vehicle.price} />
		</MainLayout>
	);
}
