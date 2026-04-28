import {
	Vehicle,
	Service,
	Garage,
	ServiceStep,
	ServicePricing,
	ServiceFAQItem,
	ServiceTestimonial,
} from "@/types";

// ─────────────────────────────────────────────
//  Garage(s) fictifs — données de démonstration
// ─────────────────────────────────────────────
export const garages: Garage[] = [
	{
		id: "garage-mendonca",
		name: "Garage Auto Mendonca",
		slug: "garage-mendonca",
		address: "6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage",
		phone: "05 32 00 20 38",
		email: "contact@garagemendonca.com",
		plan: "isolated",
		createdAt: "2001-01-01T00:00:00Z",
		updatedAt: "2025-01-01T00:00:00Z",
	},
];

// ─────────────────────────────────────────────
//  Véhicules fictifs — données de démonstration
//  garageId lié au garage ci-dessus
// ─────────────────────────────────────────────
export const vehicles: Vehicle[] = [
	{
		id: "1",
		garageId: "garage-mendonca",
		brand: "Suzuki",
		model: "Swift",
		year: 2018,
		mileage: 68500,
		fuel: "Essence",
		price: 11200,
		transmission: "Automatique",
		power: 110,
		color: "Speedy Blue (ZWG)",
		doors: 5,
		featured: true,
		critAir: "2",
		status: "published",
		createdAt: "2018-03-27",
		updatedAt: "2026-03-20T00:00:00Z",
		description: `
Suzuki Swift 2018 avec 68 500 km. Finition Comfort+ et couleur Speedy Blue (ZWG). Moteur 110 ch (6cv) avec boîte automatique.

Garantie : 6 mois complète couvrant l'ensemble des composants mécaniques et électroniques.

Mécanique : Carnet d'entretien tamponné SUZUKI
- 16/08/2019 : 14 631 km
- 24/08/2020 : 25 037 km
- 27/09/2021 : 31 366 km
- 19/10/2022 : 38 602 km
- 21/11/2023 : 48 478 km
- Entretien réalisé pour la vente à 68 250 km

Carrosserie : Très bon état général. Photos supplémentaires et vidéo en cours de préparation.

Autres notes : Véhicule en cours de roulage. Idéal pour la ville et pour jeunes permis en boîte automatique.
  `,
		features: {
			Finition: "Comfort+",
			Motorisation: "1.0i 110 ch BoosterJet",

			Provenance: "Francaise",
			"Carnet d'entretien": "À jour",
			"Contrôle technique": "À jour",
			Garantie: "6 mois complète",
		},
		/* ── Options structurées (nouveau système) ──────────────────────────────
		 * Mappées depuis features.Options ci-dessus.
		 * Utilisées par VehicleOptionsDisplay côté public.
		 * ─────────────────────────────────────────────────────────────────── */
		options: {
			// Sécurité
			abs: true,
			esp: true,
			airbags: true,
			airbags_lateraux: true,
			aide_freinage_urgence: true, // DSBS
			isofix: true,
			// Aides à la conduite
			regulateur_adaptatif: true, // ACC
			regulateur_vitesse: true,
			freinage_automatique: true, // DSBS
			alerte_franchissement_ligne: true,
			feux_automatiques: true, // passage code/phare auto + détecteur luminosité
			camera_recul: true,
			// Extérieur
			jantes_alliage: true,
			taille_jantes: 16,
			vitres_surteintees: true,
			feux_led: true, // projecteurs LED + feux de jour LED
			retroviseurs_electriques: true,
			retroviseurs_degivrants: true,
			// Intérieur & confort
			climatisation_automatique: true,
			sieges_chauffants: true,
			volant_cuir: true,
			volant_reglable: true,
			demarrage_sans_cle: true,
			ouverture_sans_cle: true,
			vitres_electriques_avant: true,
			vitres_electriques_arriere: true,
			// Multimédia
			ecran_tactile: true,
			bluetooth: true,
			usb: true,
			prise_12v: true,
			// Motorisation
			boite_automatique: true,
			start_stop: true,
		},
		images: [
			"https://www.garagemendonca.com/public/img/big/20260313134541Copierjpg_69b7b050aaa46.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313135600Copierjpg_69b7b0500daac.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313134700Copierjpg_69b7b05054e68.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313134736Copierjpg_69b7b05039a17.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313135309Copierjpg_69b7b05080440.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313134926Copierjpg_69b7b04fe5e1c.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313134443Copierjpg_69b7b04fc7a77.jpg",
			"https://www.garagemendonca.com/public/img/big/20260313135536Copierjpg_69b7b050d5569.jpg",
		],
	},
	{
		id: "3",
		garageId: "garage-mendonca",
		brand: "Toyota",
		model: "AYGO",
		year: 2020,
		mileage: 32000,
		fuel: "Essence",
		price: 9900,
		transmission: "Automatique",
		power: 68,
		color: "Blanc",
		doors: 5,
		featured: true,
		critAir: "2",
		status: "published",
		createdAt: "2025-11-30",
		updatedAt: "2025-11-30T00:00:00Z",
		description:
			"Toyota AYGO boîte automatique, Crit'Air 2. Idéale en ville, très économique. Vérifiée en 160 points, 250 km parcourus avant mise en vente. Garantie 6 à 12 mois kilométrages illimités. Révision boîte automatique effectuée.",
		features: {
			Finition: "X-Play",
			Motorisation: "1.0 VVT-i 68 ch",
			Provenance: "Francaise",
			"Carnet d'entretien": "À jour",
			"Contrôle technique": "À jour",
			Garantie: "6 à 12 mois km illimités",
			"Nb propriétaires": "1",
		},
		options: {
			// Sécurité
			abs: true,
			esp: true,
			airbags: true,
			airbags_lateraux: true,
			isofix: true,
			// Intérieur & Confort
			climatisation: true,
			vitres_electriques_avant: true,
			fermeture_centralisee: true,
			sieges_rabattables: true,
			// Multimédia
			bluetooth: true,
			usb: true,
			// Motorisation
			boite_automatique: true,
			start_stop: true,
		},
		images: [
			"https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
			"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
		],
	},
	{
		id: "2",
		garageId: "garage-mendonca",
		brand: "Nissan",
		model: "Micra",
		year: 2019,
		mileage: 48000,
		fuel: "Essence",
		price: 10500,
		transmission: "Automatique",
		power: 88,
		color: "Gris Métallisé",
		doors: 5,
		featured: true,
		critAir: "2",
		status: "published",
		createdAt: "2025-12-15",
		updatedAt: "2025-12-15T00:00:00Z",
		description:
			"Nissan Micra 1.4 88 ch Acenta, boîte automatique, Crit'Air 2. Véhicule francais, bien entretenu, carnet à jour. Vérification en 160 points, 250 km parcourus avant mise en vente. Garantie 6 à 12 mois km illimités. Révision boîte automatique incluse.",
		features: {
			Finition: "Acenta",
			Motorisation: "1.4 88 ch",
			Provenance: "Francaise",
			"Carnet d'entretien": "À jour",
			"Contrôle technique": "À jour",
			Garantie: "6 à 12 mois km illimités",
			"Nb propriétaires": "1",
		},
		options: {
			// Sécurité
			abs: true,
			esp: true,
			airbags: true,
			airbags_lateraux: true,
			detection_pression_pneus: true,
			isofix: true,
			// Aides à la conduite
			regulateur_vitesse: true,
			limiteur_vitesse: true,
			camera_recul: true,
			radar_arriere: true,
			// Extérieur
			jantes_alliage: true,
			taille_jantes: 16,
			feux_led: true,
			retroviseurs_electriques: true,
			// Intérieur & Confort
			climatisation_automatique: true,
			vitres_electriques_avant: true,
			vitres_electriques_arriere: true,
			fermeture_centralisee: true,
			commande_au_volant: true,
			sieges_rabattables: true,
			// Multimédia
			ecran_tactile: true,
			bluetooth: true,
			usb: true,
			// Motorisation
			boite_automatique: true,
			start_stop: true,
		},
		images: [
			"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
			"https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&q=80",
		],
	},
	{
		id: "4",
		garageId: "garage-mendonca",
		brand: "Nissan",
		model: "Pixo",
		year: 2017,
		mileage: 65000,
		fuel: "Essence",
		price: 7900,
		transmission: "Automatique",
		power: 68,
		color: "Argent",
		doors: 5,
		featured: true,
		critAir: "2",
		status: "published",
		createdAt: "2026-02-05",
		updatedAt: "2026-02-05T00:00:00Z",
		description:
			"Nissan Pixo 1.0i 68 ch Acenta, boîte automatique, 1ère main. Petite citadine très maniable, faible consommation. Entretien complet réalisé par notre atelier. Garantie 6 à 12 mois km illimités, vérification 160 points.",
		features: {
			Finition: "Acenta",
			Motorisation: "1.0i 68 ch",
			Provenance: "Francaise",
			"Nb propriétaires": "1",
			"Carnet d'entretien": "À jour",
			"Contrôle technique": "À jour",
			Garantie: "6 à 12 mois km illimités",
		},
		options: {
			// Sécurité
			abs: true,
			esp: true,
			airbags: true,
			// Intérieur & Confort
			climatisation: true,
			vitres_electriques_avant: true,
			fermeture_centralisee: true,
			sieges_rabattables: true,
			// Motorisation
			boite_automatique: true,
			start_stop: true,
		},
		images: [
			"https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
			"https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
		],
	},
	{
		id: "5",
		garageId: "garage-mendonca",
		brand: "Mitsubishi",
		model: "Space Star",
		year: 2014,
		mileage: 79900,
		fuel: "Essence",
		price: 9990,
		transmission: "Automatique",
		power: 80,
		color: "Non précisé",
		doors: 5,
		featured: false,
		critAir: "2",
		status: "published",
		createdAt: "2026-02-25",
		updatedAt: "2026-02-25T00:00:00Z",
		description: `
Mitsubishi Space Star 1.2i 80 ch TOP / Boîte Automatique & 1ère Main !

Notre enseigne met en vente ce magnifique véhicule qui possède 79 900 kms du 14/10/2014. Il possède la finition TOP. Moteur 80 ch (5cv) associé à une boîte automatique.

Ce véhicule bénéficie d'une garantie de 6 mois complète, couvrant tous les composants mécaniques et électroniques, comme un véhicule neuf.

Carrosserie : Bon état général. Photos supplémentaires et vidéo en cours de préparation.

Autres notes : Véhicule en cours de roulage, idéal pour la ville et jeunes permis en boîte automatique.
	`,
		features: {
			Finition: "TOP",
			Motorisation: "1.2i 80 ch",
			Provenance: "Non précisé",
			"Carnet d'entretien": "À jour",
			"Contrôle technique": "À jour",
			Garantie: "6 mois complète",
		},
		/* ── Options structurées (nouveau système) ──────────────────────────────
		 * Mappées depuis la fiche d'origine (tableau PascalCase converti en snake_case).
		 * Utilisées par VehicleOptionsDisplay côté public.
		 * ─────────────────────────────────────────────────────────────────── */
		options: {
			// Extérieur
			jantes_alliage: true,
			feux_automatiques: true,       // DetecteurDeLuminosite
			retroviseurs_electriques: true,
			// Intérieur & Confort
			vitres_electriques_avant: true,
			vitres_electriques_arriere: true,
			fermeture_centralisee: true,
			ouverture_sans_cle: true,
			demarrage_sans_cle: true,
			climatisation_automatique: true,
			sieges_chauffants: true,
			commande_au_volant: true,
			sieges_rabattables: true,
			essuie_glaces_automatiques: true, // DetecteurDePluie
			// Multimédia
			bluetooth: true,               // RadioCDMP3 + KitMainLibreBluetooth
			prise_12v: true,
			// Aides à la conduite
			regulateur_vitesse: true,
			// Motorisation
			boite_automatique: true,
		},
		images: [
			"https://www.garagemendonca.com/public/img/big/20251031153752Copierjpg_6904f66ac72c3.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031154515Copierjpg_6904f67d5ad63.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031154945Copierjpg_6904f67db91b5.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031154558Copierjpg_6904f67deabc4.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031153950Copierjpg_6904f67d3a012.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031155012Copierjpg_6904f67d7c715.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031153647Copierjpg_6904f66a8b49d.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031154750Copierjpg_6904f66b3be56.jpg",
			"https://www.garagemendonca.com/public/img/big/20251031154413Copierjpg_6904f66b07179.jpg",
		],
	},
	{
		id: "6",
		garageId: "garage-mendonca",
		brand: "Hyundai",
		model: "i10",
		year: 2018,
		mileage: 58000,
		fuel: "Essence",
		price: 8900,
		transmission: "Automatique",
		power: 67,
		color: "Blanc",
		doors: 5,
		featured: false,
		critAir: "2",
		status: "sold",
		createdAt: "2026-03-10",
		updatedAt: "2026-03-10T00:00:00Z",
		description:
			"Hyundai i10 boîte automatique. Légère, économique et facile à garer. Parfaite pour la ville et les trajets courts. Véhicule contrôlé et révisé par notre atelier, prêt à rouler. Garantie 6 à 12 mois km illimités.",
		features: {
			Motorisation: "1.0i 67 ch",
			Provenance: "Francaise",
			"Carnet d'entretien": "À jour",
			"Contrôle technique": "À jour",
			Garantie: "6 à 12 mois km illimités",
		},
		options: {
			// Sécurité
			abs: true,
			esp: true,
			airbags: true,
			airbags_lateraux: true,
			isofix: true,
			// Intérieur & Confort
			climatisation_automatique: true,
			vitres_electriques_avant: true,
			fermeture_centralisee: true,
			commande_au_volant: true,
			sieges_rabattables: true,
			// Multimédia
			bluetooth: true,
			usb: true,
			// Motorisation
			boite_automatique: true,
			start_stop: true,
		},
		images: [
			"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
			"https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80",
		],
	},
	{
		id: "7",
		garageId: "garage-mendonca",
		brand: "Peugeot",
		model: "107",
		year: 2007,
		mileage: 76500,
		fuel: "Essence",
		price: 6500,
		transmission: "Automatique",
		power: 68,
		color: "Gris Gallium (KTB)",
		doors: 5,
		featured: true,
		critAir: "2",
		status: "published",
		sold_at: "2026-03-01T00:00:00Z",
		createdAt: "2007-06-07",
		updatedAt: "2026-03-01T00:00:00Z",
		description: `
Peugeot 107 1.0i 68 ch finition Trendy, boîte automatique à 5 rapports, mise en circulation le 07/06/2007 avec 76 500 km. Couleur Gris Gallium (KTB).

Garantie : 6 mois complète couvrant l’ensemble des composants mécaniques et électroniques.

Mécanique : Entretien réalisé pour la vente
- Révision complète (huile, filtres, bougies)
- Révision de la boîte automatique
- Remplacement de 2 pneus avant
- Disques et plaquettes de frein avant

Carrosserie : Bon état général. Photos supplémentaires et vidéo disponibles prochainement.

Autres notes : Véhicule en cours de roulage. Idéal pour la ville et pour jeune permis en boîte automatique.
`,
		features: {
			finition: "Trendy",
			motorisation: "1.0i 68 ch (4cv)",
			provenance: "Française",
			carnetEntretien: "Entretien à jour",
			controleTechnique: "À jour",
			garantie: "6 mois complète",
		},
		options: {
			// Sécurité
			abs: true,
			airbags: true,
			// Intérieur & Confort
			vitres_electriques_avant: true,
			fermeture_centralisee: true,
			sieges_rabattables: true,
			// Multimédia
			prise_12v: true,
			// Motorisation
			boite_automatique: true,
		},
		images: [
			"https://www.garagemendonca.com/public/img/big/20251119144533Copierjpg_691ee9050666b.jpg",
			"https://www.garagemendonca.com/public/img/big/20251119144426Copierjpg_691ee904ca3a1.jpg",
			"https://www.garagemendonca.com/public/img/big/20251119144630Copierjpg_691ee90535b65.jpg",
			"https://www.garagemendonca.com/public/img/big/20251119144718Copierjpg_691ee9047e6b4.jpg",
			"https://www.garagemendonca.com/public/img/big/20251119144802Copierjpg_691ee905772c2.jpg",
			"https://www.garagemendonca.com/public/img/big/20251119144650Copierjpg_691ee904a2301.jpg",
		],
	},
	{
		id: "8",
		garageId: "garage-mendonca",
		brand: "Citroën",
		model: "C1",
		year: 2020,
		mileage: 22000,
		fuel: "Hybride",
		price: 10900,
		transmission: "Automatique",
		power: 72,
		color: "Gris",
		doors: 5,
		featured: false,
		critAir: "2",
		status: "published",
		createdAt: "2026-03-18",
		updatedAt: "2026-03-18T00:00:00Z",
		description:
			"Citroën C1 boîte automatique. En cours de préparation, disponible prochainement.",
		features: {
			Motorisation: "1.2i 72 ch",
			Provenance: "Francaise",
			Garantie: "6 à 12 mois km illimités",
		},
		options: {
			// Sécurité
			abs: true,
			esp: true,
			airbags: true,
			isofix: true,
			// Intérieur & Confort
			climatisation: true,
			vitres_electriques_avant: true,
			fermeture_centralisee: true,
			commande_au_volant: true,
			// Multimédia
			bluetooth: true,
			usb: true,
			// Motorisation
			boite_automatique: true,
			start_stop: true,
		},
		images: [
			"https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
		],
	},
];

