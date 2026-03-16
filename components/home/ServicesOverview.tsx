import Link from "next/link";
import { Wrench, Settings, Paintbrush, Cpu, ArrowRight } from "lucide-react";

const services = [
  {
    id: "entretien",
    num: "01",
    Icon: Wrench,
    title: "Entretien & Révision",
    description:
      "Nous réalisons la mise au point moteur, la réparation de toute marque de véhicule ainsi que l'entretien. Nous assurons la révision garantie constructeur, la vidange et la préparation pour le contrôle technique. Les préconisations constructeur sont toujours respectées.",
    items: ["Vidange & remplacement filtres", "Révision garantie constructeur", "Préparation contrôle technique", "Remplacement courroie de distribution"],
  },
  {
    id: "mecanique",
    num: "02",
    Icon: Settings,
    title: "Réparation Mécanique",
    description:
      "Spécialistes BMW, Audi et Volkswagen, nous intervenons sur tous types de véhicules. Diagnostic en 10 minutes, réparation moteur, embrayage, suspension. Un devis pièce et main-d'œuvre est établi avant toute intervention. Professionnels qualifiés et continuellement formés.",
    items: ["Diagnostic en 10 minutes", "Moteur, embrayage, boîte de vitesses", "Suspensions & amortisseurs", "Spécialiste BMW · Audi · VW · Mercedes"],
  },
  {
    id: "carrosserie",
    num: "03",
    Icon: Paintbrush,
    title: "Carrosserie & Peinture",
    description:
      "Atelier carrosserie équipé d'une cabine de peinture neuve. Réparation d'ailes, débosselage, peinture teinte constructeur. Prise en charge du dossier d'assurance et d'expertise suite à un sinistre. Nettoyage intérieur et extérieur inclus après toute réparation.",
    items: ["Cabine de peinture neuve", "Réparation ailes & carrosserie", "Prise en charge dossier assurance", "Nettoyage véhicule après réparation"],
  },
  {
    id: "diagnostic",
    num: "04",
    Icon: Cpu,
    title: "Diagnostic & Pannes",
    description:
      "Diagnostic électronique en 10 minutes pour tous constructeurs. Lecture et effacement des codes défaut OBD. Nettoyage et régénération du filtre à particules, gestion des pertes de puissance, réparation turbo et vanne EGR. Toutes marques acceptées.",
    items: ["Diagnostic OBD en 10 minutes", "Filtre à particules (DPF)", "Réparation turbo & vanne EGR", "Réparation boîte de vitesse automatique"],
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
              Spécialistes de la mécanique,<br />la carrosserie et la vente
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

              {/* Accent top */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

              {/* Icône */}
              <div className="w-12 h-12 bg-brand-500/15 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500/25 transition-colors duration-300 ring-1 ring-brand-500/20">
                <Icon size={22} className="text-brand-400" strokeWidth={1.75} />
              </div>

              <h3 className="font-heading font-bold text-white text-xl mb-3">
                {title}
              </h3>

              <p className="text-dark-400 text-sm leading-relaxed mb-6">
                {description}
              </p>

              <ul className="space-y-2 mb-7">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-dark-400 group-hover:text-dark-300 transition-colors">
                    <span className="w-1 h-1 bg-brand-500 rounded-full flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

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
