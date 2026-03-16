import Link from "next/link";
import { Wrench, Settings, Paintbrush, Cpu, ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

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
        <AnimateOnScroll>
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
              className="inline-flex items-center gap-2 text-[#9ca3af] hover:text-brand-400 font-semibold transition-colors mt-6 lg:mt-0 group text-sm focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
            >
              Tous nos services en détail
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimateOnScroll>

        {/* ── Grille cartes ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(({ id, num, Icon, title, description, items }, i) => (
            <AnimateOnScroll key={id} delay={i * 90}>
              <Link
                href={`/services#${id}`}
                className="group relative bg-dark-900 rounded-2xl border border-white/[0.07] hover:border-brand-500/30 p-9 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 overflow-hidden block h-full"
              >
                {/* Numéro filigrane */}
                <span
                  className="absolute top-6 right-7 font-heading font-black text-7xl text-white/[0.04] select-none group-hover:text-brand-500/8 transition-colors"
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Trait accent en haut — visible au hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                  aria-hidden="true"
                />

                {/* Icône */}
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-7 ring-1 ring-brand-500/20 group-hover:bg-brand-500/20 transition-colors duration-250">
                  <Icon size={22} className="text-brand-400" strokeWidth={1.75} />
                </div>

                <h3 className="font-heading font-bold text-[#f9fafb] text-[1.15rem] mb-3 leading-snug">
                  {title}
                </h3>

                <p className="text-[#9ca3af] text-sm leading-[1.7] mb-7">
                  {description}
                </p>

                {/* Prestations */}
                <ul className="space-y-2.5 mb-8">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#9ca3af] group-hover:text-dark-300 transition-colors">
                      <span className="w-1 h-1 bg-brand-500/70 rounded-full flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-sm font-semibold text-dark-500 group-hover:text-brand-400 transition-all duration-200 group-hover:gap-3">
                  En savoir plus
                  <ArrowRight size={14} />
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