/** Identifiant du garage actif — même valeur que ACTIVE_GARAGE_ID dans lib/config/garage.ts */
const GARAGE_ID = "garage-mendonca";

// ── Steps, pricing, faq, testimonials partagés ────────────────────────────
const stepsEntretien: ServiceStep[] = [
	{
		order: 1,
		title: "Dépôt du véhicule",
		description: "Sans rendez-vous ou sur rendez-vous. Accueil en atelier dès 8h.",
	},
	{
		order: 2,
		title: "Diagnostic offert",
		description: "Bilan visuel complet et lecture des codes défaut en 10 minutes.",
	},
	{
		order: 3,
		title: "Devis transparent",
		description: "Présentation du devis pièce et main-d'œuvre avant toute intervention.",
	},
	{
		order: 4,
		title: "Travaux",
		description: "Réalisés selon les préconisations constructeur, pièces qualifiées.",
	},
	{
		order: 5,
		title: "Restitution",
		description: "Test sur route, nettoyage du véhicule, facturation détaillée.",
	},
];

const pricingEntretien: ServicePricing[] = [
	{ label: "Vidange + filtre huile", price: "à partir de 79 € TTC" },
	{ label: "Révision complète", price: "à partir de 149 € TTC" },
	{ label: "Courroie de distribution", price: "à partir de 299 € TTC" },
	{ label: "Contrôle technique", price: "Sur devis", note: "Préparation incluse" },
	{ label: "Recharge climatisation", price: "à partir de 99 € TTC" },
	{ label: "4 pneus posés équilibrés", price: "Sur devis", note: "Toutes marques" },
];

