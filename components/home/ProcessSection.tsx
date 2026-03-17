"use client";

import { motion } from "framer-motion";
import { PhoneCall, Search, FileText, Wrench, CarFront } from "lucide-react";

const steps = [
  { num: "01", icon: PhoneCall, title: "Prise de contact",   desc: "Appelez le 05 32 00 20 38 ou envoyez un message. Accueil avec ou sans rendez-vous." },
  { num: "02", icon: Search,    title: "Diagnostic",          desc: "Diagnostic en 10 min sur équipement dernière génération. Toutes marques." },
  { num: "03", icon: FileText,  title: "Devis transparent",   desc: "Devis pièce et main-d'œuvre détaillé avant toute intervention. Aucune surprise." },
  { num: "04", icon: Wrench,    title: "Réparation",          desc: "Intervention par nos mécaniciens qualifiés. Préconisations constructeur respectées." },
  { num: "05", icon: CarFront,  title: "Restitution",         desc: "Véhicule restitué propre avec nettoyage et compte-rendu complet des travaux." },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="section-divider mx-auto" />
          <span className="eyebrow">Notre processus</span>
          <h2 className="section-title">Du diagnostic à la restitution</h2>
        </motion.div>

        {/* ── Timeline ── */}
        <div className="relative">

          {/* Ligne verticale centrale */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 hidden sm:block"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-10">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
                  className="relative grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center"
                >
                  {/* Colonne gauche */}
                  {isLeft ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow duration-200 sm:mr-8">
                      <div className="flex-1 text-right">
                        <p className="text-[#0f172a] font-heading font-bold text-base mb-1">{step.title}</p>
                        <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
                      </div>
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-brand-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {/* Badge numéro (centre) */}
                  <div className="hidden sm:flex items-center justify-center w-14 flex-shrink-0 z-10">
                    <div className="w-11 h-11 rounded-full bg-white border-2 border-brand-500/30 flex items-center justify-center shadow-sm">
                      <span className="text-brand-500 font-heading font-black text-xs tracking-widest">{step.num}</span>
                    </div>
                  </div>

                  {/* Colonne droite */}
                  {!isLeft ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow duration-200 sm:ml-8">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <p className="text-[#0f172a] font-heading font-bold text-base mb-1">{step.title}</p>
                        <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {/* Mobile : carte pleine largeur */}
                  <div className="sm:hidden bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-500" />
                    </div>
                    <div>
                      <span className="text-brand-500 font-black text-[10px] tracking-widest uppercase">{step.num}</span>
                      <p className="text-[#0f172a] font-heading font-bold text-base mt-0.5 mb-1">{step.title}</p>
                      <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Badge courtoisie ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-sm text-[#475569]">
            <CarFront className="h-4 w-4 text-brand-500" />
            <span>Véhicule de courtoisie disponible — <strong className="text-[#0f172a]">9 véhicules</strong> offerts pendant l'intervention</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProcessSection;
