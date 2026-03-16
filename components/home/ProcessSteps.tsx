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
    <section className="py-24 bg-dark-900 relative overflow-hidden">
      {/* Grille texture très subtile */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 80px), repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 80px)",
        }}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4">

        {/* ── Header ── */}
        <AnimateOnScroll>
          <div className="max-w-xl mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-brand-500" />
              <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.16em]">
                Comment ça se passe
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-[#f9fafb] text-3xl md:text-4xl leading-tight">
              Du diagnostic à la restitution,<br />un processus clair et transparent
            </h2>
          </div>
        </AnimateOnScroll>

        {/* ── Étapes ── */}
        <div className="relative">
          {/* Ligne de connexion desktop */}
          <div className="hidden lg:block absolute top-9 left-0 right-0 h-px bg-dark-700" aria-hidden="true" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-5">
            {steps.map(({ num, Icon, title, description }, i) => (
              <AnimateOnScroll key={num} delay={i * 80}>
                <div className="relative flex flex-col group">
                  <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-0 mb-5 lg:mb-6">
                    {/* Cercle numéroté */}
                    <div className="relative z-10 w-[72px] h-[72px] lg:w-[60px] lg:h-[60px] flex-shrink-0 bg-dark-900 border-2 border-dark-700 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:border-brand-500/40">
                      <div className="w-11 h-11 lg:w-9 lg:h-9 bg-brand-500 rounded-full flex items-center justify-center shadow-brand">
                        <Icon size={18} className="text-white" strokeWidth={1.75} />
                      </div>
                    </div>
                    {/* Numéro — mobile */}
                    <span className="lg:hidden font-heading font-black text-dark-600 text-2xl leading-none">
                      {num}
                    </span>
                  </div>

                  <span className="hidden lg:block font-heading font-black text-dark-600/70 text-xs mb-2 tracking-wider">
                    {num}
                  </span>

                  <h3 className="font-heading font-bold text-[#f9fafb] text-base mb-2 leading-snug">
                    {title}
                  </h3>
                  <p className="text-[#9ca3af] text-sm leading-[1.65]">
                    {description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>

        {/* ── CTA bas ── */}
        <AnimateOnScroll delay={200}>
          <div className="mt-16 pt-12 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <p className="text-[#9ca3af] text-sm max-w-md leading-relaxed">
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