const faqEntretien: ServiceFAQItem[] = [
	{
		question: "Mon véhicule est-il trop ancien pour être entretenu chez vous ?",
		answer: "Non. Nous intervenons sur tous les véhicules toutes marques, quels que soient leur âge ou leur kilométrage. Nous sommes spécialisés dans les japonaises et les boîtes automatiques, mais nous accueillons toutes les marques.",
	},
	{
		question: "Puis-je avoir un devis avant l'intervention ?",
		answer: "Oui, c'est systématique. Nous ne commençons aucun travail sans votre accord écrit sur le devis. Prix pièce et main-d'œuvre détaillés à l'avance.",
	},
	{
		question: "Avez-vous des véhicules de prêt ?",
		answer: "Oui, jusqu'à 9 véhicules de prêt sont disponibles (sous réserve de disponibilité) pour que vous puissiez continuer vos déplacements pendant l'intervention.",
	},
	{
		question: "L'entretien fait chez vous est-il compatible avec la garantie constructeur ?",
		answer: "Oui. Nous respectons strictement les préconisations constructeur et utilisons des pièces de qualité équivalente OEM. L'entretien n'invalide pas votre garantie constructeur.",
	},
];

const testimonialsEntretien: ServiceTestimonial[] = [
	{
		author: "Laurent M.",
		location: "Drémil-Lafage",
		date: "janvier 2025",
		rating: 5,
		content: "Vidange + révision faite en 1h30 chrono, devis respecté au centime. Je reviens depuis 4 ans, jamais de mauvaise surprise.",
	},
	{
		author: "Sophie V.",
		location: "Montrabé",
		date: "mars 2025",
		rating: 5,
		content: "Ils m'ont prêté un véhicule pendant 2 jours pour la révision complète. Accueil très agréable, travail sérieux et propre.",
	},
	{
		author: "Ahmed B.",
		location: "Toulouse",
		date: "novembre 2024",
		rating: 5,
		content: "Courroie de distribution changée sur ma Toyota. Devis clair, pas de surprise. Je recommande vivement.",
	},
];

