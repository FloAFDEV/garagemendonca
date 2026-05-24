/**
 * /lib/routing — Source de vérité unique pour toutes les URL builders.
 *
 * Importer depuis ici plutôt que depuis @/lib/utils/slug directement.
 * Les deux chemins coexistent pendant la transition ; l'objectif est que
 * tout le code nouveau utilise @/lib/routing.
 */
export {
	buildVehicleUrl,
	buildOccasionUrl,
	resolveVehicleHref,
	generateVehicleSlug,
	generateUniqueVehicleSlug,
	sanitizeSlug,
	isValidSlug,
	extractShortId,
} from "@/lib/utils/slug";
