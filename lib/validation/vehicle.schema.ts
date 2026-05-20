import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

// ─── Sous-schéma : options équipement ────────────────────────────

const vehicleOptionsSchema = z.object({
  // Extérieur
  jantes_alliage: z.boolean().optional(),
  taille_jantes:  z.number().int().min(14).max(24).optional(),
  jantes_tole:    z.boolean().optional(),
  toit_ouvrant:   z.boolean().optional(),
  toit_panoramique: z.boolean().optional(),
  barres_toit:    z.boolean().optional(),
  vitres_teintees: z.boolean().optional(),
  vitres_surteintees: z.boolean().optional(),
  retroviseurs_electriques: z.boolean().optional(),
  retroviseurs_rabattables: z.boolean().optional(),
  retroviseurs_degivrants: z.boolean().optional(),
  feux_led:       z.boolean().optional(),
  feux_xenon:     z.boolean().optional(),
  feux_matrix_led: z.boolean().optional(),
  feux_automatiques: z.boolean().optional(),
  essuie_glaces_automatiques: z.boolean().optional(),
  attelage:       z.boolean().optional(),
  hayon_electrique: z.boolean().optional(),
  portes_coulissantes: z.boolean().optional(),
  fermeture_soft_close: z.boolean().optional(),
  // Intérieur & confort
  climatisation:  z.boolean().optional(),
  climatisation_automatique: z.boolean().optional(),
  climatisation_bizone: z.boolean().optional(),
  climatisation_trizone: z.boolean().optional(),
  sieges_chauffants: z.boolean().optional(),
  sieges_ventiles: z.boolean().optional(),
  sieges_massants: z.boolean().optional(),
  sieges_electriques: z.boolean().optional(),
  sieges_memoire: z.boolean().optional(),
  sellerie_cuir:  z.boolean().optional(),
  sellerie_alcantara: z.boolean().optional(),
  sellerie_tissu: z.boolean().optional(),
  volant_cuir:    z.boolean().optional(),
  volant_chauffant: z.boolean().optional(),
  volant_reglable: z.boolean().optional(),
  accoudoir_central: z.boolean().optional(),
  vitres_electriques_avant: z.boolean().optional(),
  vitres_electriques_arriere: z.boolean().optional(),
  fermeture_centralisee: z.boolean().optional(),
  demarrage_sans_cle: z.boolean().optional(),
  coffre_electrique: z.boolean().optional(),
  ouverture_sans_cle: z.boolean().optional(),
  commande_au_volant: z.boolean().optional(),
  sieges_rabattables: z.boolean().optional(),
  // Multimédia
  ecran_tactile:  z.boolean().optional(),
  gps:            z.boolean().optional(),
  bluetooth:      z.boolean().optional(),
  usb:            z.boolean().optional(),
  usb_c:          z.boolean().optional(),
  chargeur_induction: z.boolean().optional(),
  systeme_audio:  z.boolean().optional(),
  commande_vocale: z.boolean().optional(),
  tableau_bord_numerique: z.boolean().optional(),
  affichage_tete_haute: z.boolean().optional(),
  prise_12v:      z.boolean().optional(),
  // Sécurité
  abs:            z.boolean().optional(),
  esp:            z.boolean().optional(),
  airbags:        z.boolean().optional(),
  airbags_lateraux: z.boolean().optional(),
  airbags_rideaux: z.boolean().optional(),
  aide_freinage_urgence: z.boolean().optional(),
  detection_pression_pneus: z.boolean().optional(),
  isofix:         z.boolean().optional(),
  alarme:         z.boolean().optional(),
  antidemarrage:  z.boolean().optional(),
  // Aides à la conduite
  regulateur_vitesse: z.boolean().optional(),
  regulateur_adaptatif: z.boolean().optional(),
  limiteur_vitesse: z.boolean().optional(),
  aide_maintien_voie: z.boolean().optional(),
  alerte_franchissement_ligne: z.boolean().optional(),
  detection_angle_mort: z.boolean().optional(),
  freinage_automatique: z.boolean().optional(),
  detection_pietons: z.boolean().optional(),
  reconnaissance_panneaux: z.boolean().optional(),
  radar_avant:    z.boolean().optional(),
  radar_arriere:  z.boolean().optional(),
  camera_recul:   z.boolean().optional(),
  camera_360:     z.boolean().optional(),
  stationnement_automatique: z.boolean().optional(),
  // Motorisation
  boite_automatique: z.boolean().optional(),
  boite_manuelle: z.boolean().optional(),
  palettes_volant: z.boolean().optional(),
  mode_sport:     z.boolean().optional(),
  suspension_adaptative: z.boolean().optional(),
  transmission_integrale: z.boolean().optional(),
  start_stop:     z.boolean().optional(),
  // Personnalisées
  autres_options: z.string().max(500).optional(),
}).optional();

// ─── Schéma principal création ────────────────────────────────────

export const vehicleCreateSchema = z.object({
  garage_id:    z.string().uuid("garage_id doit être un UUID valide"),
  brand:        z.string().min(1, "Marque requise").max(80),
  model:        z.string().min(1, "Modèle requis").max(120),
  year:         z.number().int().min(1900).max(CURRENT_YEAR + 1),
  mileage:      z.number().int().min(0, "Kilométrage invalide"),
  fuel:         z.enum(["Essence", "Diesel", "Hybride", "Électrique", "GPL", "Hydrogène"]),
  transmission: z.enum(["Manuelle", "Automatique"]),
  power:        z.number().int().min(0).max(2000).optional(),
  price:        z.number().min(0, "Prix invalide"),
  color:        z.string().min(1, "Couleur requise").max(80),
  doors:        z.number().int().min(2).max(7).optional(),
  crit_air:     z.string().max(10).optional(),
  description:  z.string().max(5000).optional(),
  images:       z.array(z.string().url()).max(30).optional(),
  thumbnail_url: z.string().url().optional(),
  status:       z.enum(["draft", "published", "scheduled", "sold"]).optional().default("draft"),
  published_at: z.string().datetime().optional(),
  sold_at:      z.string().datetime().optional(),
  featured:     z.boolean().optional().default(false),
  featured_order: z.number().int().min(1).optional(),
  categories:   z.array(z.string().min(1)).max(10).optional(),
  features:     z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  options:      vehicleOptionsSchema,
  slug:         z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "Slug invalide").optional(),
  meta_description: z.string().max(160).optional(),
  export_leboncoin: z.boolean().optional().default(false),
  external_id:  z.string().max(100).optional(),
});

// ─── Schéma mise à jour (tous champs optionnels sauf garage_id) ───

export const vehicleUpdateSchema = vehicleCreateSchema
  .omit({ garage_id: true })
  .partial();

// ─── Types inférés ────────────────────────────────────────────────

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
