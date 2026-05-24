/**
 * categoryIcons — icônes Lucide disponibles pour les catégories de véhicules.
 *
 * Utilisé dans :
 *   - admin/categories/page.tsx  (picker)
 *   - app/occasions/**           (rendu front)
 *   - components/vehicles/**     (filtres, cartes)
 */

import {
  Car,
  Truck,
  Bus,
  Bike,
  Zap,
  Leaf,
  Gauge,
  Shield,
  Wrench,
  Globe,
  Star,
  Users,
  Award,
  Package,
  Flame,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ── Catalogue ────────────────────────────────────────────────────────────────
export interface CategoryIconDef {
  name: string;       // clé stockée en DB
  label: string;      // libellé affiché dans le picker
  Icon: LucideIcon;
}

export const CATEGORY_ICON_LIST: CategoryIconDef[] = [
  { name: "Car",      label: "Voiture",        Icon: Car      },
  { name: "Truck",    label: "Utilitaire",      Icon: Truck    },
  { name: "Bus",      label: "Minibus",         Icon: Bus      },
  { name: "Bike",     label: "Moto",            Icon: Bike     },
  { name: "Zap",      label: "Électrique",      Icon: Zap      },
  { name: "Leaf",     label: "Hybride / Eco",   Icon: Leaf     },
  { name: "Gauge",    label: "Sportive",        Icon: Gauge    },
  { name: "Globe",    label: "Import / Japon",  Icon: Globe    },
  { name: "Users",    label: "Familiale",       Icon: Users    },
  { name: "Package",  label: "SUV / 4×4",       Icon: Package  },
  { name: "Shield",   label: "Garantie",        Icon: Shield   },
  { name: "Wrench",   label: "Révisée",         Icon: Wrench   },
  { name: "Star",     label: "Premium",         Icon: Star     },
  { name: "Award",    label: "Coup de cœur",    Icon: Award    },
  { name: "Flame",    label: "Nouveauté",       Icon: Flame    },
  { name: "Sparkles", label: "Exclusivité",     Icon: Sparkles },
];

// Lookup rapide nom → définition
const ICON_MAP = Object.fromEntries(
  CATEGORY_ICON_LIST.map((d) => [d.name, d]),
) as Record<string, CategoryIconDef>;

/**
 * Retourne le composant Lucide correspondant au nom stocké en DB,
 * ou `null` si inconnu (pas d'emoji, pas de fallback texte).
 */
export function getCategoryIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name]?.Icon ?? null;
}
