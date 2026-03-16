import Link from "next/link";
import { Wrench, Settings, Paintbrush, Cpu, ArrowRight } from "lucide-react";

const services = [
  {
    id: "entretien",
    Icon: Wrench,
    title: "Entretien & Révision",
    description:
      "Vidange, filtres, distribution, freinage… Nous assurons la maintenance complète de votre véhicule selon les préconisations constructeur.",
    color: "brand",
  },
  {
    id: "mecanique",
    Icon: Settings,
    title: "Réparation Mécanique",
    description:
      "Moteur, boîte de vitesses, embrayage, suspension : nos mécaniciens qualifiés diagnostiquent et réparent tout type de panne.",
    color: "blue",
  },
  {
    id: "carrosserie",
    Icon: Paintbrush,
    title: "Carrosserie & Peinture",
    description:
      "Débosselage, peinture teinte constructeur, remplacement de pièces. Votre véhicule repart comme neuf après un accident.",
    color: "emerald",
  },
  {
    id: "diagnostic",
    Icon: Cpu,
    title: "Diagnostic Électronique",
    description:
      "Nos équipements de pointe lisent et effacent les codes défaut de tous les constructeurs. Localisation rapide de la panne.",
    color: "violet",
  },
];

const colorMap: Record<string, { icon: string; bg: string; border: string; pill: string }> = {
  brand: {
    icon: "text-brand-600",
    bg: "bg-brand-50",
    border: "border-brand-200",
    pill: "bg-brand-600",
  },
  blue: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    pill: "bg-blue-600",
  },
  emerald: {
    icon: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    pill: "bg-emerald-600",
  },
  violet: {
    icon: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    pill: "bg-violet-600",
  },
};

export default function ServicesOverview() {
  return (
    <section className="py-20 bg-dark-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
          <div>
            <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
              Ce que nous faisons
            </span>
            <h2 className="section-title max-w-lg">
              Tous vos besoins automobiles
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors mt-4 lg:mt-0 group"
          >
            Voir tous nos services
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(({ id, Icon, title, description, color }) => {
            const c = colorMap[color];
            return (
              <Link
                key={id}
                href={`/services#${id}`}
                className={`group flex gap-6 p-8 bg-white rounded-2xl border ${c.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={26} className={c.icon} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-dark-900 text-lg mb-2">
                    {title}
                  </h3>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {description}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-dark-700 group-hover:text-brand-600 transition-colors">
                    En savoir plus
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