const stepsMecanique: ServiceStep[] = [
	{
		order: 1,
		title: "Prise en charge",
		description: "Accueil de votre véhicule et description du problème constaté.",
	},
	{
		order: 2,
		title: "Diagnostic électronique",
		description: "Lecture des codes défaut OBD en 10 minutes, bilan des actionneurs.",
	},
	{
		order: 3,
		title: "Devis pièce & main-d'œuvre",
		description: "Chiffrage détaillé avant de commencer — aucun frais caché.",
	},
	{
		order: 4,
		title: "Réparation",
		description: "Intervention par nos mécaniciens qualifiés, spécialistes japonaises & boîtes auto.",
	},
	{
		order: 5,
		title: "Contrôle final",
		description: "Essai sur route, vérification complète et restitution du véhicule propre.",
	},
];

const pricingMecanique: ServicePricing[] = [
	{ label: "Diagnostic OBD", price: "Offert", note: "En moins de 10 min" },
	{ label: "Embrayage", price: "Sur devis", note: "Toutes marques" },
	{ label: "Révision boîte automatique", price: "Sur devis" },
	{ label: "Réparation électronique", price: "Sur devis", note: "À coût maîtrisé" },
	{ label: "Mise au point moteur", price: "Sur devis" },
	{ label: "Suspensions complètes", price: "Sur devis" },
];

