import Link from "next/link";
import { Phone, ArrowRight, Star, ShieldCheck, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-950">
      {/* Photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=85')",
        }}
      />

      {/* Gradient overlay — dense à gauche, s'éclaircit à droite */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/88 to-dark-950/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-dark-950/20" />

      {/* Trait rouge vertical décoratif */}
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-600" />

      <div className="relative container mx-auto px-4 pt-40 pb-24">
        <div className="max-w-2xl xl:max-w-3xl">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7 animate-fade-in">
            <div className="w-6 h-px bg-brand-500" />
            <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
              Garage indépendant · Drémil-Lafage · depuis 1993
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="font-heading font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.04] mb-7 animate-slide-up">
            Votre mécanique,{" "}
            <br className="hidden sm:block" />
            entre des mains{" "}
            <span className="text-brand-500">expertes</span>
          </h1>

          <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-slide-up">
            Entretien, réparation mécanique, carrosserie et vente de véhicules
            d&apos;occasion. Plus de 30 ans de savoir-faire à votre service.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-slide-up">
            <a
              href="tel:0532002038"
              className="btn-primary text-base py-4 px-8 shadow-lg shadow-brand-700/30"
            >
              <Phone size={18} />
              Appeler maintenant
            </a>
            <Link
              href="/contact"
              className="btn-outline text-base py-4 px-8"
            >
              Demander un devis
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* Chiffres clés */}
          <div className="flex flex-wrap gap-x-10 gap-y-5 pt-8 border-t border-white/10 animate-fade-in">
            {[
              { value: "30+", label: "Ans d'expérience" },
              { value: "Toutes", label: "Marques acceptées" },
              { value: "9", label: "Véhicules de prêt" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading font-black text-3xl text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-dark-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges de confiance flottants — desktop seulement */}
      <div className="absolute bottom-10 right-8 hidden xl:flex flex-col gap-3 animate-fade-in">
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3 text-white text-sm">
          <ShieldCheck size={18} className="text-brand-400 flex-shrink-0" />
          <span className="font-medium">Devis gratuit, sans engagement</span>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3 text-white text-sm">
          <Clock size={18} className="text-brand-400 flex-shrink-0" />
          <span className="font-medium">Réponse sous 24h garantie</span>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3 text-white text-sm">
          <Star size={18} className="text-brand-400 flex-shrink-0" />
          <span className="font-medium">Spécialiste BMW · Audi · Volkswagen</span>
        </div>
      </div>

      {/* Chevron bas */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-dark-500">
        <span className="text-xs uppercase tracking-widest">Découvrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-dark-500 to-transparent" />
      </div>
    </section>
  );
}
