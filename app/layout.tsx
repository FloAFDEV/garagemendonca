import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Garage Auto Mendonca - Réparation & Vente de Véhicules à Drémil-Lafage",
    template: "%s | Garage Auto Mendonca",
  },
  description:
    "Garage automobile indépendant depuis 30 ans à Drémil-Lafage (31). Entretien, réparation mécanique, carrosserie, diagnostic et vente de véhicules d'occasion. Appelez le 05 32 00 20 38.",
  keywords: [
    "garage automobile",
    "réparation voiture",
    "mécanique",
    "carrosserie",
    "Drémil-Lafage",
    "Toulouse",
    "véhicules occasion",
  ],
  openGraph: {
    title: "Garage Auto Mendonca",
    description: "30 ans d'expertise automobile à Drémil-Lafage",
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
      <body>{children}</body>
    </html>
  );
}