const faqMecanique: ServiceFAQItem[] = [
	{
		question: "Êtes-vous vraiment spécialisés dans les boîtes automatiques ?",
		answer: "Oui, c'est notre expertise principale depuis 2001. Nous réalisons des vidanges de boîtes automatiques, des révisions complètes et des réparations de boîtes CVT, DSG et conventionnelles sur toutes marques japonaises.",
	},
	{
		question: "Pouvez-vous réparer des pièces électroniques sans les remplacer ?",
		answer: "Dans de nombreux cas, oui. Nous sommes équipés pour réparer des calculateurs, des modules de confort et d'autres composants électroniques à un coût bien inférieur au remplacement.",
	},
	{
		question: "Intervenez-vous sur toutes les marques ou seulement les japonaises ?",
		answer: "Nous intervenons sur toutes les marques. Notre expertise poussée sur les japonaises (Toyota, Nissan, Suzuki, Honda, Mazda, Mitsubishi) nous permet d'aller plus loin sur ces modèles, mais nous sommes pleinement équipés pour les européennes et les coréennes.",
	},
	{
		question: "Combien de temps dure une réparation mécanique ?",
		answer: "Cela dépend de la réparation. Un diagnostic prend 10 minutes. Une réparation courante (embrayage, boîte auto) prend généralement 1 à 2 jours. Un véhicule de prêt est disponible si besoin.",
	},
];

