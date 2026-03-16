import Link from "next/link";
import { Phone, MessageSquare, ShieldCheck } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-brand-600 relative overflow-hidden">
      {/* Motif géométrique sobre */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "30px 30px",
        }}
      />
      {/* Ombre intérieure droite */}
      <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-700/50 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

          {/* Texte gauche */}
          <div className="lg:max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck size={18} className="text-white/70" />
              <span className="text-white/80 font-semibold text-xs uppercase tracking-[0.18em]">
                Devis gratuit · Sans engagement
              </span>
            </div>
            <h2 className="font-heading font-black text-white text-4xl md:text-5xl leading-tight mb-5">
              Besoin d&apos;une réparation<br />rapide et fiable ?
            </h2>
            <p className="text-white/80 text-base leading-relaxed">
              Contactez-nous par téléphone ou via notre formulaire.
              Nous intervenons sur tous types de véhicules et établissons
              un devis détaillé sous 24h.
            </p>
          </div>

          {/* Actions droite */}
          <div className="flex flex-col gap-4 lg:flex-shrink-0">
            <a
              href="tel:0532002038"
              className="inline-flex items-center justify-center gap-3 bg-white text-brand-700 hover:bg-dark-50 font-bold px-8 py-4 rounded-lg text-base transition-colors shadow-xl"
            >
              <Phone size={19} />
              05 32 00 20 38
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg text-base transition-colors"
            >
              <MessageSquare size={18} />
              Envoyer un message
            </Link>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-white/70 text-xs mt-1">
              {["Réponse sous 24h", "Prix transparents", "Avec ou sans RDV"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-white/60 rounded-full" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
