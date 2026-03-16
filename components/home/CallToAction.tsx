import Link from "next/link";
import { Phone, MessageSquare } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-20 bg-dark-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-noise opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 text-center">
        <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-widest mb-4">
          Prêt à nous confier votre véhicule ?
        </span>
        <h2 className="font-heading font-black text-white text-4xl md:text-5xl mb-6 max-w-3xl mx-auto leading-tight">
          Devis gratuit et sans engagement en 24h
        </h2>
        <p className="text-dark-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Contactez-nous par téléphone ou via notre formulaire. Nous vous
          répondons rapidement et établissons un devis détaillé et transparent.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:0561837805"
            className="btn-primary text-base py-4 px-10 shadow-2xl shadow-brand-600/30"
          >
            <Phone size={18} />
            05 61 83 78 05
          </a>
          <Link
            href="/contact"
            className="btn-outline text-base py-4 px-10"
          >
            <MessageSquare size={18} />
            Envoyer un message
          </Link>
        </div>

        {/* Reassurance */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-dark-400">
          {["Devis gratuit", "Réponse sous 24h", "Sans engagement", "Prix transparents"].map(
            (item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                {item}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