const testimonialsMecanique: ServiceTestimonial[] = [
	{
		author: "Pierre D.",
		location: "Balma",
		date: "février 2025",
		rating: 5,
		content: "Boîte automatique révisée sur ma Nissan Micra. Diagnostic rapide, tarif raisonnable, véhicule de prêt fourni. Tout roule depuis 8 000 km.",
	},
	{
		author: "Fatima R.",
		location: "Toulouse",
		date: "décembre 2024",
		rating: 5,
		content: "Réparation calculateur évitée grâce à leur expertise en électronique. 3 fois moins cher que chez le concessionnaire. Très professionnel.",
	},
];

const stepsCarrosserie: ServiceStep[] = [
	{
		order: 1,
		title: "Évaluation du sinistre",
		description: "Inspection visuelle et photos du dommage, prise en charge du dossier assurance si besoin.",
	},
	{
		order: 2,
		title: "Expertise & chiffrage",
		description: "Devis détaillé transmis à votre assurance ou directement pour les petites réparations.",
	},
	{
		order: 3,
		title: "Prise en charge",
		description: "Remise du véhicule de courtoisie, début des travaux en cabine de peinture.",
	},
	{
		order: 4,
		title: "Carrosserie & peinture",
		description: "Tôlerie, redressage, peinture en cabine climatisée — finition irréprochable.",
	},
	{
		order: 5,
		title: "Restitution",
		description: "Nettoyage intérieur et extérieur complet, restitution du véhicule comme neuf.",
	},
];

