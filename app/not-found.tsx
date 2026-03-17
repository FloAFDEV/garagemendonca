"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Wrench, Car } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function NotFound() {
  return (
    <MainLayout>
      <section className="relative min-h-[80vh] flex items-center bg-[#0f172a] overflow-hidden">

        {/* Trait accent gauche */}
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" aria-hidden="true" />

        {/* Lueur décorative */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 relative text-center">

          {/* Numéro 404 géant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="select-none"
            aria-hidden="true"
          >
            <span className="font-heading font-black text-[160px] md:text-[220px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-slate-800">
              404
            </span>
          </motion.div>

          {/* Icône */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="flex justify-center mb-6 -mt-6"
            aria-hidden="true"
          >
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center">
              <Wrench className="h-7 w-7 text-brand-400" strokeWidth={1.75} />
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
          >
            <h1 className="font-heading font-black text-white text-3xl md:text-4xl mb-4">
              Page introuvable
            </h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
              Cette page n'existe pas ou a été déplacée. Pas de panique,
              nos mécaniciens sont là pour remettre ça sur les rails.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="btn-primary px-8 py-3.5">
                <ArrowLeft size={17} />
                Retour à l'accueil
              </Link>
              <Link href="/services" className="btn-outline px-8 py-3.5">
                <Wrench size={17} />
                Voir nos services
              </Link>
              <a href="tel:0532002038" className="btn-outline px-8 py-3.5">
                <Phone size={17} />
                05 32 00 20 38
              </a>
            </div>
          </motion.div>

          {/* Liens rapides */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-3"
          >
            {[
              { href: "/vehicules", label: "Véhicules d'occasion", Icon: Car },
              { href: "/contact", label: "Contact & Devis", Icon: Phone },
              { href: "/services", label: "Nos Services", Icon: Wrench },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
