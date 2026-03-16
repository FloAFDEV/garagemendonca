import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marie-Claire D.",
    location: "Drémil-Lafage",
    rating: 5,
    date: "Décembre 2024",
    comment:
      "Excellent garage ! Accueil chaleureux, diagnostic rapide et devis transparent. Ma Toyota Yaris a été révisée en une journée. Je reviendrai sans hésiter.",
  },
  {
    name: "Jean-Pierre R.",
    location: "Quint-Fonsegrives",
    rating: 5,
    date: "Novembre 2024",
    comment:
      "Spécialistes BMW sérieux et compétents. J'avais un problème moteur récurrent que d'autres garages n'arrivaient pas à résoudre. Victor l'a trouvé en 30 minutes. Bravo !",
  },
  {
    name: "Sophie M.",
    location: "Montrabé",
    rating: 5,
    date: "Octobre 2024",
    comment:
      "Le véhicule de courtoisie m'a sauvé la mise pendant les travaux. Carrosserie refaite impeccablement, couleur parfaitement assortie. Prix raisonnables et délais tenus.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "text-amber-400 fill-amber-400" : "text-dark-200"}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <div className="section-divider mx-auto" />
          </div>
          <span className="eyebrow justify-center">Avis clients</span>
          <h2 className="section-title">
            Ce que disent nos clients
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            La confiance de nos clients est notre meilleure récompense.
            Plus de 30 ans de fidélité en région toulousaine.
          </p>
        </div>

        {/* Note globale */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={22} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <div className="text-dark-900 font-heading font-bold text-2xl">5.0</div>
          <div className="text-dark-400 text-sm">· Note moyenne</div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, location, rating, date, comment }) => (
            <div
              key={name}
              className="bg-dark-50 rounded-xl p-7 border border-dark-100 hover:border-dark-200 hover:shadow-md transition-all duration-200 relative"
            >
              {/* Guillemet décoratif */}
              <Quote
                size={32}
                className="text-brand-100 absolute top-6 right-6"
                fill="currentColor"
              />

              <Stars count={rating} />

              <p className="text-dark-700 text-sm leading-relaxed mt-4 mb-6">
                &ldquo;{comment}&rdquo;
              </p>

              {/* Auteur */}
              <div className="flex items-center justify-between pt-5 border-t border-dark-200">
                <div>
                  <div className="font-heading font-bold text-dark-900 text-sm">
                    {name}
                  </div>
                  <div className="text-dark-400 text-xs mt-0.5">{location}</div>
                </div>
                <div className="text-dark-400 text-xs">{date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
