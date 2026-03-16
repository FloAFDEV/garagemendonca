import type { Metadata } from "next";
import "./globals.css";
import StickyCallButton from "@/components/ui/StickyCallButton";

export const metadata: Metadata = {
  title: {
    default: "Garage Auto Mendonça — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente",
    template: "%s | Garage Auto Mendonça — Drémil-Lafage",
  },
  description:
    "Avec une expérience de plus de 30 ans, le Garage Mendonça est votre spécialiste de la mécanique, la carrosserie et la vente à Drémil-Lafage (31). Spécialiste BMW, Audi, Volkswagen. Diagnostic en 10 minutes. Appelez le 05 32 00 20 38.",
  keywords: [
    "garage automobile",
    "garagiste Drémil-Lafage",
    "réparation voiture",
    "mécanique",
    "carrosserie",
    "Drémil-Lafage",
    "Haute-Garonne",
    "Toulouse",
    "véhicules occasion boîte automatique",
    "spécialiste BMW Audi Volkswagen",
    "diagnostic électronique",
  ],
  openGraph: {
    title: "Garage Auto Mendonça — Spécialiste automobile Drémil-Lafage",
    description:
      "Avec une expérience de plus de 30 ans, le Garage Mendonça est votre spécialiste de la mécanique, la carrosserie et la vente en région toulousaine.",
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
