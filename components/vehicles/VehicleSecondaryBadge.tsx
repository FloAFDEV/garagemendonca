/**
 * VehicleSecondaryBadge — badge de statut SECONDAIRE (coin haut-droite de la
 * photo véhicule). Purement présentationnel : aucune logique métier, aucun
 * statut dérivé. Le composant parent décide quand (et lequel) l'afficher.
 *
 * Hiérarchie : volontairement discret — ne doit jamais concurrencer le badge
 * primaire « À la une » (haut-gauche) ni le CTA principal.
 *
 * - "preparation" : glassmorphism (noir translucide ~40% + backdrop blur),
 *   neutre/informatif, non urgent.
 * - "arrivage"    : opaque sobre (ambre premium amber-700, sans dégradé),
 *   évoque une disponibilité prochaine sans effet promotionnel.
 *
 * Sans icône. Texte en MAJUSCULES (via CSS `uppercase` — le libellé reste en
 * casse normale dans le DOM pour une lecture correcte par les lecteurs d'écran).
 */

export type VehicleSecondaryStatus = "preparation" | "arrivage";

const CONFIG: Record<VehicleSecondaryStatus, { label: string; surface: string }> = {
  preparation: {
    label: "En préparation",
    surface:
      "bg-black/40 supports-[backdrop-filter]:bg-black/30 backdrop-blur-md ring-1 ring-white/15",
  },
  arrivage: {
    label: "En cours d'arrivage",
    surface: "bg-amber-700 ring-1 ring-amber-300/25",
  },
};

interface VehicleSecondaryBadgeProps {
  status: VehicleSecondaryStatus;
  className?: string;
}

export default function VehicleSecondaryBadge({
  status,
  className = "",
}: VehicleSecondaryBadgeProps) {
  const { label, surface } = CONFIG[status];

  return (
    <span
      className={[
        "inline-flex items-center rounded-md sm:rounded-lg",
        "px-2 py-0.5 sm:px-2.5 sm:py-1",
        "text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.08em]",
        "leading-none text-white whitespace-nowrap select-none",
        "shadow-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]",
        surface,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
