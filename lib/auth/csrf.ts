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

export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");

  // Appel direct serveur → pas d'Origin, pas de risque CSRF
  if (!origin) return;

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
