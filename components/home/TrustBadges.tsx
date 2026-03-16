import { Calendar, ShieldCheck, Settings, Star } from "lucide-react";

/* Les 4 slogans officiels du site garagemendonca.com */
const badges = [
  {
    Icon: Calendar,
    value: "+30 ANS",
    label: "D'expérience",
    description:
      "M. Vitor Mendonça et son équipe de professionnels mettent à votre service leurs compétences et leur savoir-faire depuis 1993.",
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
    <section className="bg-dark-950 border-b border-dark-800" aria-label="Nos engagements">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-dark-800">
          {badges.map(({ Icon, value, label, description }) => (
            <div
              key={label}
              className="group px-6 lg:px-8 py-10 transition-colors duration-300 hover:bg-dark-900/60"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-500/15 rounded-lg flex items-center justify-center group-hover:bg-brand-500/25 transition-colors ring-1 ring-brand-500/20">
                  <Icon size={19} className="text-brand-400" />
                </div>
                <div className="font-heading font-black text-xl text-white leading-tight">
                  {value}
                </div>
              </div>
              <div className="font-semibold text-white text-sm mb-1.5 leading-tight">
                {label}
              </div>
              <p className="text-dark-500 text-xs leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
