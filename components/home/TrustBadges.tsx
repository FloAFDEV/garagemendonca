import { Calendar, ShieldCheck, Settings, Star } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const badges = [
  {
    Icon: Calendar,
    value: "+30 ANS",
    label: "D'expérience",
    description:
      "M. Vitor Mendonça et son équipe de professionnels mettent leur savoir-faire à votre service pour des prestations de qualité.",
  },
  {
    Icon: ShieldCheck,
    value: "Véhicules",
    label: "Expertisés & garantis",
    description:
      "Garantie 6 à 12 mois kilométrage illimité. Vérification en 160 points et 250 à 500 km parcourus avant mise en vente.",
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
      "98 % de clients satisfaits. Accueil avec ou sans rendez-vous, du lundi au vendredi.",
  },
];

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function TrustBadges() {
  return (
    <section className="bg-white border-y border-slate-200" aria-label="Nos engagements">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {badges.map(({ Icon, value, label, description }, i) => (
            <AnimateOnScroll key={label} delay={i * 80}>
              <div className={clsx(
                "group px-6 lg:px-8 py-10 transition-colors duration-250 hover:bg-slate-50",
                i > 0 && "border-l border-slate-200"
              )}>
                {/* Icône + valeur */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center ring-1 ring-brand-200 group-hover:bg-brand-100 transition-colors" aria-hidden="true">
                    <Icon size={17} className="text-brand-500" aria-hidden="true" />
                  </div>
                  <div className="font-heading font-black text-lg text-[#0f172a] leading-tight">
                    {value}
                  </div>
                </div>
                <div className="font-semibold text-[#0f172a] text-sm mb-2 leading-snug">{label}</div>
                <p className="text-[#475569] text-xs leading-relaxed">{description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
