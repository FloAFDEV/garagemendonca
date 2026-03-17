import { Calendar, ShieldCheck, Settings, Star } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const badges = [
  {
    Icon: Calendar,
    value: "+30 ANS",
    label: "D'expérience",
    description:
      "M. Vitor Mendonça, le dirigeant, ainsi que son équipe de professionnels mettent à votre service leurs compétences et leurs savoir-faire, afin de vous prodiguer des prestations de qualité.",
  },
  {
    Icon: ShieldCheck,
    value: "Véhicules",
    label: "Expertisés & garantis",
    description:
      "Garantie 6 à 12 mois kilométrages illimités. Vérification en 160 points et 250 à 500 km parcourus avant mise en vente.",
  },
  {
    Icon: Settings,
    value: "Rigueur",
    label: "Dans la préparation",
    description:
      "Préconisations constructeur toujours respectées. Devis pièce et main-d'œuvre établi avant toute intervention.",
  },
  {
    Icon: Star,
    value: "Satisfaction",
    label: "Notre priorité",
    description:
      "La satisfaction de nos clients est notre priorité. Accueil avec ou sans rendez-vous, du lundi au vendredi.",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-dark-950 border-b border-white/[0.05]" aria-label="Nos engagements">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {badges.map(({ Icon, value, label, description }, i) => (
            <AnimateOnScroll key={label} delay={i * 80}>
              <div className={clsx(
                "group px-6 lg:px-8 py-10 transition-colors duration-250 hover:bg-white/[0.03]",
                /* Séparateurs — seulement entre colonnes visibles */
                i > 0 && "border-l border-white/[0.06]"
              )}>
                {/* Icône + valeur */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-brand-500/10 rounded-lg flex items-center justify-center ring-1 ring-brand-500/15 group-hover:bg-brand-500/20 transition-colors">
                    <Icon size={17} className="text-brand-400" />
                  </div>
                  <div className="font-heading font-black text-lg text-[#f9fafb] leading-tight">
                    {value}
                  </div>
                </div>

                <div className="font-semibold text-[#f9fafb] text-sm mb-2 leading-snug">
                  {label}
                </div>
                <p className="text-[#9ca3af] text-xs leading-relaxed">
                  {description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

// clsx inline pour éviter une dépendance supplémentaire
function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
