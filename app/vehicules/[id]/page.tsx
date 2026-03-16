import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { vehicles } from "@/lib/data";
import {
  ArrowLeft,
  Phone,
  Mail,
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
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.mileage.toLocaleString("fr-FR")} km — ${vehicle.price.toLocaleString("fr-FR")} €. ${vehicle.description.slice(0, 100)}...`,
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
    { Icon: Calendar, label: "Année", value: vehicle.year.toString() },
    { Icon: Gauge, label: "Kilométrage", value: `${vehicle.mileage.toLocaleString("fr-FR")} km` },
    { Icon: Fuel, label: "Carburant", value: vehicle.fuel },
    { Icon: Zap, label: "Puissance", value: `${vehicle.power} ch` },
    { Icon: Settings2, label: "Boîte", value: vehicle.transmission },
    { Icon: DoorOpen, label: "Portes", value: vehicle.doors.toString() },
    { Icon: Palette, label: "Couleur", value: vehicle.color },
  ];

  return (
    <MainLayout>
      <div className="pt-24 bg-dark-50 min-h-screen">
        <div className="container mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <Link
            href="/vehicules"
            className="inline-flex items-center gap-2 text-dark-500 hover:text-brand-600 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Retour aux véhicules
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: images + specs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main image */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-dark-200 shadow-xl">
                <Image
                  src={vehicle.images[0]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {vehicle.featured && <Badge variant="orange">⭐ À la une</Badge>}
                  <Badge variant="green">{vehicle.fuel}</Badge>
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {vehicle.images.slice(1).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dark-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <Image
                        src={img}
                        alt={`${vehicle.brand} ${vehicle.model} photo ${idx + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 22vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Specifications */}
              <div className="bg-white rounded-2xl border border-dark-100 p-8 shadow-sm">
                <h2 className="font-heading font-bold text-dark-900 text-2xl mb-6">
                  Caractéristiques
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 bg-dark-50 rounded-xl p-4"
                    >
                      <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 font-medium">{label}</p>
                        <p className="text-dark-900 font-semibold text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-dark-100 p-8 shadow-sm">
                <h2 className="font-heading font-bold text-dark-900 text-2xl mb-4">
                  Description
                </h2>
                <p className="text-dark-600 leading-relaxed">{vehicle.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    "Contrôle technique à jour",
                    "Carnet d'entretien vérifié",
                    "Révision effectuée",
                    "Garantie incluse",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-dark-700">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: price + contact */}
            <div className="space-y-5">
              {/* Price card */}
              <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-8 sticky top-24">
                <div className="mb-1">
                  <h1 className="font-heading font-black text-dark-900 text-3xl">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <p className="text-dark-400 mt-1">{vehicle.year} · {vehicle.color}</p>
                </div>

                <div className="py-6 border-y border-dark-100 my-6">
                  <div className="font-heading font-black text-4xl text-dark-900">
                    {vehicle.price.toLocaleString("fr-FR")}&nbsp;€
                  </div>
                  <p className="text-dark-400 text-sm mt-1">Prix TTC · Financement possible</p>
                </div>

                {/* Quick specs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { label: "Année", value: vehicle.year },
                    { label: "Km", value: `${Math.round(vehicle.mileage / 1000)}k` },
                    { label: "Énergie", value: vehicle.fuel },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center bg-dark-50 rounded-xl py-3">
                      <div className="font-bold text-dark-900 text-sm">{value}</div>
                      <div className="text-xs text-dark-400">{label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <a
                    href="tel:0561837805"
                    className="btn-primary w-full justify-center"
                  >
                    <Phone size={17} />
                    Appeler : 05 61 83 78 05
                  </a>
                  <Link
                    href={`/contact?vehicule=${encodeURIComponent(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`)}`}
                    className="btn-secondary w-full justify-center"
                  >
                    <MessageSquare size={17} />
                    Demander des infos
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-dark-100 space-y-2">
                  {[
                    "Essai possible sur rendez-vous",
                    "Financement étudié ensemble",
                    "Reprise de votre véhicule",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-dark-600">
                      <CheckCircle2 size={14} className="text-brand-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related vehicles */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading font-bold text-dark-900 text-2xl mb-8">
                Vous pourriez aussi aimer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
