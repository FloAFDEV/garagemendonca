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
      "Service de proximité pour tous les véhicules toutes marques. Techniciens formés aux technologies Renault, PSA, BMW, Audi et Volkswagen. Les préconisations constructeur sont toujours respectées.",
    items: ["Révision garantie constructeur", "Pneus, climatisation & amortisseurs", "Préparation contrôle technique", "Courroie de distribution"],
  },
  {
    id: "mecanique",
    num: "02",
    Icon: Settings,
    title: "Mécanique & Électronique",
    description:
      "Généraliste et expert, nous intervenons sur toutes les réparations mécaniques et électroniques. Spécialistes BMW, Audi et Volkswagen. Réparation de pièces électroniques à coût maîtrisé, en restant dans le réseau professionnel.",
    items: ["Spécialiste BMW · Audi · VW · Renault · PSA", "Moteur, embrayage, boîte de vitesses", "Réparation pièces électroniques", "Devis pièce & main-d'œuvre avant intervention"],
  },
  {
    id: "diagnostic",
    num: "03",
    Icon: Cpu,
    title: "Diagnostic & Motoriste",
    description:
      "Atelier conseil easydiag — spécialiste de la combustion et des encrassements moteurs depuis plus de 12 ans. Diagnostic électronique en 10 minutes sur tous constructeurs, toutes marques.",
    items: ["Diagnostic OBD en 10 minutes", "Nettoyage admission & DPF", "Réparation turbo & vanne EGR", "Gestion pertes de puissance"],
  },
  {
    id: "carrosserie",
    num: "04",
    Icon: Paintbrush,
    title: "Carrosserie & Vitrage",
    description:
      "Nouvelle cabine de peinture pour des finitions irréprochables. Tôlerie, collision, pare-brise et lunette arrière toutes marques. Véhicule de courtoisie disponible, dossier assurance pris en charge.",
    items: ["Nouvelle cabine de peinture", "Pare-brise & lunette arrière", "Véhicule de courtoisie inclus", "Dossier assurance & expertise sinistre"],
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

        {/* ── Grille cartes ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(({ id, num, Icon, title, description, items }, i) => (
            <AnimateOnScroll key={id} delay={i * 90}>
              <Link
                href={`/services#${id}`}
                className="group relative bg-white rounded-2xl border border-slate-200 p-8 lg:p-10 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-1 overflow-hidden block h-full"
              >
                {/* Trait accent haut — visible au hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                  aria-hidden="true"
                />

                {/* Numéro filigrane */}
                <span
                  className="absolute top-6 right-7 font-heading font-black text-7xl text-slate-100 select-none group-hover:text-brand-50 transition-colors"
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Icône */}
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-7 ring-1 ring-brand-100 group-hover:bg-brand-100 transition-colors duration-250">
                  <Icon size={22} className="text-brand-500" strokeWidth={1.75} />
                </div>

                <h3 className="font-heading font-bold text-[#0f172a] text-xl mb-3 leading-snug">
                  {title}
                </h3>

                <p className="text-[#475569] text-sm leading-[1.75] mb-7">
                  {description}
                </p>

                {/* Prestations */}
                <ul className="space-y-2.5 mb-8">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#475569]">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 group-hover:text-brand-500 transition-all duration-200 group-hover:gap-3">
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
