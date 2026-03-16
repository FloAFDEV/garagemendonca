import Link from "next/link";
import { Phone, ArrowRight, ShieldCheck, Clock, Award } from "lucide-react";

const credibilityStats = [
  { value: "30+", label: "Ans d'expérience" },
  { value: "+1 000", label: "Véhicules réparés" },
  { value: "160", label: "Points de contrôle" },
  { value: "9", label: "Véhicules de prêt" },
];

const trustBadges = [
  { Icon: ShieldCheck, text: "Devis pièce & main-d'œuvre avant toute intervention" },
  { Icon: Clock, text: "Accueil avec ou sans rendez-vous" },
  { Icon: Award, text: "Spécialiste BMW · Audi · Volkswagen · Mercedes" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-dark-950">

      {/* ── Fond photo ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=85')",
        }}
        aria-hidden="true"
      />

      {/* ── Overlays multi-couches ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-950/98 via-dark-950/85 to-dark-950/40" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-brand-600/8 to-transparent" aria-hidden="true" />

      {/* ── Trait accent gauche ── */}
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" aria-hidden="true" />

      {/* ── Contenu ── */}
      <div className="relative flex-1 flex items-center">
        <div className="container mx-auto px-4 pt-40 pb-20">
          <div className="max-w-2xl xl:max-w-3xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <div className="w-8 h-px bg-brand-500" />
              <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
                Garagiste Drémil-Lafage · Haute-Garonne · Depuis 1993
              </span>
            </div>

            {/* Titre — adapté du H1 réel */}
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.03] mb-6 animate-slide-up">
              Garage auto<br />
              à{" "}
              <span className="relative">
                <span className="text-brand-500">Drémil-Lafage</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-500/50" aria-hidden="true" />
              </span>
            </h1>

            {/* Texte exact du site original */}
            <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-slide-up">
              Avec une expérience de plus de 30 ans, le Garage Mendonça est
              votre spécialiste de la mécanique, la carrosserie et la vente
              en région toulousaine.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14 animate-slide-up">
              <a
                href="tel:0532002038"
                className="btn-primary text-base py-4 px-8 shadow-brand-lg"
              >
                <Phone size={18} />
                Appeler maintenant
              </a>
              <Link
                href="/contact"
                className="btn-outline text-base py-4 px-8"
              >
                Demander un devis gratuit
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* ── Ligne de crédibilité ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10 animate-fade-in">
              {credibilityStats.map(({ value, label }) => (
                <div key={label} className="text-center sm:text-left">
                  <div className="font-heading font-black text-3xl text-white leading-none mb-1">
                    {value}
                  </div>
                  <div className="text-dark-400 text-xs leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Badges flottants — desktop ── */}
      <div className="absolute bottom-14 right-8 hidden xl:flex flex-col gap-3 animate-fade-in">
        {trustBadges.map(({ Icon, text }) => (
          <div
            key={text}
            className="bg-dark-900/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 text-white text-sm shadow-premium"
          >
            <Icon size={17} className="text-brand-400 flex-shrink-0" />
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <div className="relative pb-10 flex flex-col items-center gap-2 text-dark-600" aria-hidden="true">
        <span className="text-xs uppercase tracking-widest">Découvrir</span>
        <div className="w-px h-8 bg-gradient-to-b from-dark-600 to-transparent" />
      </div>
    </section>
  );
}
