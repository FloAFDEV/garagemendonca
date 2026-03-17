import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import { services } from "@/lib/data";
import { Wrench, Settings, Paintbrush, Cpu, CheckCircle2, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Mécanique, carrosserie, diagnostic et entretien à Drémil-Lafage (31). Spécialiste BMW, Audi, Volkswagen, Mercedes. Diagnostic OBD en 10 min, devis pièce & main-d'œuvre gratuit. Toutes marques.",
};

const iconMap: Record<string, React.ReactNode> = {
  wrench:     <Wrench     size={32} strokeWidth={1.75} aria-hidden="true" />,
  settings:   <Settings   size={32} strokeWidth={1.75} aria-hidden="true" />,
  paintbrush: <Paintbrush size={32} strokeWidth={1.75} aria-hidden="true" />,
  cpu:        <Cpu        size={32} strokeWidth={1.75} aria-hidden="true" />,
};

const colorMap = [
  { icon: "text-brand-600", bg: "bg-brand-100",   border: "border-brand-200",   light: "bg-brand-50"   },
  { icon: "text-blue-600",  bg: "bg-blue-100",    border: "border-blue-200",    light: "bg-blue-50"    },
  { icon: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", light: "bg-emerald-50" },
  { icon: "text-violet-600", bg: "bg-violet-100",  border: "border-violet-200",  light: "bg-violet-50"  },
];

export default function ServicesPage() {
  return (
    <MainLayout>

      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-36 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" aria-hidden="true" />
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {services.map((service, index) => {
              const c = colorMap[index % colorMap.length];
              return (
                <div
                  key={service.id}
                  id={service.id}
                  className={`rounded-2xl border ${c.border} overflow-hidden scroll-mt-24`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3">

                    {/* Panneau gauche */}
                    <div className={`${c.light} p-10 flex flex-col justify-center`}>
                      <div className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center mb-6 ${c.icon}`}>
                        {iconMap[service.icon]}
                      </div>
                      <h2 className="font-heading font-black text-[#0f172a] text-3xl mb-4">
                        {service.title}
                      </h2>
                      <a
                        href="tel:0532002038"
                        className="btn-primary w-fit mt-6 text-sm"
                        aria-label={`Demander un devis pour ${service.title}`}
                      >
                        <Phone size={15} aria-hidden="true" />
                        Demander un devis
                      </a>
                    </div>

                    {/* Panneau droit */}
                    <div className="lg:col-span-2 bg-white p-10">
                      <p className="text-[#475569] text-lg leading-relaxed mb-8">{service.description}</p>
                      <h3 className="font-semibold text-[#0f172a] mb-5">Nos prestations incluent :</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-[#0f172a] text-sm">
                            <CheckCircle2 size={17} className="text-brand-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pourquoi nous ── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="section-divider mx-auto" />
            <span className="eyebrow">Nos garanties</span>
            <h2 className="section-title mt-1 mb-4">Pourquoi nous faire confiance ?</h2>
            <p className="section-subtitle mx-auto mb-14">
              Notre réputation repose sur des années de service irréprochable et
              la satisfaction de nos clients en région toulousaine.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "Devis gratuit",     label: "pièce & main-d'œuvre avant intervention" },
                { value: "Toutes marques",    label: "acceptées, BMW · Audi · VW · Mercedes" },
                { value: "Garantie",          label: "6 à 12 mois km illimités (VO)" },
                { value: "160 points",        label: "de contrôle sur chaque véhicule" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-sm">
                  <div className="font-heading font-black text-brand-600 text-xl mb-2">{value}</div>
                  <div className="text-[#475569] text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-[#0f172a] relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />
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
