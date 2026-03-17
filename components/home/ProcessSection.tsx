"use client";

import { motion } from "framer-motion";
import { PhoneCall, Search, FileText, Wrench, CarFront } from "lucide-react";

const steps = [
  { num: "01", icon: PhoneCall, title: "Prise de contact", desc: "Appelez le 05 32 00 20 38 ou envoyez un message. Accueil avec ou sans rendez-vous." },
  { num: "02", icon: Search, title: "Diagnostic", desc: "Diagnostic en 10 min sur équipement dernière génération. Toutes marques." },
  { num: "03", icon: FileText, title: "Devis transparent", desc: "Devis pièce et main-d'œuvre détaillé avant toute intervention. Aucune surprise." },
  { num: "04", icon: Wrench, title: "Réparation", desc: "Intervention par nos mécaniciens qualifiés. Préconisations constructeur respectées." },
  { num: "05", icon: CarFront, title: "Restitution", desc: "Véhicule restitué propre avec nettoyage et compte-rendu complet des travaux." },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-brand-500 font-semibold text-sm tracking-widest uppercase mb-3">Comment ça se passe</p>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#0f172a]">
            Du diagnostic à la restitution
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative text-center"
            >
              <div className="h-14 w-14 mx-auto rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                <step.icon className="h-6 w-6 text-brand-500" />
              </div>
              <span className="text-[10px] font-bold text-brand-500 tracking-widest uppercase">{step.num}</span>
              <h3 className="font-heading font-semibold text-[#0f172a] mt-1 mb-2">{step.title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{step.desc}</p>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(50%+35px)] w-[calc(100%-70px)] h-px bg-slate-200" />
              )}
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm text-[#475569]">
            <CarFront className="h-4 w-4 text-brand-500" />
            <span>Véhicule de courtoisie disponible — <strong className="text-[#0f172a]">9 véhicules</strong> offerts pendant l'intervention</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
