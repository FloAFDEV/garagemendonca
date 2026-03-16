import Link from "next/link";
import { Wrench, Settings, Paintbrush, Cpu, ArrowRight } from "lucide-react";

const services = [
  {
    id: "entretien",
    num: "01",
    Icon: Wrench,
    title: "Entretien & Révision",
    description:
      "Vidange, filtres, distribution, freinage — maintenance complète selon les préconisations constructeur. Garantie constructeur conservée.",
    items: ["Vidange & filtres", "Courroie de distribution", "Freinage complet", "Révision constructeur"],
  },
  {
    id: "mecanique",
    num: "02",
    Icon: Settings,
    title: "Réparation Mécanique",
    description:
      "Spécialistes BMW, Audi et Volkswagen. Nos mécaniciens diagnostiquent et réparent toutes pannes mécaniques, toutes marques.",
    items: ["Moteur & boîte de vitesses", "Embrayage & suspension", "Mise au point moteur", "Réparation toutes marques"],
  },
  {
    id: "carrosserie",
    num: "03",
    Icon: Paintbrush,
    title: "Carrosserie & Peinture",
    description:
      "Débosselage, peinture teinte constructeur, remplacement de vitrage. Votre carrosserie traitée avec précision.",
    items: ["Débosselage & redressage", "Peinture teinte constructeur", "Remplacement vitrage", "Rénovation optiques"],
  },
  {
    id: "diagnostic",
    num: "04",
    Icon: Cpu,
    title: "Diagnostic Électronique",
    description:
      "Équipements de dernière génération pour identifier et effacer les codes défaut de tous les constructeurs.",
    items: ["Lecture codes défaut", "Diagnostic toutes marques", "Reprogrammation calculateurs", "Test batterie & alternateur"],
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
          <div>
            <div className="section-divider" />
            <span className="eyebrow">Ce que nous faisons</span>
            <h2 className="section-title max-w-lg">
              Tous vos besoins<br />automobiles couverts
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-dark-600 hover:text-brand-600 font-semibold transition-colors mt-6 lg:mt-0 group text-sm"
          >
            Tous nos services en détail
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-dark-100">
          {services.map(({ id, num, Icon, title, description, items }) => (
            <Link
              key={id}
              href={`/services#${id}`}
              className="group bg-white p-9 hover:bg-dark-50 transition-colors duration-200 relative"
            >
              {/* Numéro en filigrane */}
              <span className="absolute top-6 right-8 font-heading font-black text-5xl text-dark-100 group-hover:text-dark-150 transition-colors select-none">
                {num}
              </span>

              {/* Icône */}
              <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                <Icon size={22} className="text-white" strokeWidth={1.75} />
              </div>

              <h3 className="font-heading font-bold text-dark-900 text-xl mb-3">
                {title}
              </h3>
              <p className="text-dark-500 text-sm leading-relaxed mb-6">
                {description}
              </p>

              {/* Liste courte */}
              <ul className="space-y-1.5 mb-6">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-dark-600">
                    <span className="w-1 h-1 bg-brand-600 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Lien */}
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 group-hover:gap-3 transition-all">
                En savoir plus
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
