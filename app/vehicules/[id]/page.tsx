import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { vehicles } from "@/lib/data";
import {
  ArrowLeft,
  Phone,
  Calendar,
  Gauge,
  Fuel,
  Zap,
  DoorOpen,
  Palette,
  Settings2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import VehicleCard from "@/components/vehicles/VehicleCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) return { title: "Véhicule introuvable" };
  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.price.toLocaleString("fr-FR")} €`,
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.mileage.toLocaleString("fr-FR")} km — ${vehicle.color} — ${vehicle.price.toLocaleString("fr-FR")} €. ${vehicle.description.slice(0, 120)}`,
    openGraph: {
      images: [{ url: vehicle.images[0], width: 800, height: 600, alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}` }],
    },
  };
}

export async function generateStaticParams() {
  return vehicles.map((v) => ({ id: v.id }));
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) notFound();

  const related = vehicles.filter((v) => v.id !== id).slice(0, 3);

  const specs = [
    { Icon: Calendar,  label: "Année",       value: vehicle.year.toString() },
    { Icon: Gauge,     label: "Kilométrage", value: `${vehicle.mileage.toLocaleString("fr-FR")} km` },
    { Icon: Fuel,      label: "Carburant",   value: vehicle.fuel },
    { Icon: Zap,       label: "Puissance",   value: `${vehicle.power} ch` },
    { Icon: Settings2, label: "Boîte",       value: vehicle.transmission },
    { Icon: DoorOpen,  label: "Portes",      value: vehicle.doors.toString() },
    { Icon: Palette,   label: "Couleur",     value: vehicle.color },
  ];

  /* Données structurées JSON-LD véhicule + breadcrumb */
  const jsonLdCar = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": `${vehicle.brand} ${vehicle.model}`,
    "brand": { "@type": "Brand", "name": vehicle.brand },
    "modelDate": vehicle.year.toString(),
    "mileageFromOdometer": { "@type": "QuantitativeValue", "value": vehicle.mileage, "unitCode": "KMT" },
    "fuelType": vehicle.fuel,
    "vehicleTransmission": vehicle.transmission,
    "driveWheelConfiguration": "FWD",
    "numberOfDoors": vehicle.doors,
    "color": vehicle.color,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": vehicle.price,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "AutoDealer", "name": "Garage Auto Mendonça" },
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.garagemendonca.com/" },
      { "@type": "ListItem", "position": 2, "name": "Véhicules", "item": "https://www.garagemendonca.com/vehicules" },
      { "@type": "ListItem", "position": 3, "name": `${vehicle.brand} ${vehicle.model} ${vehicle.year}` },
    ],
  };

  return (
    <MainLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCar) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <div className="pt-24 bg-[#f8fafc] min-h-screen pb-24 sm:pb-0">
        <div className="container mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#475569]">
              <li><Link href="/" className="hover:text-brand-600 transition-colors">Accueil</Link></li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li><Link href="/vehicules" className="hover:text-brand-600 transition-colors">Véhicules</Link></li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              <li className="text-[#0f172a] font-medium truncate">{vehicle.brand} {vehicle.model} {vehicle.year}</li>
            </ol>
          </nav>

          {/* Lien retour */}
          <Link
            href="/vehicules"
            className="inline-flex items-center gap-2 text-[#475569] hover:text-brand-600 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour aux véhicules
          </Link>

          {/* H1 — au-dessus de la grille */}
          <div className="mb-8">
            <h1 className="font-heading font-black text-[#0f172a] text-3xl md:text-4xl">
              {vehicle.brand} {vehicle.model}
              <span className="text-[#64748b] font-semibold text-xl ml-3">{vehicle.year}</span>
            </h1>
            <p className="text-[#64748b] mt-2">
              {vehicle.color} · {vehicle.transmission} · {vehicle.fuel} · {vehicle.power} ch
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gauche : images + specs + description */}
            <div className="lg:col-span-2 space-y-6">

              {/* Image principale */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 shadow-xl">
                <Image
                  src={vehicle.images[0]}
                  alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.color}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {vehicle.featured && <Badge variant="orange">À la une</Badge>}
                  <Badge variant="green">{vehicle.fuel}</Badge>
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="grid grid-cols-3 gap-3" role="list" aria-label="Photos supplémentaires">
                  {vehicle.images.slice(1).map((img, idx) => (
                    <div
                      key={idx}
                      role="listitem"
                      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 shadow-sm"
                    >
                      <Image
                        src={img}
                        alt={`${vehicle.brand} ${vehicle.model} — photo ${idx + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 22vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Caractéristiques */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="font-heading font-bold text-[#0f172a] text-2xl mb-6">Caractéristiques</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 bg-[#f8fafc] rounded-xl p-4">
                      <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Icon size={16} className="text-brand-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b] font-medium">{label}</p>
                        <p className="text-[#0f172a] font-semibold text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="font-heading font-bold text-[#0f172a] text-2xl mb-4">Description</h2>
                <p className="text-[#475569] leading-relaxed">{vehicle.description}</p>
                <ul className="mt-6 grid grid-cols-2 gap-3" aria-label="Points forts">
                  {["Contrôle technique à jour", "Carnet d'entretien vérifié", "Révision effectuée", "Garantie incluse"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#334155]">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Droite : carte prix sticky */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:sticky lg:top-24">

                {/* Prix */}
                <div className="py-6 border-b border-slate-200 mb-6">
                  <div
                    className="font-heading font-black text-4xl text-[#0f172a]"
                    aria-label={`${vehicle.price.toLocaleString("fr-FR")} euros TTC`}
                  >
                    {vehicle.price.toLocaleString("fr-FR")}&nbsp;€
                  </div>
                  <p className="text-[#64748b] text-sm mt-1">Prix TTC · Financement disponible</p>
                </div>

                {/* Specs rapides */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { label: "Année", value: vehicle.year },
                    { label: "Km",    value: `${Math.round(vehicle.mileage / 1000)}k` },
                    { label: "Énergie", value: vehicle.fuel },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center bg-[#f8fafc] rounded-xl py-3">
                      <div className="font-bold text-[#0f172a] text-sm">{value}</div>
                      <div className="text-xs text-[#64748b]">{label}</div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <a href="tel:0532002038" className="btn-primary w-full justify-center">
                    <Phone size={17} aria-hidden="true" />
                    Appeler : 05 32 00 20 38
                  </a>
                  <Link
                    href={`/contact?vehicule=${encodeURIComponent(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`)}`}
                    className="btn-secondary w-full justify-center"
                  >
                    <MessageSquare size={17} aria-hidden="true" />
                    Poser une question
                  </Link>
                </div>

                {/* Réassurances */}
                <ul className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                  {["Essai possible sur rendez-vous", "Financement étudié ensemble", "Reprise de votre véhicule"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                      <CheckCircle2 size={14} className="text-brand-500 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Véhicules similaires */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading font-bold text-[#0f172a] text-2xl mb-8">Vous pourriez aussi aimer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA mobile sticky — masqué sur desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.10)]">
        <div className="flex-1">
          <p className="text-xs text-[#64748b] leading-none">Prix TTC</p>
          <p
            className="font-heading font-black text-xl text-[#0f172a]"
            aria-label={`${vehicle.price.toLocaleString("fr-FR")} euros`}
          >
            {vehicle.price.toLocaleString("fr-FR")} €
          </p>
        </div>
        <a href="tel:0532002038" className="btn-primary text-sm py-3 px-5 flex-shrink-0">
          <Phone size={16} aria-hidden="true" />
          Appeler
        </a>
        <Link
          href={`/contact?vehicule=${encodeURIComponent(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`)}`}
          className="btn-secondary text-sm py-3 px-5 flex-shrink-0"
        >
          <MessageSquare size={16} aria-hidden="true" />
          Message
        </Link>
      </div>
    </MainLayout>
  );
}
