import type { Metadata } from "next";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleOptionsDisplay from "@/components/vehicles/VehicleOptionsDisplay";
import BackToListingButton from "@/components/vehicles/BackToListingButton";
import OccasionsBreadcrumb from "@/components/vehicles/detail/OccasionsBreadcrumb";
import VehicleDetailHeader from "@/components/vehicles/detail/VehicleDetailHeader";
import VehicleQualityCard from "@/components/vehicles/detail/VehicleQualityCard";
import VehicleTechSpecs from "@/components/vehicles/detail/VehicleTechSpecs";
import VehiclePriceSidebar from "@/components/vehicles/detail/VehiclePriceSidebar";
import VehicleContactSection from "@/components/vehicles/detail/VehicleContactSection";
import VehicleRelatedSection from "@/components/vehicles/detail/VehicleRelatedSection";
import MobileVehicleFooter from "@/components/vehicles/detail/MobileVehicleFooter";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { getVehicleBySlugParam } from "@/lib/db/vehicle.helpers";
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getVehicleImages } from "@/lib/utils/vehicle-images";
import { getActiveGarageId } from "@/lib/config/garage";
import { getMarketingBadge } from "@/lib/vehicles/helpers";
import { detectDominantColor, isColorUnknown } from "@/lib/utils/detectVehicleColor";
import { buildOccasionUrl, buildVehicleUrl, generateVehicleSlug } from "@/lib/utils/slug";
import { buildVehicleMetadata, buildVehicleOccasionCanonical, buildVehicleJsonLd, SITE_BASE_URL } from "@/lib/seo/vehicle";

const GARAGE_ID = getActiveGarageId();

export const revalidate = 3600;

// Déduplique getVehicleBySlugParam entre generateMetadata et OccasionsVehicleDetailPage
// sur la même requête serveur → 1 seul hit Supabase par accès à la fiche.
const getVehicleCached = cache((slug: string, garageId: string) =>
  getVehicleBySlugParam(slug, garageId),
);

interface PageProps {
	params: Promise<{ categorySlug: string; vehicleSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { categorySlug, vehicleSlug } = await params;
	const vehicle = await getVehicleCached(vehicleSlug, GARAGE_ID);
	if (!vehicle) return { title: "Véhicule introuvable" };

	const canonical = buildVehicleOccasionCanonical(categorySlug, vehicle);
	return buildVehicleMetadata(vehicle, { canonical, noindex: false });
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
	const vehicle = await getVehicleCached(vehicleSlug, GARAGE_ID);
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

	const marketingBadge = getMarketingBadge(vehicle.features as Record<string, unknown>);
	// Logique originale || / ?? préservée — comportement falsy intentionnel (identique à /vehicules)
	const garantieRaw = (vehicle.features?.garantie || (vehicle.features as Record<string, unknown> | undefined)?.["Garantie"])
		? (vehicle.features?.garantie ?? (vehicle.features as Record<string, unknown>)["Garantie"] as string)
		: null;
	const garantieLabel = garantieRaw ? `Garantie ${garantieRaw}` : "Garantie 6 à 12 mois";
	const descriptionText = vehicle.description_marketing ?? vehicle.description ?? "";

	const vehicleCanonical = `${SITE_BASE_URL}${buildVehicleUrl(vSlug, vehicle.id)}`;
	const jsonLdCar = buildVehicleJsonLd(vehicle, vehicleCanonical, displayColor);

	return (
		<MainLayout>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }} />

			<div className="bg-[#f8fafc] min-h-screen">
				<Container className="pt-20 sm:pt-28 pb-28 sm:pb-8">
					<OccasionsBreadcrumb
						categoryLabel={category?.label ?? vehicleCategorySlug}
						vehicleName={vehicleName}
					/>

					<BackToListingButton className="inline-flex items-center gap-1.5 text-[#64748b] hover:text-brand-600 transition-colors mb-3 sm:mb-5 text-sm font-medium" />

					<VehicleDetailHeader
						vehicle={vehicle}
						isAvailable={isAvailable}
						marketingBadge={marketingBadge}
					/>

					{/* ── Layout principal ── */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 sm:gap-8 lg:gap-10 items-start relative">
						{/* ════ Colonne gauche ════ */}
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

					<VehicleContactSection
						vehicleId={vehicle.id}
						vehicleName={vehicleName}
						vehicleLabel={vehicleLabel}
						garageId={GARAGE_ID}
						isAvailable={isAvailable}
					/>

					{relatedVehicles.length > 0 && (
						<VehicleRelatedSection
							vehicles={relatedVehicles}
							listHref="/vehicules"
							listLabel="Voir tout le stock"
						/>
					)}
				</Container>
			</div>

			<MobileVehicleFooter price={vehicle.price} />
		</MainLayout>
	);
}
