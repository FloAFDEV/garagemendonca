/**
 * Protection CSRF pour les Server Actions admin.
 *
 * Mécanisme : compare le header `Origin` avec le header `Host` reçu
 * par le serveur. En Next.js App Router, les Server Actions sont envoyées
 * via POST — le navigateur inclut toujours `Origin` pour les requêtes
 * cross-site, ce qui permet de détecter les appels non autorisés.
 *
 * Cas couverts :
 *   ✓ Requêtes same-origin légitimes (Origin === Host)
 *   ✓ Appels directs serveur-serveur sans Origin (Server Components, cron…)
 *   ✗ Requêtes cross-origin depuis un domaine tiers
 *   ✗ Requêtes avec Origin malformé
 *
 * Note : Next.js 15 App Router inclut sa propre protection CSRF pour
 * les Server Actions via form submissions, mais elle peut être contournée
 * si l'action est appelée directement via fetch JSON. Ce helper constitue
 * une couche de défense-en-profondeur.
 */

import "server-only";
import { headers } from "next/headers";

export class CsrfError extends Error {
  constructor() {
    super("Requête cross-origin non autorisée.");
    this.name = "CsrfError";
  }
}

/**
 * assertSameOrigin — deux modes :
 *
 * Mode souple (défaut, strict: false) :
 *   Autorise les appels sans Origin (Server Components, crons, edge functions).
 *   Bloque uniquement les Origins cross-site explicites.
 *   Utilisé pour les Server Actions internes admin.
 *
 * Mode strict (strict: true) :
 *   Rejette en production toute requête sans Origin (appel direct d'endpoint).
 *   Utilisé pour les formulaires publics (contact) où un Origin est toujours
 *   présent dans les navigateurs légitimes.
 */
export async function assertSameOrigin({ strict = false }: { strict?: boolean } = {}): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");

  if (!origin) {
    // Mode strict : en production, absence d'Origin = appel direct suspect
    if (strict && process.env.NODE_ENV === "production") {
      console.warn("[csrf] requête sans Origin rejetée (mode strict) — IP:", h.get("x-forwarded-for") ?? "unknown");
      throw new CsrfError();
    }
    // Mode souple : appel serveur légitime
    return;
  }

  // Sans Host on ne peut pas vérifier — fail-open plutôt que bloquer
  // les déploiements non standard (proxies, edge functions)
  if (!host) return;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    // Origin malformé → bloquer
    throw new CsrfError();
  }

  if (originHost !== host) {
    throw new CsrfError();
  }
}
