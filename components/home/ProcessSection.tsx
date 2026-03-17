"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  PhoneCall,
  Search,
  FileText,
  Wrench,
  CarFront,
  type LucideIcon,
} from "lucide-react";

/* ─────────────── données ─────────────── */

const steps: { num: string; Icon: LucideIcon; title: string; desc: string }[] = [
  { num: "01", Icon: PhoneCall, title: "Prise de contact",   desc: "Appelez le 05 32 00 20 38 ou envoyez un message. Accueil avec ou sans rendez-vous." },
  { num: "02", Icon: Search,    title: "Diagnostic",          desc: "Diagnostic rapide sur équipement dernière génération, toutes marques." },
  { num: "03", Icon: FileText,  title: "Devis transparent",   desc: "Devis détaillé pièce et main-d'œuvre avant intervention. Aucune surprise." },
  { num: "04", Icon: Wrench,    title: "Réparation",          desc: "Intervention par nos mécaniciens qualifiés. Préconisations constructeur respectées." },
  { num: "05", Icon: CarFront,  title: "Restitution",         desc: "Véhicule restitué propre avec compte-rendu complet des travaux. Véhicule de courtoisie disponible." },
];

/* ─────────────── carte étape ─────────────── */

function StepCard({
  step,
  index,
  side,
  reduced,
}: {
  step: (typeof steps)[number];
  index: number;
  side: "left" | "right";
  reduced: boolean;
}) {
  const { Icon, title, desc } = step;
  const isLeft = side === "left";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: isLeft ? -24 : 24 }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number], delay: index * 0.08 }}
      className={`
        group flex items-center gap-4
        bg-white rounded-2xl border border-slate-200
        px-6 py-5 shadow-card
        hover:shadow-card-hover hover:-translate-y-[2px]
        transition-shadow,transform duration-300
        ${isLeft ? "flex-row-reverse text-right" : "flex-row text-left"}
      `}
    >
      <div aria-hidden="true" className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors duration-200">
        <Icon className="h-5 w-5 text-brand-500" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading font-bold text-[#0f172a] text-[15px] leading-snug mb-1">{title}</h3>
        <p className="text-[#475569] text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────── composant principal ─────────────── */

export default function ProcessSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="process" className="py-24 bg-white" aria-labelledby="process-title">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ── En-tête ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
          className="text-center mb-20"
        >
          <div className="section-divider mx-auto" />
          <span className="eyebrow">Notre processus</span>
          <h2 id="process-title" className="section-title mt-1">Du diagnostic à la restitution</h2>
          <p className="section-subtitle mx-auto max-w-xl">
            Un suivi clair, de votre premier appel jusqu'à la remise des clés.
          </p>
        </motion.div>

        {/* ── Timeline ── */}
        <div className="relative max-w-3xl mx-auto">
          <div aria-hidden="true" className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent pointer-events-none" />

          <ol className="flex flex-col gap-8" role="list">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li key={step.num} className="relative grid grid-cols-1 sm:grid-cols-[1fr_56px_1fr] items-center">
                  {/* Desktop gauche */}
                  <div className="hidden sm:block">
                    {isLeft && <StepCard step={step} index={i} side="left" reduced={reduced} />}
                  </div>

                  {/* Badge centre */}
                  <motion.div
                    aria-hidden="true"
                    initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                    whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.35, delay: i * 0.08 + 0.05 }}
                    className="hidden sm:flex justify-center items-center z-10"
                  >
                    <div className="w-11 h-11 rounded-full bg-white border-2 border-brand-500/30 shadow-sm ring-4 ring-white flex items-center justify-center">
                      <span className="font-heading font-black text-[11px] tracking-widest text-brand-500">{step.num}</span>
                    </div>
                  </motion.div>

                  {/* Desktop droite */}
                  <div className="hidden sm:block">
                    {!isLeft && <StepCard step={step} index={i} side="right" reduced={reduced} />}
                  </div>

                  {/* Mobile */}
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number], delay: i * 0.08 }}
                    className="sm:hidden flex items-center gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-card"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                      <span className="font-heading font-black text-[10px] tracking-widest text-brand-500">{step.num}</span>
                      <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <step.Icon className="h-[18px] w-[18px] text-brand-500" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-[#0f172a] text-[15px] leading-snug mb-1">{step.title}</h3>
                      <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Encadré courtoisie ── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-16 flex justify-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-6 py-4 shadow-sm max-w-lg w-full text-center sm:text-left">
            <div aria-hidden="true" className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-200 flex items-center justify-center">
              <CarFront className="h-5 w-5 text-brand-500" strokeWidth={1.75} />
            </div>
            <p className="text-sm text-[#475569] leading-snug">
              Véhicule de courtoisie disponible —{" "}
              <strong className="font-semibold text-[#0f172a]">9 véhicules offerts</strong>{" "}
              pendant l'intervention
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
