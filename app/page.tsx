import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import ServicesOverview from "@/components/home/ServicesOverview";
import GalleryAtelier from "@/components/home/GalleryAtelier";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import MapContact from "@/components/home/MapContact";

export const metadata: Metadata = {
	// Titre absolu — pas de template appliqué sur la home
	title: {
		absolute:
			"Garage Auto Mendonca — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente",
	},
	description:
		"Garage auto à Drémil-Lafage (31) depuis 2003 — mécanique, carrosserie, diagnostic et vente VO. Spécialiste japonaises & boîte automatique. Prix transparents, 9 véhicules de prêt. ☎ 05 32 00 20 38.",
	alternates: {
		canonical: "https://www.garagemendonca.com",
	},
	openGraph: {
		title:
			"Garage Auto Mendonca — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente",
		description:
			"Votre garage de confiance depuis 2003 — mécanique, carrosserie, vente VO. Spécialiste japonaises & boîte automatique. Drémil-Lafage (31).",
		url: "https://www.garagemendonca.com",
		type: "website",
		locale: "fr_FR",
		siteName: "Garage Auto Mendonca",
	},
};

export default function HomePage() {
	return (
		<MainLayout>
			<Hero />
			<FeaturedVehicles />
			<ServicesOverview />
			<GalleryAtelier />
			<Testimonials />
			<CallToAction />
			<MapContact />
		</MainLayout>
	);
}
