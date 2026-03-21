"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Wrench, Car } from "lucide-react";
import Header from "@/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 text-center">

        {/* Numéro 404 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span
            className="font-heading font-light leading-none text-[clamp(100px,20vw,180px)] text-brand-500 select-none"
            aria-hidden="true"
          >
            404
          </span>
        </motion.div>

        {/* Icône */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mb-5"
          aria-hidden="true"
        >
          <div className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto">
            <Wrench className="h-6 w-6 text-brand-500" strokeWidth={1.75} />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="max-w-md"
        >
          <h1 className="ty-heading text-[#0f172a] text-3xl md:text-4xl mb-3">
            Page introuvable
          </h1>
          <p className="text-[#475569] text-base leading-relaxed mb-8">
            Cette page n'existe pas ou a été déplacée.
            Nos mécaniciens sont là pour vous remettre sur la bonne route.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/" className="btn-primary px-7 py-3">
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>
            <Link href="/services" className="btn-secondary px-7 py-3">
              <Wrench size={16} />
              Nos services
            </Link>
            <a href="tel:0532002038" className="btn-secondary px-7 py-3">
              <Phone size={16} />
              Nous appeler
            </a>
          </div>

          {/* Liens rapides */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: "/vehicules", label: "Occasions", Icon: Car },
              { href: "/contact", label: "Contact & Devis", Icon: Phone },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-slate-200 text-[#475569] text-sm hover:border-brand-300 hover:text-brand-600 transition-all duration-200 shadow-sm"
              >
                <Icon size={13} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  );
}
