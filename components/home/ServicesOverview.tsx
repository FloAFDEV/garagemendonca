import Link from "next/link";
import { Wrench, Settings, Paintbrush, Cpu, ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import BrandsStrip from "@/components/home/BrandsStrip";

const services = [
  {
    id: "entretien",
    num: "01",
    Icon: Wrench,
    title: "Entretien & Révision",
    description:
      "Service de proximité pour tous véhicules toutes marques. Préconisations constructeur toujours respectées.",
    items: ["Révision garantie constructeur", "Pneus, clim & amortisseurs", "Contrôle technique", "Courroie de distribution"],
  },
  {
    id: "mecanique",
    num: "02",
    Icon: Settings,
    title: "Mécanique & Électronique",
    description:
      "Spécialiste véhicules japonais et boîtes automatiques. Réparation électronique à coût maîtrisé, devis avant intervention.",
    items: ["Spécialiste japonaises", "Moteur, embrayage, boîte auto", "Réparation pièces électro.", "Devis pièce & main-d'œuvre"],
  },
  {
    id: "diagnostic",
    num: "03",
    Icon: Cpu,
    title: "Diagnostic & Motoriste",
    description:
      "Spécialiste combustion & encrassements depuis 2001. Diagnostic OBD en 10 minutes, toutes marques.",
    items: ["Diagnostic OBD en 10 min", "Nettoyage admission & DPF", "Réparation turbo & EGR", "Pertes de puissance"],
  },
  {
    id: "carrosserie",
    num: "04",
    Icon: Paintbrush,
    title: "Carrosserie & Vitrage",
    description:
      "Nouvelle cabine de peinture. Tôlerie, collision, pare-brise toutes marques. Véhicule de courtoisie inclus.",
    items: ["Nouvelle cabine de peinture", "Pare-brise & lunette arrière", "Véhicule de courtoisie", "Dossier assurance inclus"],
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-28 bg-[#f8fafc]">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
            <div>
              <div className="section-divider" />
              <span className="eyebrow">Ce que nous faisons</span>
              <h2 className="section-title max-w-lg">
                Spécialistes de la mécanique,<br />la carrosserie et la vente
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors mt-6 lg:mt-0 group text-sm focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
            >
              Tous nos services en détail
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimateOnScroll>

        {/* ── Grille cartes — 1 col mobile / 2 tablette / 4 desktop ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {services.map(({ id, num, Icon, title, description, items }, i) => (
            <AnimateOnScroll key={id} delay={i * 90}>
              <Link
                href={`/services#${id}`}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 overflow-hidden flex flex-col h-full"
              >
                {/* Trait accent haut */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                  aria-hidden="true"
                />

                {/* Numéro filigrane */}
                <span
                  className="absolute top-4 right-5 font-heading font-black text-6xl text-slate-100 select-none group-hover:text-brand-50 transition-colors"
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Icône */}
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-brand-100 group-hover:bg-brand-100 transition-colors duration-250 flex-shrink-0">
                  <Icon size={19} className="text-brand-500" strokeWidth={1.75} />
                </div>

                <h3 className="font-heading font-bold text-[#0f172a] text-base mb-2 leading-snug">
                  {title}
                </h3>

                <p className="text-[#475569] text-xs leading-[1.7] mb-5">
                  {description}
                </p>

                {/* Prestations */}
                <ul className="space-y-2 mb-5 flex-1">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-[#475569]">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-brand-500 transition-all duration-200 group-hover:gap-3 mt-auto">
                  En savoir plus
                  <ArrowRight size={12} />
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>

        {/* ── Bandeau logos marques ── */}
        <BrandsStrip />
      </div>
    </section>
  );
}
