import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import { services } from "@/lib/data";
import { Wrench, Settings, Paintbrush, Cpu, CheckCircle2, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Spécialiste de la mécanique, de la carrosserie et du diagnostic depuis 30 ans à Drémil-Lafage. BMW, Audi, Volkswagen, toutes marques. Diagnostic en 10 minutes. Devis gratuit.",
};

const iconMap: Record<string, React.ReactNode> = {
  wrench: <Wrench size={32} strokeWidth={1.75} />,
  settings: <Settings size={32} strokeWidth={1.75} />,
  paintbrush: <Paintbrush size={32} strokeWidth={1.75} />,
  cpu: <Cpu size={32} strokeWidth={1.75} />,
};

const colorMap = [
  { icon: "text-brand-600", bg: "bg-brand-100", border: "border-brand-200", light: "bg-brand-50" },
  { icon: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", light: "bg-blue-50" },
  { icon: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", light: "bg-emerald-50" },
  { icon: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200", light: "bg-violet-50" },
];

export default function ServicesPage() {
  return (
    <MainLayout>
      {/* ── Hero ── */}
      <section className="bg-dark-900 pt-36 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" aria-hidden="true" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-brand-500" />
              <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
                Ce que nous faisons
              </span>
            </div>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Spécialistes de la mécanique,<br />
              <span className="text-gradient">la carrosserie et la vente</span>
            </h1>
            <p className="text-[#475569] text-xl leading-relaxed max-w-2xl">
              Avec une expérience de plus de 30 ans dans le domaine, M. Vitor Mendonça,
              le dirigeant, ainsi que son équipe de professionnels mettent à votre service
              leurs compétences et leur savoir-faire, afin de vous prodiguer des prestations
              de qualité. Diagnostic en 10 minutes. Devis pièce et main-d&apos;œuvre avant
              toute intervention. Toutes marques acceptées.
            </p>
          </div>
        </div>
      </section>

      {/* ── Liste des services ── */}
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
                      <div
                        className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center mb-6 ${c.icon}`}
                      >
                        {iconMap[service.icon]}
                      </div>
                      <h2 className="font-heading font-black text-[#0f172a] text-3xl mb-4">
                        {service.title}
                      </h2>
                      <a
                        href="tel:0532002038"
                        className="btn-primary w-fit mt-6 text-sm"
                      >
                        <Phone size={15} />
                        Demander un devis
                      </a>
                    </div>

                    {/* Panneau droit */}
                    <div className="lg:col-span-2 bg-white p-10">
                      <p className="text-[#475569] text-lg leading-relaxed mb-8">
                        {service.description}
                      </p>
                      <h3 className="font-semibold text-[#0f172a] mb-5">
                        Nos prestations incluent :
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-3 text-[#0f172a] text-sm"
                          >
                            <CheckCircle2
                              size={17}
                              className="text-brand-600 mt-0.5 flex-shrink-0"
                            />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pourquoi nous faire confiance ── */}
      <section className="py-20 bg-dark-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title mb-4">Pourquoi nous faire confiance ?</h2>
            <p className="section-subtitle mx-auto mb-14">
              Notre réputation repose sur des années de service irréprochable et
              la satisfaction de nos clients en région toulousaine.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "Devis", label: "pièce & main-d'œuvre avant intervention" },
                { value: "Toutes", label: "marques acceptées" },
                { value: "Garantie", label: "6 à 12 mois km illimités (VO)" },
                { value: "160", label: "points de contrôle sur chaque VO" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-sm"
                >
                  <div className="font-heading font-black text-brand-600 text-xl mb-2">
                    {value}
                  </div>
                  <div className="text-[#475569] text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-dark-900 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-black text-white text-3xl md:text-4xl mb-4">
            Besoin d&apos;un devis ou d&apos;un rendez-vous ?
          </h2>
          <p className="text-[#475569] text-lg mb-8">
            Contactez-nous dès maintenant. Réponse en moins de 24h. Accueil avec ou sans rendez-vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0532002038"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-lg shadow-brand-lg transition-all hover:-translate-y-0.5"
            >
              <Phone size={18} />
              05 32 00 20 38
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/20 hover:border-dark-500 text-slate-300 hover:text-white font-bold px-8 py-4 rounded-lg transition-all hover:-translate-y-0.5"
            >
              Formulaire de contact
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
