"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Boundary d'erreur racine — capte les erreurs non gérées sur toutes les routes
 * sauf celles qui ont leur propre error.tsx (ex: /vehicules/error.tsx).
 * Client Component obligatoire — n'importe pas MainLayout (server-only chain).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div
            className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            aria-hidden="true"
          >
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h1 className="text-white text-xl font-medium mb-3">
            Une erreur est survenue
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Quelque chose s&apos;est mal passé. Réessayez ou revenez à
            l&apos;accueil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
