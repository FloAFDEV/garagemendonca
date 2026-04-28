/**
 * Identifiant du garage actif.
 *
 * En déploiement mono-garage : définir NEXT_PUBLIC_GARAGE_ID dans .env.local.
 * En déploiement multi-garage : chaque instance Vercel/container reçoit
 * sa propre variable d'environnement pointant vers un garage différent.
 *
 * La valeur est exposée côté client (NEXT_PUBLIC_) pour permettre son
 * utilisation dans les composants Client sans passer de props.
 */
export const ACTIVE_GARAGE_ID =
	process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
