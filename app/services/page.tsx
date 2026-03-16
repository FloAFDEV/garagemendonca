import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import { services } from "@/lib/data";
import { Wrench, Settings, Paintbrush, Cpu, CheckCircle2, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Entretien, réparation mécanique, carrosserie et diagnostic électronique. Tous vos besoins automobiles pris en charge par nos techniciens qualifiés.",
};

const iconMap: Record<string, React.ReactNode> = {
  wrench: <Wrench size={32} />,
  settings: <Settings size={32} />,
  paintbrush: <Paintbrush size={32} />,
  cpu: <Cpu size={32} />,
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
      {/* Hero */}
      <section className="bg-dark-900 pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-widest mb-4">
              Ce que nous faisons
            </span>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Tous vos services{" "}
              <span className="text-gradient">automobiles</span>
            </h1>
            <p className="text-dark-400 text-xl leading-relaxed max-w-2xl">
              Avec plus de 30 ans d&apos;expérience, notre équipe de techniciens
              qualifiés prend en charge l&apos;entretien et la réparation de tous
              types de véhicules, toutes marques confondues.
            </p>
          </div>
        </div>
      </section>

      {/* Services list */}
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
                    {/* Left panel */}
                    <div className={`${c.light} p-10 flex flex-col justify-center`}>
                      <div
                        className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center mb-6 ${c.icon}`}
                      >
                        {iconMap[service.icon]}
                      </div>
                      <h2 className="font-heading font-black text-dark-900 text-3xl mb-4">
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

                    {/* Right panel */}
                    <div className="lg:col-span-2 bg-white p-10">
                      <p className="text-dark-600 text-lg leading-relaxed mb-8">
                        {service.description}
                      </p>
                      <h3 className="font-semibold text-dark-900 mb-5">
                        Nos prestations incluent :
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-3 text-dark-700 text-sm"
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

      {/* Why trust us */}
      <section className="py-20 bg-dark-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title mb-4">Pourquoi nous faire confiance ?</h2>
            <p className="section-subtitle mx-auto mb-14">
              Notre réputation repose sur des années de service irréprochable et
              la satisfaction de nos clients.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "Toutes", label: "marques acceptées" },
                { value: "Devis", label: "gratuit et rapide" },
                { value: "Pièces", label: "d'origine et garanties" },
                { value: "Garantie", label: "sur toutes réparations" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-6 border border-dark-100 text-center"
                >
                  <div className="font-heading font-black text-brand-600 text-xl mb-2">
                    {value}
                  </div>
                  <div className="text-dark-600 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-black text-white text-3xl md:text-4xl mb-4">
            Besoin d&apos;un devis ou d&apos;un rendez-vous ?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Contactez-nous dès maintenant, nous répondons en moins de 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0532002038"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-lg hover:bg-brand-50 transition-colors"
            >
              <Phone size={18} />
              05 32 00 20 38
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-brand-700 transition-colors"
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
