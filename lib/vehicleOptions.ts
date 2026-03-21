/**
 * Configuration exhaustive des options véhicule.
 *
 * Source de vérité unique — utilisée par :
 *   - VehicleOptionsForm   (formulaire admin)
 *   - VehicleOptionsDisplay (fiche véhicule publique)
 *
 * Pour ajouter une option à l'avenir :
 *   1. Ajouter la clé dans VehicleOptions (types/index.ts)
 *   2. Ajouter l'entrée dans la catégorie concernée ici
 *   → aucun autre fichier à toucher.
 */

import type { VehicleOptions } from "@/types";
import {
  Shield,
  Navigation,
  Car,
  Wind,
  Monitor,
  Zap,
  type LucideIcon,
} from "lucide-react";

// ─── Types internes ──────────────────────────────────────────────────────────

export type OptionKey = keyof Omit<VehicleOptions, "autres_options" | "taille_jantes">;

export interface OptionDef {
  key: OptionKey;
  label: string;
  /** Si présent, affiche un champ complémentaire quand cette option est cochée */
  extraField?: {
    key: keyof VehicleOptions;
    label: string;
    type: "number";
    unit?: string;
    min?: number;
    max?: number;
  };
}

export interface OptionCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  options: OptionDef[];
}

// ─── Catégories ordonnées par priorité d'affichage ──────────────────────────

