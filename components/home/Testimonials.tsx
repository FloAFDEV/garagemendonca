import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marie-Claire D.",
    initials: "MC",
    location: "Drémil-Lafage",
    rating: 5,
    date: "Décembre 2024",
    comment:
      "Excellent garage ! Accueil chaleureux, diagnostic rapide et devis transparent. Ma Toyota Yaris révisée en une journée. Je reviendrai sans hésiter.",
    color: "bg-blue-600",
  },
  {
    name: "Jean-Pierre R.",
    initials: "JP",
    location: "Quint-Fonsegrives",
    rating: 5,
    date: "Novembre 2024",
    comment:
      "Spécialistes BMW sérieux et compétents. J'avais un problème moteur récurrent que d'autres garages n'arrivaient pas à résoudre. Victor l'a trouvé en 30 minutes.",
    color: "bg-emerald-600",
  },
  {
    name: "Sophie M.",
    initials: "SM",
    location: "Montrabé",
    rating: 5,
    date: "Octobre 2024",
    comment:
      "Le véhicule de courtoisie m'a sauvé la mise. Carrosserie refaite impeccablement, couleur parfaitement assortie. Prix raisonnables et délais parfaitement tenus.",
    color: "bg-violet-600",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "text-amber-400 fill-amber-400" : "text-dark-700"}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-dark-900">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="section-divider mx-auto" />
          <span className="eyebrow-light justify-center">Avis clients</span>
          <h2 className="section-title-light">
            Ce que disent nos clients
          </h2>
          <p className="section-subtitle-light mx-auto">
            Plus de 30 ans de fidélité client en région toulousaine.
            La confiance se bâtit intervention après intervention.
          </p>
        </div>

        {/* ── Note globale ── */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="font-heading font-black text-white text-2xl">5.0</span>
          <span className="text-dark-500 text-sm">· Note moyenne · 98% de satisfaction</span>
        </div>

        {/* ── Cartes ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, initials, location, rating, date, comment, color }) => (
            <div
              key={name}
              className="relative bg-dark-850 rounded-xl border border-dark-700 hover:border-dark-600 p-7 transition-all duration-300 hover:shadow-premium hover:-translate-y-1"
            >
              {/* Icône guillemet */}
              <Quote
                size={28}
                className="text-brand-500/20 absolute top-5 right-6 fill-current"
                aria-hidden="true"
              />

              {/* Étoiles */}
              <Stars count={rating} />

              {/* Commentaire */}
              <p className="text-dark-300 text-sm leading-relaxed mt-4 mb-7">
                &ldquo;{comment}&rdquo;
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-3 pt-5 border-t border-dark-700">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 ${color} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}
                  aria-hidden="true"
                >
                  <span className="text-white font-heading font-bold text-xs">
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-white text-sm truncate">
                    {name}
                  </div>
                  <div className="text-dark-500 text-xs mt-0.5">{location}</div>
                </div>
                <div className="text-dark-600 text-xs flex-shrink-0">{date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
