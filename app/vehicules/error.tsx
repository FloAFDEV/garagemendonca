"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Boundary d'erreur pour /vehicules — Client Component.
 * N'importe pas MainLayout (chaîne server-only via PromoBanner → supabaseAdminClient).
 * Le layout parent (app/layout.tsx) enveloppe déjà Header / Footer.
 */
export default function VehiculesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/vehicules] Erreur chargement catalogue:", error);
  }, [error]);

  return (
    <section className="bg-[#0f172a] pt-36 pb-20 min-h-[60vh] flex items-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div
          className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h1 className="text-white text-2xl font-heading mb-3">
          Impossible de charger le catalogue
        </h1>
        <p className="text-slate-400 text-base mb-8 leading-relaxed">
          Une erreur est survenue lors du chargement des véhicules.
          Réessayez dans quelques instants ou revenez à l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
