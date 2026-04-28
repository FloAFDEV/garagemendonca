"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Car, Phone } from "lucide-react";
import Header from "@/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] mt-16 md:mt-[72px] bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-12 text-center">

        {/* Illustration — ratio 3:2 paysage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
          aria-hidden="true"
        >
          <Image
            src="/images/404-illustration.webp"
            alt=""
            width={600}
            height={400}
            className="w-[280px] h-auto md:w-[380px] object-contain mx-auto"
            priority
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className="max-w-lg"
        >
          <h1 className="font-heading font-medium text-[#0f172a] text-3xl md:text-4xl mb-4 tracking-tight">
            Oups&nbsp;! Cette route est sans issue.
          </h1>
          <p className="text-[#475569] text-base md:text-lg leading-relaxed mb-10">
            Le véhicule ou la page que vous recherchez n&apos;est plus disponible
            ou a changé d&apos;adresse. Ne restez pas sur le bas-côté, laissez-nous
            vous rediriger.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/" className="btn-primary w-full sm:w-auto px-7 py-3 justify-center">
              <ArrowLeft size={20} strokeWidth={1.75} />
              Retourner à l&apos;accueil
            </Link>
            <Link href="/vehicules" className="btn-secondary w-full sm:w-auto px-7 py-3 justify-center">
              <Car size={20} strokeWidth={1.75} />
              Voir nos véhicules d&apos;occasion
            </Link>
          </div>

          {/* Lien assistance */}
          <p className="text-[#64748b] text-sm">
            Besoin d&apos;aide&nbsp;?{" "}
            <a
              href="tel:0532002038"
              className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors"
            >
              <Phone size={14} strokeWidth={1.75} aria-hidden="true" />
              Contactez l&apos;atelier au 05&nbsp;32&nbsp;00&nbsp;20&nbsp;38
            </a>
          </p>
        </motion.div>
      </main>
    </>
  );
}
