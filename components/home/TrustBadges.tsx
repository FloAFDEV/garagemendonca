import { Calendar, Award, Car, KeyRound } from "lucide-react";

const badges = [
  {
    Icon: Calendar,
    value: "30+",
    label: "Ans d'expérience",
    description: "M. Victor Mendonça vous accompagne depuis 1993 avec son équipe de professionnels.",
  },
  {
    Icon: Award,
    value: "Spécialisé",
    label: "BMW · Audi · VW",
    description: "Mécaniciens formés sur marques allemandes. Toutes marques et modèles acceptés.",
  },
  {
    Icon: Car,
    value: "VO",
    label: "Boîte automatique",
    description: "Stock sélectionné de véhicules d'occasion en boîte automatique, contrôlés et garantis.",
  },
  {
    Icon: KeyRound,
    value: "9",
    label: "Véhicules de prêt",
    description: "Un véhicule de courtoisie mis à votre disposition pendant toute la durée des travaux.",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-dark-950 border-b border-dark-800" aria-label="Nos points forts">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-dark-800">
          {badges.map(({ Icon, value, label, description }) => (
            <div
              key={label}
              className="group px-6 lg:px-8 py-10 transition-colors duration-300 hover:bg-dark-900/60"
            >
              {/* Icône + valeur en ligne */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-500/15 rounded-lg flex items-center justify-center group-hover:bg-brand-500/25 transition-colors ring-1 ring-brand-500/20">
                  <Icon size={19} className="text-brand-400" />
                </div>
                <div className="font-heading font-black text-2xl text-white leading-none">
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
