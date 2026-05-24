/**
 * /lib/seo/vehicle.ts — Builders SEO pour les pages véhicule.
 *
 * Centralise la génération de métadonnées (title, description, canonical,
 * OG, Twitter) et du JSON-LD Schema.org (type Car).
 *
 * Utilisé par :
 *   - app/occasions/[categorySlug]/[vehicleSlug]/page.tsx  (canonical, indexé)
 *   - app/vehicules/[slug]/page.tsx                        (transitional, noindex)
 */

import type { Metadata } from "next";
import type { Vehicle } from "@/types";
import { buildOccasionUrl, buildVehicleUrl, generateVehicleSlug } from "@/lib/utils/slug";

// ─────────────────────────────────────────────────────────────────────────────
//  Constantes
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_BASE_URL = "https://www.garagemendonca.com";

// ─────────────────────────────────────────────────────────────────────────────
//  Builders primitifs
// ─────────────────────────────────────────────────────────────────────────────

/** Titre SEO standard d'une fiche véhicule. */
export function buildVehicleTitle(vehicle: Vehicle): string {
	return `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.price.toLocaleString("fr-FR")} € | Garage Mendonça`;
}

/** Description SEO : meta_description personnalisée ou générée automatiquement. */
export function buildVehicleDescription(vehicle: Vehicle): string {
	return (
		vehicle.meta_description ??
		`${vehicle.brand} ${vehicle.model} ${vehicle.year}, ${vehicle.mileage.toLocaleString("fr-FR")} km, ${vehicle.fuel}, boîte ${vehicle.transmission}. Révisé et garanti. Garage Mendonça.`
	);
}

/**
 * URL canonique pour la route /occasions/[cat]/[slug] (route indexée principale).
 */
export function buildVehicleOccasionCanonical(
	categorySlug: string,
	vehicle: Vehicle,
): string {
	const vSlug =
		vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	return `${SITE_BASE_URL}${buildOccasionUrl(categorySlug, vSlug, vehicle.id)}`;
}

/**
 * URL canonique pour la route /vehicules/[slug] (route de transition, noindex).
 * Pointe vers /occasions si la catégorie est connue, sinon self-canonical.
 */
export function buildVehicleFallbackCanonical(vehicle: Vehicle): string {
	const vSlug =
		vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year);
	if (vehicle.categorySlug) {
		return `${SITE_BASE_URL}${buildOccasionUrl(vehicle.categorySlug, vSlug, vehicle.id)}`;
	}
	return `${SITE_BASE_URL}${buildVehicleUrl(vSlug, vehicle.id)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Metadata builder
// ─────────────────────────────────────────────────────────────────────────────

interface BuildVehicleMetadataOptions {
	/** URL canonique absolue de la page. */
	canonical: string;
	/**
	 * true  → robots noindex + follow (route de transition /vehicules/[slug])
	 * false → robots index selon vehicle.status (route canonique /occasions/…)
	 */
	noindex?: boolean;
}

/**
 * Génère l'objet Metadata Next.js pour une page véhicule.
 *
 * En mode noindex : seuls title + robots + canonical sont émis (pas d'OG/Twitter).
 * En mode indexé : métadonnées complètes avec OG + Twitter cards.
 */
export function buildVehicleMetadata(
	vehicle: Vehicle,
	options: BuildVehicleMetadataOptions,
): Metadata {
	const { canonical, noindex = false } = options;
	const title = buildVehicleTitle(vehicle);

	if (noindex) {
		return {
			title,
			robots: { index: false, follow: true },
			alternates: { canonical },
		};
	}

	const description = buildVehicleDescription(vehicle);
	const ogImage = `${canonical}/opengraph-image`;

	return {
		title,
		description,
		keywords: [
			vehicle.brand,
			vehicle.model,
			`${vehicle.brand} ${vehicle.model} occasion`,
			vehicle.fuel,
			vehicle.transmission,
		],
		robots: { index: vehicle.status !== "draft", follow: true },
		alternates: { canonical },
		openGraph: {
			title,
			description,
			url: canonical,
			type: "website",
			siteName: "Garage Mendonça",
			locale: "fr_FR",
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
		},
	};
}

// ─────────────────────────────────────────────────────────────────────────────
//  JSON-LD builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère le JSON-LD Schema.org (type Car) pour une fiche véhicule.
 *
 * @param vehicle      - Objet domaine Vehicle
 * @param canonical    - URL canonique absolue (utilisée comme `url` + `offers.url`)
 * @param displayColor - Couleur résolue (nominale ou détectée par IA), ou null
 */
export function buildVehicleJsonLd(
	vehicle: Vehicle,
	canonical: string,
	displayColor: string | null,
): Record<string, unknown> {
	const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
	const isAvailable = vehicle.status !== "sold";

	return {
		"@context": "https://schema.org",
		"@type": "Car",
		name: vehicleName,
		url: canonical,
		description: (
			vehicle.meta_description ??
			(vehicle.description_marketing ?? vehicle.description ?? "").slice(0, 200)
		),
		image: `${canonical}/opengraph-image`,
		brand: { "@type": "Brand", name: vehicle.brand },
		model: vehicle.model,
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
			? {
					"@type": "EngineSpecification",
					enginePower: {
						"@type": "QuantitativeValue",
						value: vehicle.power,
						unitCode: "BHP",
					},
				}
			: undefined,
		offers: {
			"@type": "Offer",
			url: canonical,
			priceCurrency: "EUR",
			price: vehicle.price,
			availability: isAvailable
				? "https://schema.org/InStock"
				: "https://schema.org/SoldOut",
			seller: { "@type": "AutoDealer", name: "Garage Auto Mendonça" },
		},
	};
}
