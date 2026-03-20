import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehiclesCatalogue from "@/components/vehicles/VehiclesCatalogue";
import { getAllVehicles } from "@/lib/vehicles";
import { vehicles as allVehiclesRaw } from "@/lib/data";
import {
  ClipboardCheck,
  Wrench,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Véhicules d'occasion révisés & garantis",
  description:
    "Découvrez notre stock de véhicules d'occasion à Drémil-Lafage (31). Chaque voiture est inspectée en 160 points, révisée et garantie 6 à 12 mois. Financement et reprise.",
  openGraph: {
    title: "Occasions révisées & garanties — Garage Auto Mendonça",
    description:
      "Stock de véhicules d'occasion à Drémil-Lafage. Inspection 160 points, révision, garantie 6–12 mois, financement personnalisé.",
    type: "website",
  },
};

export default async function VehiculesPage() {
  const vehicles = await getAllVehicles();

  const allBrands = Array.from(new Set(allVehiclesRaw.map((v) => v.brand))).sort();
  const allFuels = Array.from(new Set(allVehiclesRaw.map((v) => v.fuel)));

  return (
    <MainLayout>
      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-36 pb-20 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-px bg-brand-500"
                aria-hidden="true"
              />
              <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
                Notre stock
              </span>
            </div>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Véhicules d&apos;occasion{" "}
              <span className="text-brand-500">
                révisés &amp; garantis
              </span>
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed max-w-2xl">
              Chaque véhicule est inspecté en 160 points, révisé et garanti 6
              à 12 mois kilométrage illimité. Financement et reprise étudiés
              ensemble.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Catalogue ── */}
      <section className="py-12 bg-[#f8fafc]">
        <Container>
          <VehiclesCatalogue
            vehicles={vehicles}
            allBrands={allBrands}
            allFuels={allFuels}
          />
        </Container>
      </section>

      {/* ── Bannière garanties ── */}
      <section className="py-12 bg-white border-t border-slate-200">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 text-center">
            {[
              { Icon: ClipboardCheck, label: "Contrôle technique récent" },
              { Icon: Wrench, label: "Révision complète effectuée" },
              { Icon: BookOpen, label: "Carnet d'entretien vérifié" },
              { Icon: ShieldCheck, label: "Garantie 6 à 12 mois km illimités" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <Icon
                    size={17}
                    className="text-brand-500"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <span className="font-semibold text-[#0f172a] text-sm">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
