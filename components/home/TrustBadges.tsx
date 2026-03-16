import { Calendar, ShieldCheck, Car, Clock } from "lucide-react";

const badges = [
  {
    Icon: Calendar,
    value: "30+",
    label: "Ans d'expérience",
    description: "Fondé en 1993, un savoir-faire éprouvé au fil des décennies",
    color: "text-brand-500",
    bg: "bg-brand-50",
  },
  {
    Icon: ShieldCheck,
    value: "500+",
    label: "Clients satisfaits",
    description: "Une réputation locale bâtie sur la confiance et le sérieux",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    Icon: Car,
    value: "100+",
    label: "Véhicules vendus/an",
    description: "Un stock de VO soigneusement sélectionné et contrôlé",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    Icon: Clock,
    value: "48h",
    label: "Délai d'intervention",
    description: "Nous nous engageons sur des délais rapides et respectés",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section intro */}
        <div className="text-center mb-14">
          <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Pourquoi nous choisir
          </span>
          <h2 className="section-title">
            Un garage qui mérite votre confiance
          </h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            Depuis plus de 30 ans, Garage Mendonca accompagne les automobilistes
            de Drémil-Lafage et des environs avec rigueur et transparence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(({ Icon, value, label, description, color, bg }) => (
            <div
              key={label}
              className="group p-8 rounded-2xl border border-dark-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <div
                className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={26} className={color} />
              </div>
              <div className="font-heading font-black text-4xl text-dark-900 mb-1">
                {value}
              </div>
              <div className="font-semibold text-dark-800 mb-2">{label}</div>
              <p className="text-dark-500 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
