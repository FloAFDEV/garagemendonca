import { Phone, ScanSearch, FileText, Wrench, CheckCircle2 } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const steps = [
  {
    num: "01",
    Icon: Phone,
    title: "Prise de contact",
    description: "Appelez le 05 32 00 20 38 ou envoyez un message. Accueil avec ou sans rendez-vous, du lundi au vendredi.",
  },
  {
    num: "02",
    Icon: ScanSearch,
    title: "Diagnostic",
    description: "Diagnostic en 10 minutes sur équipement dernière génération. Lecture des codes défaut OBD, toutes marques.",
  },
  {
    num: "03",
    Icon: FileText,
    title: "Devis transparent",
    description: "Un devis pièce et main-d'œuvre détaillé est établi avant toute intervention. Aucune surprise sur la facture.",
  },
  {
    num: "04",
    Icon: Wrench,
    title: "Réparation",
    description: "Intervention réalisée par nos mécaniciens qualifiés. Préconisations constructeur toujours respectées.",
  },
  {
    num: "05",
    Icon: CheckCircle2,
    title: "Restitution",
    description: "Votre véhicule restitué propre (nettoyage intérieur/extérieur inclus) avec compte-rendu complet des travaux.",
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-28 bg-white">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <AnimateOnScroll>
          <div className="max-w-xl mb-16">
            <div className="section-divider" />
            <span className="eyebrow">Comment ça se passe</span>
            <h2 className="section-title">
              Du diagnostic à la restitution,<br />un processus clair et transparent
            </h2>
          </div>
        </AnimateOnScroll>

        {/* ── Étapes ── */}
        <div className="relative">
          {/* Ligne de connexion desktop */}
          <div className="hidden lg:block absolute top-9 left-0 right-0 h-px bg-slate-200" aria-hidden="true" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-5">
            {steps.map(({ num, Icon, title, description }, i) => (
              <AnimateOnScroll key={num} delay={i * 80}>
                <div className="relative flex flex-col group">
                  <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-0 mb-5 lg:mb-6">
                    {/* Cercle numéroté */}
                    <div className="relative z-10 w-[72px] h-[72px] lg:w-[60px] lg:h-[60px] flex-shrink-0 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 group-hover:border-brand-200 group-hover:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]">
                      <div className="w-11 h-11 lg:w-9 lg:h-9 bg-brand-500 rounded-full flex items-center justify-center shadow-brand">
                        <Icon size={18} className="text-white" strokeWidth={1.75} />
                      </div>
                    </div>
                    {/* Numéro — mobile */}
                    <span className="lg:hidden font-heading font-black text-slate-300 text-2xl leading-none">
                      {num}
                    </span>
                  </div>

                  <span className="hidden lg:block font-heading font-black text-slate-300 text-xs mb-2 tracking-wider">
                    {num}
                  </span>

                  <h3 className="font-heading font-bold text-[#0f172a] text-base mb-2 leading-snug">
                    {title}
                  </h3>
                  <p className="text-[#475569] text-sm leading-[1.65]">
                    {description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        {/* ── CTA bas ── */}
        <AnimateOnScroll delay={200}>
          <div className="mt-16 pt-12 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="text-[#475569] text-sm max-w-md leading-relaxed">
              Véhicule de courtoisie disponible pendant toute intervention —
              9 véhicules offerts ou 1 véhicule neuf à 16 € HT/jour.
            </p>
            <a href="tel:0532002038" className="btn-primary flex-shrink-0">
              <Phone size={16} />
              Prendre rendez-vous
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
