/**
 * Source de vérité unique pour les 160 points de contrôle.
 * Utilisé par : /produit, homepage (FeaturedVehicles), fiches véhicules.
 */
export const QUALITY_CONTROL = {
	total: 160,
	sections: [
		{
			id: "ct" as const,
			title: "Contrôle technique standard",
			description:
				"Éléments obligatoires du contrôle technique homologué UTAC",
			items: [
				"Sécurité générale (ceintures, airbags, klaxon)",
				"Freinage (disques, plaquettes, liquide de frein)",
				"Éclairage (feux avant/arrière, clignotants, feux de recul)",
				"Pneumatiques (usure, pression, état des flancs)",
				"Organes mécaniques essentiels (moteur, boîte, transmission)",
				"Liaisons au sol et direction (rotules, biellettes, roulements)",
				"Structure carrosserie et niveaux de corrosion",
			],
		},
		{
			id: "charte" as const,
			title: "Charte qualité Garage Mendonça",
			description:
				"Vérifications complémentaires issues de notre protocole interne",
			items: [
				"Fonctionnement des sièges (coulissement, réglages, maintien)",
				"Boutons et commandes intérieures (climatisation, lève-vitres, rétros)",
				"Équipements électroniques (GPS, Bluetooth, caméra de recul)",
				"Confort global (bruits parasites, vibrations, isolation acoustique)",
				"Finitions et aspects esthétiques (sellerie, tableau de bord, joints)",
				"Petits défauts non couverts par le contrôle technique",
				"Test dynamique (boîte de vitesses, moteur, comportement en virage)",
			],
		},
	],
} as const;

export type QualitySection = (typeof QUALITY_CONTROL.sections)[number];
