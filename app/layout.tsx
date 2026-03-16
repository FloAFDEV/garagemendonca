import type { Metadata } from "next";
import "./globals.css";
import StickyCallButton from "@/components/ui/StickyCallButton";

export const metadata: Metadata = {
  title: {
    default: "Garage Auto Mendonca — Réparation & Vente de Véhicules à Drémil-Lafage",
    template: "%s | Garage Auto Mendonca",
  },
  description:
    "Garage automobile indépendant depuis 30 ans à Drémil-Lafage (31). Entretien, réparation mécanique, carrosserie, diagnostic et vente de véhicules d'occasion. Spécialiste BMW, Audi, Volkswagen. Appelez le 05 32 00 20 38.",
  keywords: [
    "garage automobile",
    "réparation voiture",
    "mécanique",
    "carrosserie",
    "Drémil-Lafage",
    "Toulouse",
    "véhicules occasion",
    "BMW",
    "Audi",
    "Volkswagen",
    "boîte automatique",
  ],
  openGraph: {
    title: "Garage Auto Mendonca — Expert automobile depuis 30 ans",
    description: "Entretien, réparation et vente de véhicules à Drémil-Lafage. Spécialiste BMW, Audi, VW.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <StickyCallButton />
      </body>
    </html>
  );
}