export const OPTION_CATEGORIES: OptionCategory[] = [
  // 1 — SÉCURITÉ (priorité maximale)
  {
    id: "securite",
    label: "Sécurité",
    icon: Shield,
    options: [
      { key: "abs", label: "ABS" },
      { key: "esp", label: "ESP (contrôle de stabilité)" },
      { key: "airbags", label: "Airbags frontaux" },
      { key: "airbags_lateraux", label: "Airbags latéraux" },
      { key: "airbags_rideaux", label: "Airbags rideaux" },
      { key: "aide_freinage_urgence", label: "Aide au freinage d'urgence" },
      { key: "detection_pression_pneus", label: "Détection pression pneus (TPMS)" },
      { key: "isofix", label: "Fixations ISOFIX" },
      { key: "alarme", label: "Alarme antivol" },
      { key: "antidemarrage", label: "Antidémarrage électronique" },
    ],
  },

  // 2 — AIDES À LA CONDUITE
  {
    id: "aides_conduite",
    label: "Aides à la conduite",
    icon: Navigation,
    options: [
      { key: "regulateur_vitesse", label: "Régulateur de vitesse" },
      { key: "regulateur_adaptatif", label: "Régulateur adaptatif (ACC)" },
      { key: "limiteur_vitesse", label: "Limiteur de vitesse" },
      { key: "aide_maintien_voie", label: "Aide au maintien de voie" },
      { key: "alerte_franchissement_ligne", label: "Alerte franchissement de ligne" },
      { key: "detection_angle_mort", label: "Détection angle mort" },
      { key: "freinage_automatique", label: "Freinage automatique d'urgence (AEB)" },
      { key: "detection_pietons", label: "Détection piétons / cyclistes" },
      { key: "reconnaissance_panneaux", label: "Reconnaissance des panneaux" },
      { key: "radar_avant", label: "Radar de stationnement avant" },
      { key: "radar_arriere", label: "Radar de stationnement arrière" },
      { key: "camera_recul", label: "Caméra de recul" },
      { key: "camera_360", label: "Caméra 360°" },
      { key: "stationnement_automatique", label: "Aide au stationnement automatique" },
    ],
  },

  // 3 — EXTÉRIEUR
  {
    id: "exterieur",
    label: "Extérieur",
    icon: Car,
    options: [
      {
        key: "jantes_alliage",
        label: "Jantes alliage",
        extraField: {
          key: "taille_jantes",
          label: "Taille des jantes",
          type: "number",
          unit: "pouces",
          min: 14,
          max: 24,
        },
      },
      { key: "jantes_tole", label: "Jantes tôle" },
      { key: "toit_ouvrant", label: "Toit ouvrant" },
      { key: "toit_panoramique", label: "Toit panoramique" },
      { key: "barres_toit", label: "Barres de toit" },
      { key: "vitres_teintees", label: "Vitres teintées" },
      { key: "vitres_surteintees", label: "Vitres surteintées" },
      { key: "retroviseurs_electriques", label: "Rétroviseurs électriques" },
      { key: "retroviseurs_rabattables", label: "Rétroviseurs rabattables électriques" },
      { key: "retroviseurs_degivrants", label: "Rétroviseurs dégivrants" },
      { key: "feux_led", label: "Feux LED" },
      { key: "feux_xenon", label: "Feux Xénon" },
      { key: "feux_matrix_led", label: "Feux Matrix LED" },
      { key: "feux_automatiques", label: "Feux automatiques" },
      { key: "essuie_glaces_automatiques", label: "Essuie-glaces automatiques (pluie)" },
      { key: "attelage", label: "Attelage" },
      { key: "hayon_electrique", label: "Hayon / coffre électrique" },
      { key: "portes_coulissantes", label: "Portières coulissantes" },
      { key: "fermeture_soft_close", label: "Fermeture Soft Close" },
    ],
  },

  // 4 — INTÉRIEUR & CONFORT
  {
    id: "interieur",
    label: "Intérieur & Confort",
    icon: Wind,
    options: [
      { key: "climatisation", label: "Climatisation manuelle" },
      { key: "climatisation_automatique", label: "Climatisation automatique" },
      { key: "climatisation_bizone", label: "Climatisation bi-zone" },
      { key: "climatisation_trizone", label: "Climatisation tri-zone" },
      { key: "sieges_chauffants", label: "Sièges chauffants" },
      { key: "sieges_ventiles", label: "Sièges ventilés" },
      { key: "sieges_massants", label: "Sièges massants" },
      { key: "sieges_electriques", label: "Sièges électriques" },
      { key: "sieges_memoire", label: "Sièges à mémoire de position" },
      { key: "sellerie_cuir", label: "Sellerie cuir" },
      { key: "sellerie_alcantara", label: "Sellerie Alcantara" },
      { key: "sellerie_tissu", label: "Sellerie tissu" },
      { key: "volant_cuir", label: "Volant cuir" },
      { key: "volant_chauffant", label: "Volant chauffant" },
      { key: "volant_reglable", label: "Volant réglable en hauteur / profondeur" },
      { key: "accoudoir_central", label: "Accoudoir central" },
      { key: "vitres_electriques_avant", label: "Vitres électriques avant" },
      { key: "vitres_electriques_arriere", label: "Vitres électriques arrière" },
      { key: "fermeture_centralisee", label: "Fermeture centralisée" },
      { key: "demarrage_sans_cle", label: "Démarrage sans clé (keyless start)" },
      { key: "coffre_electrique", label: "Coffre électrique" },
      { key: "ouverture_sans_cle", label: "Ouverture sans clé (keyless entry)" },
    ],
  },

  // 5 — MULTIMÉDIA & TECHNOLOGIE
  {
    id: "multimedia",
    label: "Multimédia & Technologie",
    icon: Monitor,
    options: [
      { key: "ecran_tactile", label: "Écran tactile" },
      { key: "tableau_bord_numerique", label: "Tableau de bord numérique / virtuel" },
      { key: "affichage_tete_haute", label: "Affichage tête haute (HUD)" },
      { key: "gps", label: "GPS / Navigation intégré" },
      { key: "bluetooth", label: "Bluetooth" },
      { key: "commande_vocale", label: "Commande vocale" },
      { key: "chargeur_induction", label: "Chargeur à induction" },
      { key: "usb", label: "Prise USB" },
      { key: "usb_c", label: "Prise USB-C" },
      { key: "prise_12v", label: "Prise 12V / allume-cigare" },
      { key: "systeme_audio", label: "Système audio premium" },
    ],
  },

  // 6 — MOTORISATION & CONDUITE
  {
    id: "motorisation",
    label: "Motorisation & Conduite",
    icon: Zap,
    options: [
      { key: "boite_automatique", label: "Boîte automatique" },
      { key: "boite_manuelle", label: "Boîte manuelle" },
      { key: "palettes_volant", label: "Palettes au volant" },
      { key: "mode_sport", label: "Mode Sport / conduite adaptable" },
      { key: "suspension_adaptative", label: "Suspension adaptative" },
      { key: "transmission_integrale", label: "Transmission intégrale (4x4 / AWD)" },
      { key: "start_stop", label: "Système Start & Stop automatique" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Compte les options booléennes actives (hors taille_jantes et autres_options) */
export function countActiveOptions(options: VehicleOptions): number {
  return Object.entries(options).filter(
    ([key, val]) =>
      key !== "autres_options" &&
      key !== "taille_jantes" &&
      val === true
  ).length;
}

/** Retourne le label de niveau d'équipement */
export function getEquipmentLabel(options: VehicleOptions): string | null {
  const count = countActiveOptions(options);
  if (count > 25) return "Full options";
  if (count > 15) return "Très bien équipé";
  return null;
}
