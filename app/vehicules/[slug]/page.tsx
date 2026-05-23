/**
 * /vehicules/[slug] — redirect 301 permanent vers /occasions/[category]/[slug]
 *
 * Cette route n'est plus indexée. Elle sert uniquement de pont SEO pour les
 * URLs legacy et les liens externes déjà indexés par Google.
 *
 * Canonical : /occasions/[category]/[slug]
 */
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { getActiveGarageId } from "@/lib/config/garage";
import { extractShortId, buildOccasionUrl, buildVehicleUrl, generateVehicleSlug } from "@/lib/utils/slug";
import type { Vehicle } from "@/types";

const GARAGE_ID = getActiveGarageId();

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

	const vSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const categorySlug = vehicle.categories?.[0];
	const canonical = categorySlug
		? `https://www.garagemendonca.com${buildOccasionUrl(categorySlug, vSlug, vehicle.id)}`
		: undefined;

	return {
		title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} | Garage Mendonça`,
		robots: { index: false, follow: false },
		...(canonical ? { alternates: { canonical } } : {}),
	};
}

export async function generateStaticParams() {
	if (!SUPABASE_ENABLED || !GARAGE_ID) return [];
	const slugs = await vehicleDb.listSlugs(GARAGE_ID).catch(() => []);
	return slugs.map(({ slug, id }) => ({ slug: `${slug}-${id.slice(0, 8)}` }));
}

export default async function VehicleDetailRedirectPage({ params }: PageProps) {
	const { slug } = await params;
	const vehicle = await getVehicle(slug);
	if (!vehicle) notFound();

	const vSlug = vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	const canonicalParam = `${vSlug}-${vehicle.id.slice(0, 8)}`;
	const categorySlug = vehicle.categories?.[0];

	if (categorySlug) {
		permanentRedirect(buildOccasionUrl(categorySlug, vSlug, vehicle.id));
	}

	// Véhicule sans catégorie — corriger le slug si nécessaire, puis afficher fallback
	if (slug !== canonicalParam) {
		permanentRedirect(buildVehicleUrl(vSlug, vehicle.id));
	}

	// Fallback : véhicule sans catégorie assignée (ne devrait plus arriver après migration)
	permanentRedirect(`/vehicules`);
}
