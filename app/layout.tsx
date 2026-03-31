import type { Metadata } from "next";
import "./globals.css";
import SkipToContent from "@/components/ui/SkipToContent";

export const metadata: Metadata = {
	title: {
		default:
			"Garage Auto Mendonça — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente",
		template: "%s | Garage Auto Mendonça — Drémil-Lafage",
	},
	description:
		"Garage auto à Drémil-Lafage (31) — Mécanique, carrosserie, diagnostic et vente VO depuis 2001. Spécialiste japonaises, boîte automatique. Diagnostic en 10 min, devis gratuit, 9 véhicules de prêt. ☎ 05 32 00 20 38.",
	keywords: [
		"garage automobile Drémil-Lafage",
		"garagiste Toulouse",
		"réparation voiture 31",
		"mécanique japonaises boîte automatique",
		"carrosserie peinture",
		"diagnostic OBD",
		"occasions boîte automatique",
		"devis gratuit mécanique",
		"contrôle technique",
		"filtre à particules DPF",
	],
	openGraph: {
		title: "Garage Auto Mendonça — Spécialiste automobile Drémil-Lafage",
		description:
			"Garage auto à Drémil-Lafage (31) depuis 2001. Mécanique, carrosserie, vente VO. Spécialiste japonaises · boîte automatique. Diagnostic en 10 min.",
		type: "website",
		locale: "fr_FR",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "AutoRepair",
	name: "Garage Auto Mendonça",
	description:
		"Spécialiste de la mécanique, carrosserie et vente de véhicules d'occasion japonais à boîte automatique à Drémil-Lafage depuis 2001.",
	url: "https://www.garagemendonça.com",
	telephone: "+33532002038",
	email: "contact@garagemendonça.com",
	address: {
		"@type": "PostalAddress",
		streetAddress: "6 Avenue de la Mouyssaguese",
		addressLocality: "Drémil-Lafage",
		postalCode: "31280",
		addressCountry: "FR",
	},
	geo: {
		"@type": "GeoCoordinates",
		latitude: 43.6039,
		longitude: 1.5842,
	},
	openingHoursSpecification: [
		{
			"@type": "OpeningHoursSpecification",
			dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
			opens: "08:00",
			closes: "19:00",
		},
		{
			"@type": "OpeningHoursSpecification",
			dayOfWeek: ["Friday"],
			opens: "08:00",
			closes: "18:00",
		},
	],
	priceRange: "€€",
	currenciesAccepted: "EUR",
	paymentAccepted: "Cash, Credit Card",
	areaServed: [
		{ "@type": "City", name: "Drémil-Lafage" },
		{ "@type": "City", name: "Toulouse" },
		{ "@type": "AdministrativeArea", name: "Haute-Garonne" },
	],
	hasOfferCatalog: {
		"@type": "OfferCatalog",
		name: "Services automobiles",
		itemListElement: [
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "Entretien & Révision",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "Réparation Mécanique",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Service",
					name: "Carrosserie & Peinture",
				},
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<head>
				{/* Anti-FOUC : applique le thème admin avant tout paint */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('admin-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})();`,
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body>
				<SkipToContent />
				{children}
			</body>
		</html>
	);
}
