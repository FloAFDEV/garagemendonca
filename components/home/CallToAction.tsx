import Link from "next/link";
import { Phone, MessageSquare, CalendarDays, ShieldCheck } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";

const reassurances = ["Devis 100% gratuit", "Réponse sous 24h", "Avec ou sans RDV", "Prix transparents"];

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-[#0f172a]">

      {/* Accent bar top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />

      {/* Lueur subtile */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2/3 opacity-[0.05]"
        style={{ background: "radial-gradient(ellipse at 20% 50%, #f97316 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <AnimateOnScroll>
        <Container className="relative py-28">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-14">

            {/* ── Texte ── */}
            <div className="lg:max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck size={14} className="text-brand-400" aria-hidden="true" />
                <span className="text-brand-400 font-normal text-[10px] uppercase tracking-caps">
                  Devis gratuit · Sans engagement
                </span>
              </div>

              {/* H2 héroïque — font-light pour le premium */}
              <h2 className="ty-display text-white text-4xl md:text-5xl mb-5">
                Besoin d&apos;une réparation<br />
                <span className="text-brand-400">rapide et fiable ?</span>
              </h2>

              <p className="font-light text-slate-300 text-base leading-relaxed mb-8">
                Contactez-nous par téléphone ou via notre formulaire.
                Nous intervenons sur tous types de véhicules et établissons
                un devis détaillé et transparent sous 24h.
              </p>

              {/* Réassurances */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {reassurances.map((item) => (
                  <span key={item} className="flex items-center gap-2 font-light text-slate-300 text-sm">
                    <span className="w-1 h-1 bg-brand-500/80 rounded-full" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-col gap-3 lg:min-w-[280px]">
              <a
                href="tel:0532002038"
                className="btn-primary w-full justify-center py-4 text-base shadow-brand hover:shadow-brand-lg"
              >
                <Phone size={18} />
                05 32 00 20 38
              </a>

              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-3 border border-white/20 hover:border-white/35 text-slate-200 hover:text-white font-normal px-8 py-4 rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5"
              >
                <MessageSquare size={16} />
                Envoyer un message
              </Link>

              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-3 border border-white/20 hover:border-white/35 text-slate-200 hover:text-white font-normal px-8 py-4 rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5"
              >
                <CalendarDays size={16} />
                Prendre rendez-vous
              </Link>
            </div>
          </div>
        </Container>
      </AnimateOnScroll>
    </section>
  );
}
