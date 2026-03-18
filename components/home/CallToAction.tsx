import Link from "next/link";
import { Phone, MessageSquare, CalendarDays, ShieldCheck } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const reassurances = ["Devis 100% gratuit", "Réponse sous 24h", "Avec ou sans RDV", "Prix transparents"];

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-[#0f172a]">

      {/* ── Accent bar top ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />

      {/* ── Lueur subtile ── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2/3 opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse at 20% 50%, #f97316 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <AnimateOnScroll>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-14">

            {/* ── Texte ── */}
            <div className="lg:max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck size={16} className="text-brand-400" aria-hidden="true" />
                <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
                  Devis gratuit · Sans engagement
                </span>
              </div>

              <h2 className="font-heading font-black text-white text-4xl md:text-5xl leading-[1.08] mb-5">
                Besoin d&apos;une réparation<br />
                <span className="text-brand-400">rapide et fiable ?</span>
              </h2>

              <p className="text-slate-200 text-base leading-relaxed mb-8">
                Contactez-nous par téléphone ou via notre formulaire.
                Nous intervenons sur tous types de véhicules et établissons
                un devis détaillé et transparent sous 24h.
              </p>

              {/* Réassurances */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {reassurances.map((item) => (
                  <span key={item} className="flex items-center gap-2 text-slate-200 text-sm">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-col gap-4 lg:min-w-[280px]">
              <a
                href="tel:0532002038"
                className="inline-flex items-center justify-center gap-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold px-8 py-[18px] rounded-lg text-base transition-all duration-200 shadow-brand-lg hover:shadow-brand hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <Phone size={19} />
                05 32 00 20 38
              </a>

              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-3 border border-white/20 hover:border-white/40 text-slate-100 hover:text-white font-semibold px-8 py-4 rounded-lg text-base transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5"
              >
                <MessageSquare size={18} />
                Envoyer un message
              </Link>

              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-3 border border-white/20 hover:border-white/40 text-slate-100 hover:text-white font-semibold px-8 py-4 rounded-lg text-base transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5"
              >
                <CalendarDays size={18} />
                Prendre rendez-vous
              </Link>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
