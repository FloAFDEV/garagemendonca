import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import { services } from "@/lib/data";
import {
  Wrench,
  Settings2,
  Paintbrush,
  Cpu,
  CircleCheck,
  Phone,
  ArrowRight,
  ClipboardList,
  Car,
  ShieldCheck,
  ListChecks,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Mécanique, carrosserie, diagnostic et entretien à Drémil-Lafage (31). Spécialiste BMW, Audi, Volkswagen, Mercedes. Diagnostic OBD en 10 min, devis pièce & main-d'œuvre gratuit. Toutes marques.",
};

/* ── Icônes services ── */
const iconMap: Record<string, React.ReactNode> = {
  wrench:     <Wrench     size={28} strokeWidth={1.75} aria-hidden="true" />,
  settings:   <Settings2  size={28} strokeWidth={1.75} aria-hidden="true" />,
  paintbrush: <Paintbrush size={28} strokeWidth={1.75} aria-hidden="true" />,
  cpu:        <Cpu        size={28} strokeWidth={1.75} aria-hidden="true" />,
};

/* ── Icônes garanties ── */
const trustCards = [
  { Icon: ClipboardList, title: "Devis gratuit",    sub: "Pièce & main-d'œuvre avant intervention" },
  { Icon: Car,           title: "Toutes marques",   sub: "BMW · Audi · VW · Mercedes · Renault · PSA" },
  { Icon: ShieldCheck,   title: "Garantie",         sub: "6 à 12 mois km illimités (VO)" },
  { Icon: ListChecks,    title: "160 points",       sub: "De contrôle sur chaque véhicule" },
];

export default function ServicesPage() {
  return (
    <MainLayout>

      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-36 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-brand-500" aria-hidden="true" />
              <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">Nos expertises</span>
            </div>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Mécanique, carrosserie &amp; vente<br />
              <span className="text-brand-500">depuis 1993 à Drémil-Lafage</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
              Mécaniciens qualifiés et continuellement formés, équipements
              dernière génération. Diagnostic en 10 minutes, devis pièce et
              main-d'œuvre avant toute intervention — sans mauvaise surprise.
              Toutes marques acceptées.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-16 bg-[#0f172a]">
        <div className="container mx-auto px-4">
          <div className="space-y-5">
            {services.map((service, index) => {
              const infoFirst = index % 2 === 0;

              const infoPanel = (
                <div className="bg-[#080f1a] p-10 flex flex-col justify-center gap-6 lg:min-h-[320px]">
                  {/* Icône */}
                  <div className="w-14 h-14 bg-brand-500/15 border border-brand-500/20 rounded-2xl flex items-center justify-center text-brand-500 flex-shrink-0">
                    {iconMap[service.icon]}
                  </div>
                  {/* Titre */}
                  <h2 className="font-heading font-black text-white text-2xl md:text-3xl leading-tight">
                    {service.title}
                  </h2>
                  {/* CTA */}
                  <a
                    href="tel:0532002038"
                    className="btn-primary w-fit text-sm py-2.5 px-5"
                    aria-label={`Demander un devis pour ${service.title}`}
                  >
                    <Phone size={15} aria-hidden="true" />
                    Demander un devis
                  </a>
                </div>
              );

              const contentPanel = (
                <div className="p-10 flex flex-col justify-center">
                  <p className="text-slate-300 text-base leading-relaxed mb-7">
                    {service.description}
                  </p>
                  <p className="text-brand-400 font-bold text-sm mb-4">
                    Nos prestations incluent :
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-slate-200 text-sm">
                        <CircleCheck
                          size={16}
                          className="text-brand-500 mt-0.5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );

              return (
                <div
                  key={service.id}
                  id={service.id}
                  className="rounded-2xl border border-slate-700/60 overflow-hidden bg-[#131c2b] scroll-mt-24"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
                    {infoFirst ? (
                      <>
                        {infoPanel}
                        <div className="border-t lg:border-t-0 lg:border-l border-slate-700/60">
                          {contentPanel}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-700/60 lg:order-1">
                          {contentPanel}
                        </div>
                        <div className="lg:order-2">
                          {infoPanel}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pourquoi nous faire confiance ── */}
      <section className="py-20 bg-[#080f1a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            {/* Badge pill */}
            <span className="inline-flex items-center gap-2 border border-slate-700 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-300 uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" aria-hidden="true" />
              Nos garanties
            </span>
            <h2 className="font-heading font-black text-white text-3xl md:text-4xl">
              Pourquoi nous faire confiance&nbsp;?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {trustCards.map(({ Icon, title, sub }) => (
              <div
                key={title}
                className="bg-[#131c2b] border border-slate-700/60 rounded-2xl p-7 flex flex-col items-center text-center gap-4 hover:border-brand-500/40 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-brand-500/15 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-500 flex-shrink-0">
                  <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-base mb-1">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-[#0f172a] relative border-t border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-black text-white text-3xl md:text-4xl mb-4">
            Besoin d&apos;un devis ou d&apos;un rendez-vous ?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Contactez-nous dès maintenant. Réponse en moins de 24h. Accueil avec ou sans rendez-vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0532002038" className="btn-primary text-base py-4 px-8">
              <Phone size={18} aria-hidden="true" />
              05 32 00 20 38
            </a>
            <Link href="/contact" className="btn-outline text-base py-4 px-8">
              Formulaire de contact
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </MainLayout>
  );
}
