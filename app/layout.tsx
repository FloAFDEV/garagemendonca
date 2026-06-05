import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

/**
 * next/font/google — auto-hosted, zero external request, élimine le render-blocking.
 * `variable` injecte des CSS custom props (--font-inter, --font-manrope)
 * que Tailwind utilise via fontFamily dans tailwind.config.ts.
 * `display: "swap"` évite le FOIT (flash invisible text) pendant le chargement.
 */
const inter = Inter({
	subsets: ["latin"],
	weight: ["300", "400", "500"],
	variable: "--font-inter",
	display: "swap",
});

const manrope = Manrope({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600"],
	variable: "--font-manrope",
	display: "swap",
});
import SkipToContent from "@/components/ui/SkipToContent";
import { QueryProvider } from "@/providers/QueryProvider";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import CookieBanner from "@/components/cookies/CookieBanner";
import CookieLayer from "@/components/cookies/CookieLayer";
import Analytics from "@/components/analytics/Analytics";
import { GOOGLE_CONSENT_INIT_SCRIPT } from "@/lib/consent/googleConsent";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.garagemendonca.com",
	),
	title: {
		default:
			"Garage Auto Mendonca — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente",
		template: "%s | Garage Auto Mendonca — Drémil-Lafage",
	},
	description:
		"Garage auto à Drémil-Lafage (31) — Mécanique, carrosserie, diagnostic et vente VO depuis 2003. Membre du réseau Top Garage. Spécialiste japonaises & boîte automatique. Prix transparents, 9 véhicules de prêt. ☎ 05 32 00 20 38.",
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
		"garage Top Garage Drémil-Lafage",
		"garage réseau Top Garage Toulouse Est",
		"entretien voiture réseau Top Garage",
	],
	// app/icon.png + app/apple-icon.png auto-détectés par Next.js App Router
	openGraph: {
		title: "Garage Auto Mendonca — Spécialiste automobile Drémil-Lafage",
		description:
			"Garage auto à Drémil-Lafage (31) depuis 2003. Membre du réseau Top Garage. Mécanique, carrosserie, vente VO. Spécialiste japonaises · boîte automatique.",
		type: "website",
		locale: "fr_FR",
		images: [{ url: "/images/og-image.webp", width: 1200, height: 630, alt: "Garage Auto Mendonca — Drémil-Lafage" }],
	},
};

/**
 * Viewport — séparé de metadata (Next.js 15 requirement).
 *
 * viewportFit: "cover" est OBLIGATOIRE pour que env(safe-area-inset-bottom)
 * fonctionne sur iPhone (home indicator / Dynamic Island).
 * Sans ce flag, env(safe-area-inset-bottom) = 0 même sur iPhone avec notch.
 */
export const viewport: Viewport = {
	width:        "device-width",
	initialScale: 1,
	viewportFit:  "cover", // prérequis safe-area-inset-* iOS
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "AutoRepair",
	name: "Garage Auto Mendonca",
	logo: "https://www.garagemendonca.com/images/logo-gm.webp",
	description:
		"Spécialiste de la mécanique, carrosserie et vente de véhicules d'occasion japonais à boîte automatique à Drémil-Lafage depuis 2003.",
	url: "https://www.garagemendonca.com",
	telephone: "+33532002038",
	email: "contact@garagemendonca.com",
	address: {
		"@type": "PostalAddress",
		streetAddress: "6 Avenue de la Mouyssaguese",
		addressLocality: "Drémil-Lafage",
		postalCode: "31280",
		addressCountry: "FR",
	},
	geo: {
		"@type": "GeoCoordinates",
		latitude: 43.5690,
		longitude: 1.5900,
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
	memberOf: {
		"@type": "Organization",
		name: "Top Garage",
		url: "https://garage.top-garage.fr/fr/france-FR/CUST-001176/garage-mendonca/details",
	},
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
		<html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${manrope.variable}`}>
			{/*
			 * Ordre des scripts dans <head> — NE PAS réordonner.
			 *
			 * ① Anti-FOUC (thème admin)
			 *    → doit s'exécuter avant tout paint pour éviter le flash
			 *    → lit localStorage, aucun réseau
			 *
			 * ② Google Consent Mode v2 init
			 *    → DOIT précéder tout chargement de GTM / GA4
			 *    → pose les signaux "denied" sur dataLayer
			 *    → GTM lira ces valeurs à son chargement
			 *    → aucun appel réseau (setup dataLayer uniquement)
			 *
			 * ③ JSON-LD SEO
			 *    → non bloquant, ordre peu importe mais ici par convention
			 *
			 * Les scripts GTM/GA4 sont chargés par Analytics.tsx
			 * avec strategy="afterInteractive" UNIQUEMENT après consentement.
			 * Ils s'exécutent donc APRÈS ①②③ et après l'hydration React.
			 */}
			<head>
				{/* Empêche iOS/Android de transformer numéros SIRET/codes en liens */}
				<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
				{/* ① Anti-FOUC : thème admin avant tout paint */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('admin-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})();`,
					}}
				/>
				{/* ② Google Consent Mode v2 — AVANT tout tag GTM/GA */}
				<script
					dangerouslySetInnerHTML={{ __html: GOOGLE_CONSENT_INIT_SCRIPT }}
				/>
				{/* ③ JSON-LD SEO */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
				/>
			</head>
			<body>
				<SkipToContent />
				<QueryProvider>
					<CookieConsentProvider>
						{children}
						<CookieBanner />
						<CookieLayer />
						<Analytics />
					</CookieConsentProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