const pricingCarrosserie: ServicePricing[] = [
	{ label: "Petite bosse / éraflure", price: "Sur devis", note: "Dès 90 € selon dommage" },
	{ label: "Pare-brise", price: "Sur devis", note: "Prise en charge assurance possible" },
	{ label: "Lunette arrière", price: "Sur devis" },
	{ label: "Véhicule de courtoisie", price: "Gratuit ou 16 € HT/j", note: "Selon durée" },
	{ label: "Location utilitaire", price: "Sur devis", note: "Déménagement, déplacements pro" },
	{ label: "Nettoyage après carrosserie", price: "Inclus" },
];

const faqCarrosserie: ServiceFAQItem[] = [
	{
		question: "Prenez-vous en charge le dossier assurance ?",
		answer: "Oui, intégralement. Nous gérons les démarches avec votre assurance, de l'expertise au règlement, sans que vous ayez à vous en occuper.",
	},
	{
		question: "Ma voiture est grêlée, pouvez-vous la réparer ?",
		answer: "Oui, c'est une spécialité de notre atelier. Nous traitons les véhicules grêlés en débosselage sans peinture (PDR) ou en peinture complète selon l'étendue des dommages.",
	},
	{
		question: "Intervenez-vous sur les pare-brise de tous les véhicules ?",
		answer: "Oui, pare-brise et lunettes arrière toutes marques, particuliers et utilitaires. Nous pouvons prendre en charge votre assurance pare-brise si vous en disposez.",
	},
	{
		question: "Faut-il prendre rendez-vous pour un devis carrosserie ?",
		answer: "Non, vous pouvez vous présenter directement. Nous évaluons le dommage sur place et vous remettons un devis immédiatement ou sous 24h pour les cas complexes.",
	},
];

const testimonialsCarrosserie: ServiceTestimonial[] = [
	{
		author: "Nathalie C.",
		location: "Drémil-Lafage",
		date: "mars 2025",
		rating: 5,
		content: "Pare-brise remplacé en 2h, dossier assurance géré par le garage. Rien à faire de mon côté, impeccable.",
	},
	{
		author: "Julien P.",
		location: "Quint-Fonsegrives",
		date: "janvier 2025",
		rating: 5,
		content: "Carrosserie avant refaite après un choc. Peinture parfaite, on ne voit plus rien. Véhicule rendu propre à l'intérieur aussi.",
	},
	{
		author: "Marie-Hélène T.",
		location: "Toulouse",
		date: "novembre 2024",
		rating: 4,
		content: "Très bien pour les petites bosses. Devis clair, délai respecté. Véhicule de prêt fourni sans supplément.",
	},
];

