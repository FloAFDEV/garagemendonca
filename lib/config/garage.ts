/**
 * Identifiant du garage actif.
 *
 * En déploiement mono-garage : définir NEXT_PUBLIC_GARAGE_ID dans .env.local.
 * En déploiement multi-garage : chaque instance Vercel/container reçoit
 * sa propre variable d'environnement pointant vers un garage différent.
 *
 * La valeur est exposée côté client (NEXT_PUBLIC_) pour permettre son
 * utilisation dans les composants Client sans passer de props.
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *  • Client Components  → import { ACTIVE_GARAGE_ID } from "@/lib/config/garage"
 *  • Server Components / Actions / API routes → getActiveGarageId()
 *
 * ── Roadmap SaaS ───────────────────────────────────────────────────────────
 * getActiveGarageId() est le seul point à modifier pour passer en multi-tenant :
 * résolution depuis le sous-domaine (headers()), le JWT, ou un slug URL.
 * Les composants Client devront à terme recevoir le garageId via Context/props.
 */

/** Constante build-time — réservée aux Client Components. */
export const ACTIVE_GARAGE_ID =
	process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

/**
 * Résout l'identifiant du garage actif dans un contexte serveur.
 *
 * Actuellement identique à ACTIVE_GARAGE_ID (mono-garage).
 * Point d'extension unique pour la future résolution multi-tenant
 * (sous-domaine, JWT, slug) sans modifier les callsites.
 */
export function getActiveGarageId(): string {
	return process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
}
