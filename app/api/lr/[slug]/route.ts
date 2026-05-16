/**
 * Route handler pour les redirections 301 des URLs legacy véhicules.
 *
 * Architecture :
 *   /details-{marque}+{modele}+...html
 *     → rewrite (next.config.ts) → /api/lr/{slug}
 *     → ce handler → 301 → /vehicules/{new-slug}
 *
 * Raison d'être : les URLs legacy contiennent des "+" littéraux qui
 * ne peuvent pas être parsés par path-to-regexp (utilisé par next.config redirects).
 * Déplacer la lookup table ici (server bundle) plutôt que dans middleware.ts
 * (Edge bundle) supprime le warning webpack "Serializing big strings".
 */

import { NextResponse } from "next/server";
import { VEHICLE_PATH_MAP } from "@/redirects-legacy";

export function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  // params est une Promise en Next.js 15
  return params.then(({ slug }) => {
    // Reconstruire le chemin original (le rewrite a capturé le segment sans le /)
    const originalPath = `/${slug}`;
    const destination = VEHICLE_PATH_MAP[originalPath] ?? "/vehicules";

    return NextResponse.redirect(new URL(destination, request.url), {
      status: 301,
      headers: {
        // Cache la redirection 1 an — ces URLs ne changent jamais
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
}