export const services: Service[] = [
	{
		id: "entretien",
		slug: "entretien",
		order: 1,
		is_active: true,
		title: "Entretien & Révision",
		icon: "wrench",
		short_description:
			"Service de proximité pour tous véhicules toutes marques. Préconisations constructeur toujours respectées.",
		long_description:
			"Depuis 2001, le Garage Mendonca assure l'entretien de tous les véhicules avec un service de proximité et une qualité constante. Spécialistes des marques japonaises (Toyota, Nissan, Suzuki, Honda, Mazda…) et des boîtes automatiques. Accueil adapté aux jeunes conducteurs, seniors et personnes à mobilité réduite. Les préconisations constructeur sont toujours respectées.",
		features: [
			"Vidange huile moteur & remplacement filtres",
			"Révision garantie constructeur",
			"Remplacement courroie de distribution",
			"Préparation contrôle technique",
			"Pneus toutes marques — équipement Facom",
			"Climatisation — recharge, filtre pollen, traitement antibactérien",
			"Changement d'amortisseurs toutes marques",
			"Remplacement disques, plaquettes de freins & batterie",
		],
		steps: stepsEntretien,
		pricing: pricingEntretien,
		faq: faqEntretien,
		testimonials: testimonialsEntretien,
		images: [
			{
				id: "img-entretien-1",
				service_id: "entretien",
				garage_id: GARAGE_ID,
				url: "/images/entretien.webp",
				alt: "Entretien véhicule au Garage Mendonca",
				order: 1,
				is_primary: true,
			},
		],
	},
	{
		id: "mecanique",
		slug: "mecanique",
		order: 2,
		is_active: true,
		title: "Réparation Mécanique & Électronique",
		icon: "settings",
		short_description:
			"Spécialiste véhicules japonais et boîtes automatiques. Réparation électronique à coût maîtrisé, devis avant intervention.",
		long_description:
			"À la fois généraliste et expert, le Garage Mendonca intervient sur l'entretien courant comme sur les réparations les plus techniques. Spécialistes des véhicules japonais (Toyota, Nissan, Suzuki, Honda…) et des boîtes automatiques, nos mécaniciens qualifiés assurent le meilleur service. Réparation de pièces électroniques automobiles à coût maîtrisé.",
		features: [
			"Réparation moteur, embrayage & boîte de vitesses",
			"Suspensions, direction et amortisseurs",
			"Réparation pièces électroniques automobiles",
			"Spécialiste japonaises · boîte automatique",
			"Réparation boîte de vitesse automatique",
			"Mise au point moteur",
			"Devis pièce & main-d'œuvre avant toute intervention",
			"Véhicule de prêt disponible",
		],
		steps: stepsMecanique,
		pricing: pricingMecanique,
		faq: faqMecanique,
		testimonials: testimonialsMecanique,
		images: [
			{
				id: "img-mecanique-1",
				service_id: "mecanique",
				garage_id: GARAGE_ID,
				url: "/images/mecanique.webp",
				alt: "Réparation mécanique au Garage Mendonca",
				order: 1,
				is_primary: true,
			},
		],
	},
	{
		id: "carrosserie",
		slug: "carrosserie",
		order: 3,
		is_active: true,
		title: "Carrosserie, Vitrage & Services",
		icon: "paintbrush",
		short_description:
			"Nouvelle cabine de peinture. Tôlerie, collision, pare-brise toutes marques. Véhicule de courtoisie inclus.",
		long_description:
			"Le Garage Mendonca a investi dans une toute nouvelle cabine de peinture pour des finitions irréprochables. Spécialisé dans les petits travaux de tôlerie et la simple collision, toutes marques. Remplacement de pare-brise et lunette arrière pour particuliers et utilitaires. Véhicule de courtoisie disponible, dossier assurance pris en charge intégralement.",
		features: [
			"Tôlerie, peinture, réparation plastiques — cabine neuve",
			"Pare-brise & lunette arrière (particuliers et utilitaires)",
			"Rénovation optiques et phares",
			"Prise en charge véhicule grêlé",
			"Dossier assurance & expertise sinistre",
			"Véhicule de courtoisie (gratuit ou 16 € HT/j)",
			"Location de véhicules (déménagements, déplacements pro)",
			"Nettoyage intérieur & extérieur inclus après carrosserie",
		],
		steps: stepsCarrosserie,
		pricing: pricingCarrosserie,
		faq: faqCarrosserie,
		testimonials: testimonialsCarrosserie,
		images: [
			{
				id: "img-carrosserie-1",
				service_id: "carrosserie",
				garage_id: GARAGE_ID,
				url: "/images/carrosserie.webp",
				alt: "Carrosserie et peinture au Garage Mendonca",
				order: 1,
				is_primary: true,
			},
		],
	},
];
