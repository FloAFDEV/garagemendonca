import type { Metadata } from "next";
import "./globals.css";
import StickyCallButton from "@/components/ui/StickyCallButton";
import SkipToContent from "@/components/ui/SkipToContent";

export const metadata: Metadata = {
  title: {
    default: "Garage Auto Mendonça — Garagiste Drémil-Lafage (31) — Mécanique, Carrosserie, Vente",
    template: "%s | Garage Auto Mendonça — Drémil-Lafage",
  },
  description:
    "Garage auto à Drémil-Lafage (31) — Mécanique, carrosserie, diagnostic et vente VO depuis 1993. Spécialiste BMW, Audi, Volkswagen. Diagnostic en 10 min, devis gratuit, 9 véhicules de prêt. ☎ 05 32 00 20 38.",
  keywords: [
    "garage automobile Drémil-Lafage",
    "garagiste Toulouse",
    "réparation voiture 31",
    "mécanique BMW Audi Volkswagen",
    "carrosserie peinture",
    "diagnostic OBD",
    "véhicules occasion boîte automatique",
    "devis gratuit mécanique",
    "contrôle technique",
    "filtre à particules DPF",
  ],
  openGraph: {
    title: "Garage Auto Mendonça — Spécialiste automobile Drémil-Lafage",
    description:
      "Garage auto à Drémil-Lafage (31) depuis 1993. Mécanique, carrosserie, vente VO. Spécialiste BMW · Audi · Volkswagen · Mercedes. Diagnostic en 10 min.",
    type: "website",
    locale: "fr_FR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "Garage Auto Mendonça",
  "description": "Spécialiste de la mécanique, carrosserie et vente de véhicules d'occasion à Drémil-Lafage depuis 1993.",
  "url": "https://www.garagemendonca.com",
  "telephone": "+33532002038",
  "email": "contact@garagemendonca.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "6 Avenue de la Mouyssaguese",
    "addressLocality": "Drémil-Lafage",
    "postalCode": "31280",
    "addressCountry": "FR",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.6039,
    "longitude": 1.5842,
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "08:00",
      "closes": "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Friday"],
      "opens": "08:00",
      "closes": "18:00",
    },
  ],
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Cash, Credit Card",
  "areaServed": [
    { "@type": "City", "name": "Drémil-Lafage" },
    { "@type": "City", "name": "Toulouse" },
    { "@type": "AdministrativeArea", "name": "Haute-Garonne" },
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services automobiles",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Entretien & Révision" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Réparation Mécanique" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Carrosserie & Peinture" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diagnostic & Pannes" } },
    ],
  },
  "sameAs": [
    "https://www.facebook.com/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SkipToContent />
        {children}
        <StickyCallButton />
      </body>
    </html>
  );
}
