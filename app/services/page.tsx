import type { Metadata } from "next";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { services } from "@/lib/data";
import {
  Wrench,
  Settings,
  Paintbrush,
  CircuitBoard,
  CircleCheck,
  Phone,
  ArrowRight,
  ClipboardCheck,
  Car,
  Shield,
  Award,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Mécanique, carrosserie, diagnostic et entretien à Drémil-Lafage (31). Spécialiste BMW, Audi, Volkswagen, Mercedes. Diagnostic OBD en 10 min, devis pièce & main-d'œuvre gratuit. Toutes marques.",
};

const iconMap: Record<string, React.ReactNode> = {
  wrench:     <Wrench        className="h-6 w-6 text-brand-500" aria-hidden="true" />,
  settings:   <Settings      className="h-6 w-6 text-brand-500" aria-hidden="true" />,
  cpu:        <CircuitBoard  className="h-6 w-6 text-brand-500" aria-hidden="true" />,
  paintbrush: <Paintbrush    className="h-6 w-6 text-brand-500" aria-hidden="true" />,
};

const trustCards = [
  { Icon: ClipboardCheck, title: "Devis gratuit",  sub: "Pièce & main-d'œuvre avant intervention" },
  { Icon: Car,            title: "Toutes marques", sub: "BMW · Audi · VW · Mercedes · Renault · PSA" },
  { Icon: Shield,         title: "Garantie",       sub: "6 à 12 mois km illimités (VO)" },
  { Icon: Award,          title: "160 points",     sub: "De contrôle sur chaque véhicule" },
];

export default function ServicesPage() {
  return (
    <MainLayout>

      {/* ── Hero — fond sombre ── */}
      <section className="relative bg-dark-900 overflow-hidden pt-36 pb-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/3 rounded-full blur-[180px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/2 rounded-full blur-[150px] pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            <span className="text-brand-500 text-xs font-medium tracking-wide uppercase">Nos expertises</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5">
            Mécanique, carrosserie &amp; vente<br />
            <span className="text-brand-400">depuis 1993 à Drémil-Lafage</span>
          </h1>
          <p className="text-dark-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            Mécaniciens qualifiés et continuellement formés, équipements dernière génération.
            Diagnostic en 10 minutes, devis pièce et main-d&apos;œuvre avant toute intervention
            — sans mauvaise surprise. Toutes marques acceptées.
          </p>
        </div>
      </section>

      {/* ── Services — fond clair ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-10">
            {services.map((service, index) => {
              const isOdd = index % 2 === 0; // impair = image gauche

              /* Bloc info : icon + titre + bouton */
              const infoContent = (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 border border-brand-500/10 flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-brand-500/10 transition-shadow duration-500">
                    {iconMap[service.icon]}
                  </div>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 mb-4 leading-tight">
                    {service.title}
                  </h2>
                  <a
                    href="tel:0532002038"
                    className="inline-flex items-center gap-2 w-fit px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-white text-sm font-bold hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
                    aria-label={`Demander un devis pour ${service.title}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Demander un devis
                  </a>
                </>
              );

              /* Bloc contenu : description + features */
              const contentContent = (
                <>
                  <p className="text-slate-500 leading-relaxed mb-6 text-sm sm:text-base">
                    {service.description}
                  </p>
                  <h3 className="font-heading font-semibold text-sm text-slate-800 mb-4 tracking-wide">
                    Nos prestations incluent&nbsp;:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CircleCheck className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm text-slate-600 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </>
              );

              /* Image full-height */
              const imagePanel = (
                <div className="relative min-h-[260px] lg:min-h-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 35vw"
                  />
                </div>
              );

              return (
                <div
                  key={service.id}
                  id={service.id}
                  className="group relative rounded-2xl border border-slate-200 overflow-hidden hover:border-brand-500/30 hover:shadow-xl transition-all duration-500 scroll-mt-24"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                  {isOdd ? (
                    /* ── Impair : image gauche | colonne droite (info ↑ + contenu ↓) ── */
                    <div className="relative grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
                      {/* Image gauche */}
                      <div className="border-b lg:border-b-0 lg:border-r border-slate-200">
                        {imagePanel}
                      </div>
                      {/* Colonne droite : empilée */}
                      <div className="flex flex-col">
                        <div className="p-8 sm:p-10 flex flex-col border-b border-slate-200 bg-white">
                          {infoContent}
                        </div>
                        <div className="p-8 sm:p-10 flex-1 bg-white">
                          {contentContent}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Pair : contenu gauche | info centre | image droite ── */
                    <div className="relative grid grid-cols-1 lg:grid-cols-[3fr_2fr_3fr]">
                      {/* Contenu gauche */}
                      <div className="p-8 sm:p-10 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
                        {contentContent}
                      </div>
                      {/* Info centre */}
                      <div className="p-8 sm:p-10 bg-slate-50 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
                        {infoContent}
                      </div>
                      {/* Image droite */}
                      <div className="border-t lg:border-t-0">
                        {imagePanel}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pourquoi nous faire confiance — fond sombre ── */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              <span className="text-brand-500 text-xs font-medium tracking-wide uppercase">Nos garanties</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Pourquoi nous faire confiance&nbsp;?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustCards.map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-dark-700 bg-dark-800 p-7 text-center hover:border-brand-500/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" aria-hidden="true" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 border border-brand-500/10 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-brand-500/10 transition-shadow duration-500">
                    <Icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white mb-1">{title}</h3>
                  <p className="text-sm text-dark-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-dark-900 relative border-t border-dark-700">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-white text-3xl md:text-4xl mb-4">
            Besoin d&apos;un devis ou d&apos;un rendez-vous&nbsp;?
          </h2>
          <p className="text-dark-300 text-lg mb-8">
            Contactez-nous dès maintenant. Réponse en moins de 24h. Accueil avec ou sans rendez-vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0532002038"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-white text-base font-bold hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              05 32 00 20 38
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-dark-600 text-white text-base font-semibold hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-300"
            >
              Formulaire de contact
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </MainLayout>
  );
}
