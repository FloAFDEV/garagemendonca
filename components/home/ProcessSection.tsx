"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhoneCall, Search, FileText, Wrench, CarFront, Phone } from "lucide-react";

/* ── Data ─────────────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    Icon: PhoneCall,
    title: "Prise de contact",
    desc: "Appelez le 05 32 00 20 38 ou envoyez un message. Accueil avec ou sans rendez-vous, du lundi au vendredi.",
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
  },
  {
    num: "02",
    Icon: Search,
    title: "Diagnostic",
    desc: "Diagnostic rapide sur équipement dernière génération. Lecture des codes défaut OBD, toutes marques.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
  },
  {
    num: "03",
    Icon: FileText,
    title: "Devis transparent",
    desc: "Devis pièce et main-d'œuvre détaillé avant toute intervention. Aucune surprise sur la facture.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  {
    num: "04",
    Icon: Wrench,
    title: "Réparation",
    desc: "Intervention par nos mécaniciens qualifiés. Préconisations constructeur toujours respectées.",
    color: "text-brand-600",
    bg: "bg-brand-50",
    ring: "ring-brand-200",
  },
  {
    num: "05",
    Icon: CarFront,
    title: "Restitution",
    desc: "Véhicule restitué propre (nettoyage intérieur/extérieur inclus) avec compte-rendu complet des travaux.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
] as const;

/* ── Animation variants ───────────────────────────────────── */
const fadeUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
};

const lineVariant: import("framer-motion").Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut" } },
};

/* ── Component ────────────────────────────────────────────── */
export default function ProcessSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="process"
      className="py-28 bg-white overflow-hidden"
      aria-labelledby="process-heading"
    >
      <div className="container mx-auto px-4">

        {/* ── Header ───────────────────────────── */}
        <motion.div
          className="max-w-xl mb-16"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-8 h-[2px] bg-brand-500 rounded-full mb-4" aria-hidden="true" />
          <p className="text-brand-500 font-semibold text-xs uppercase tracking-[0.16em] mb-3">
            Comment ça se passe
          </p>
          <h2
            id="process-heading"
            className="font-heading font-extrabold text-[#0f172a] text-3xl md:text-4xl leading-tight"
          >
            Du diagnostic à la restitution,<br />
            un processus clair et transparent
          </h2>
          <p className="text-[#475569] text-base mt-4 leading-relaxed">
            Chaque intervention suit le même protocole rigoureux — vous êtes
            informé à chaque étape, sans mauvaise surprise.
          </p>
        </motion.div>

        {/* ── Étapes ───────────────────────────── */}
        <div className="relative">

          {/* Ligne de connexion desktop */}
          <motion.div
            className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-px bg-slate-200 origin-left"
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={lineVariant}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map(({ num, Icon, title, desc, color, bg, ring }, i) => (
              <motion.article
                key={num}
                custom={reduceMotion ? 0 : i * 0.09}
                initial={reduceMotion ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="flex flex-col group"
              >
                {/* Cercle icône */}
                <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-0 mb-5 lg:mb-6">
                  <div
                    className={`relative z-10 w-[72px] h-[72px] lg:w-[80px] lg:h-[80px] flex-shrink-0
                      rounded-full ${bg} ring-2 ${ring}
                      flex items-center justify-center
                      transition-all duration-300
                      group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]`}
                  >
                    <Icon
                      size={28}
                      className={`${color} transition-transform duration-300 group-hover:scale-110`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Num — mobile */}
                  <span
                    className="lg:hidden font-heading font-black text-slate-200 text-3xl leading-none select-none"
                    aria-hidden="true"
                  >
                    {num}
                  </span>
                </div>

                {/* Num — desktop */}
                <span
                  className="hidden lg:block font-heading font-black text-slate-200 text-sm mb-2 tracking-widest select-none"
                  aria-hidden="true"
                >
                  {num}
                </span>

                <h3 className="font-heading font-bold text-[#0f172a] text-base mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-[#475569] text-sm leading-[1.7]">
                  {desc}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* ── Encadré véhicule de courtoisie ────── */}
        <motion.div
          className="mt-16 pt-12 border-t border-slate-200"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            {/* Badge courtoisie */}
            <div className="inline-flex items-center gap-3 bg-[#f8fafc] border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm">
              <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center ring-1 ring-brand-100 flex-shrink-0">
                <CarFront size={18} className="text-brand-500" aria-hidden="true" />
              </div>
              <p className="text-sm text-[#475569] leading-snug">
                Véhicule de courtoisie disponible —{" "}
                <strong className="text-[#0f172a] font-semibold">
                  9 véhicules offerts
                </strong>{" "}
                pendant toute intervention
              </p>
            </div>

            {/* CTA */}
            <a
              href="tel:0532002038"
              className="btn-primary flex-shrink-0"
            >
              <Phone size={16} aria-hidden="true" />
              Prendre rendez-vous
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
