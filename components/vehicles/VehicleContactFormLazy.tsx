"use client";

/**
 * VehicleContactFormLazy
 * ─────────────────────────────────────────────────────────────────────────────
 * Wrapper client pour lazy-loader VehicleContactForm (+ zod, tanstack mutation).
 *
 * Pourquoi : VehicleContactForm importe zod/v4 (~96 kB parsé).
 * Le formulaire est positionné en bas de page (hors viewport initial) — aucun
 * impact UX à le charger après le rendu initial.
 *
 * Résultat : zod sort du chemin critique de /vehicules/[slug].
 * Comportement, styles et feedback (inline + toast) : identiques.
 */

import dynamic from "next/dynamic";

const VehicleContactForm = dynamic(
  () => import("@/components/vehicles/VehicleContactForm"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200" />
    ),
  },
);

export default VehicleContactForm;
