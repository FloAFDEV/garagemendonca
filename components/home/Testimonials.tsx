import { Star, Quote } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const testimonials = [
  {
    name: "Patrick L.",
    initials: "PL",
    location: "Toulouse",
    rating: 5,
    date: "Juillet 2024",
    comment:
      "Après l'allumage de 3 voyants sur mon BMW X5, le diagnostic BMW préconisait une boîte de transfert à 2 000 € HT. M. Mendonça a trouvé un kit réparation servomoteur à 103 € seulement, en se battant pour obtenir la pièce au détail. Depuis, le diagnostic est vierge.",
    color: "bg-blue-600",
  },
  {
    name: "Isabelle M.",
    initials: "IM",
    location: "Drémil-Lafage",
    rating: 5,
    date: "Novembre 2024",
    comment:
      "M. Mendonça est très consciencieux. Il est intervenu sur mon véhicule et a réalisé plusieurs réparations consécutives. Il se donne la peine de tout vous expliquer, de manière claire et transparente. Je recommande sans hésiter.",
    color: "bg-emerald-600",
  },
  {
    name: "Laurent B.",
    initials: "LB",
    location: "Quint-Fonsegrives",
    rating: 5,
    date: "Septembre 2024",
    comment:
      "Véhicule de courtoisie mis à disposition pendant toute la réparation. Carrosserie refaite avec la cabine de peinture neuve, résultat impeccable. Franchise offerte et dossier assurance pris en charge. Service 5 étoiles.",
    color: "bg-violet-600",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < count ? "text-amber-400 fill-amber-400" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-28 bg-[#f8fafc]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="section-divider mx-auto" />
            <span className="eyebrow justify-center">Avis clients</span>
            <h2 className="section-title">
              Ce que disent nos clients
            </h2>
            <p className="section-subtitle mx-auto">
              La satisfaction de nos clients est notre priorité.
              Plus de 30 ans de fidélité en région toulousaine.
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Note globale ── */}
        <AnimateOnScroll delay={80}>
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="font-heading font-black text-[#0f172a] text-2xl">5.0</span>
            <span className="text-[#475569] text-sm">· Satisfaction clients, notre priorité</span>
          </div>
        </AnimateOnScroll>

        {/* ── Cartes ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, initials, location, rating, date, comment, color }, i) => (
            <AnimateOnScroll key={name} delay={i * 100}>
              <div className="relative bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 h-full">
                <Quote
                  size={28}
                  className="text-brand-100 fill-current absolute top-5 right-6"
                  aria-hidden="true"
                />

                <Stars count={rating} />

                <p className="text-[#475569] text-sm leading-[1.75] mt-4 mb-7">
                  &ldquo;{comment}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                  <div
                    className={`w-10 h-10 ${color} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}
                    aria-hidden="true"
                  >
                    <span className="text-white font-heading font-bold text-xs">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-[#0f172a] text-sm truncate">{name}</div>
                    <div className="text-[#475569] text-xs mt-0.5">{location}</div>
                  </div>
                  <div className="text-slate-400 text-xs flex-shrink-0">{date}</div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
