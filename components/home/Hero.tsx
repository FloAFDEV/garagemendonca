import Link from "next/link";
import { Phone, ArrowRight, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-950">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-950/95 via-dark-950/80 to-dark-950/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent" />

      {/* Decorative accent */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <div className="w-8 h-0.5 bg-brand-500" />
            <span className="text-brand-400 font-semibold text-sm uppercase tracking-widest">
              Garage Indépendant · Drémil-Lafage
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-black text-white text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 animate-slide-up">
            Votre garage{" "}
            <span className="text-gradient">de confiance</span>
            <br />
            depuis 30 ans
          </h1>

          <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-slide-up">
            Entretien, réparation mécanique, carrosserie et vente de véhicules
            d&apos;occasion. Un service de qualité, des prix transparents.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-slide-up">
            <a href="tel:0561837805" className="btn-primary text-base py-4 px-8">
              <Phone size={18} />
              Appeler maintenant
            </a>
            <Link href="/vehicules" className="btn-outline text-base py-4 px-8">
              Voir nos véhicules
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 animate-fade-in">
            {[
              { value: "30+", label: "ans d'expérience" },
              { value: "500+", label: "clients fidèles" },
              { value: "Toutes", label: "marques acceptées" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading font-black text-3xl text-white">
                  {stat.value}
                </div>
                <div className="text-dark-400 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500 animate-bounce">
        <span className="text-xs uppercase tracking-widest">Découvrir</span>
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
