import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Occasions",
  description:
    "Nos véhicules d'occasion boîte automatique à Drémil-Lafage (31). Inspectés en 160 points, révisés et garantis 6 à 12 mois km illimités. Financement et reprise étudiés. ☎ 05 32 00 20 38.",
  keywords: [
    "occasions boîte automatique",
    "voiture occasion Drémil-Lafage",
    "VO garantis Toulouse",
    "véhicule occasion garanti",
    "Toyota Nissan Suzuki occasion 31",
  ],
  openGraph: {
    title: "Occasions — Garage Auto Mendonça",
    description:
      "Véhicules d'occasion révisés & garantis à Drémil-Lafage. Boîte automatique, toutes marques. Financement et reprise disponibles.",
  },
};

export default function VehiculesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
