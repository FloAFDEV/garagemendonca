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
    <section className="py-24 bg-dark-850">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
          <div>
            <div className="section-divider" />
            <span className="eyebrow-light">Ce que nous faisons</span>
            <h2 className="section-title-light max-w-lg">
              Tous vos besoins<br />automobiles couverts
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-brand-400 font-semibold transition-colors mt-6 lg:mt-0 group text-sm"
          >
            Tous nos services en détail
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Grille cartes sombres ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map(({ id, num, Icon, title, description, items }) => (
            <Link
              key={id}
              href={`/services#${id}`}
              className="group relative bg-dark-900 rounded-xl border border-dark-700 hover:border-brand-500/40 p-8 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 overflow-hidden"
            >
              {/* Numéro filigrane */}
              <span
                className="absolute top-5 right-6 font-heading font-black text-6xl text-white/5 select-none group-hover:text-brand-500/10 transition-colors"
                aria-hidden="true"
              >
                {num}
              </span>

              {/* Ligne accent top au hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

              {/* Icône */}
              <div className="w-13 h-13 w-12 h-12 bg-brand-500/15 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500/25 transition-colors duration-300 ring-1 ring-brand-500/20">
                <Icon size={22} className="text-brand-400" strokeWidth={1.75} />
              </div>

              <h3 className="font-heading font-bold text-white text-xl mb-3">
                {title}
              </h3>

              <p className="text-dark-400 text-sm leading-relaxed mb-6">
                {description}
              </p>

              {/* Liste */}
              <ul className="space-y-2 mb-7">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-dark-400 group-hover:text-dark-300 transition-colors">
                    <span className="w-1 h-1 bg-brand-500 rounded-full flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Lien */}
              <div className="flex items-center gap-2 text-sm font-semibold text-dark-500 group-hover:text-brand-400 transition-colors group-hover:gap-3 duration-200">
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
