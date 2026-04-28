/**
 * Types Supabase générés manuellement — miroir strict du schema.sql v4.
 *
 * Usage :
 *   import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "@/lib/supabase/database.types";
 *
 * Tables<"vehicles">          → Row type (lecture)
 * TablesInsert<"vehicles">    → Insert type (création)
 * TablesUpdate<"vehicles">    → Update type (mise à jour partielle)
 * Enums<"vehicle_status">     → Union de l'enum
 */

// ─────────────────────────────────────────────────────────────────
//  ENUMS (miroirs des CREATE TYPE Supabase)
// ─────────────────────────────────────────────────────────────────

export type VehicleStatusEnum   = "draft" | "published" | "scheduled" | "sold";
export type UserRoleEnum        = "superadmin" | "admin" | "staff";
export type GaragePlanEnum      = "isolated" | "shared";
export type FuelTypeEnum        = "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL" | "Hydrogène";
export type TransmissionTypeEnum = "Manuelle" | "Automatique";
export type MessageStatusEnum   = "new" | "read" | "archived";
export type DisplayPagesEnum    = "all" | "home_only";

// ─────────────────────────────────────────────────────────────────
//  JSONB shapes typées (colonnes jsonb dans Supabase)
// ─────────────────────────────────────────────────────────────────

export interface DbVehicleFeatures {
  finition?: string;
  motorisation?: string;
  provenance?: string;
  nbProprietaires?: string;
  carnetEntretien?: string;
  controleTechnique?: string;
  garantie?: string;
  options?: string[];
  [key: string]: string | string[] | undefined;
}

export interface DbVehicleOptions {
  // Extérieur
  jantes_alliage?: boolean;        taille_jantes?: number;
  jantes_tole?: boolean;           toit_ouvrant?: boolean;
  toit_panoramique?: boolean;      barres_toit?: boolean;
  vitres_teintees?: boolean;       vitres_surteintees?: boolean;
  retroviseurs_electriques?: boolean; retroviseurs_rabattables?: boolean;
  retroviseurs_degivrants?: boolean;  feux_led?: boolean;
  feux_xenon?: boolean;            feux_matrix_led?: boolean;
  feux_automatiques?: boolean;     essuie_glaces_automatiques?: boolean;
  attelage?: boolean;              hayon_electrique?: boolean;
  portes_coulissantes?: boolean;   fermeture_soft_close?: boolean;
  // Intérieur & confort
  climatisation?: boolean;         climatisation_automatique?: boolean;
  climatisation_bizone?: boolean;  climatisation_trizone?: boolean;
  sieges_chauffants?: boolean;     sieges_ventiles?: boolean;
  sieges_massants?: boolean;       sieges_electriques?: boolean;
  sieges_memoire?: boolean;        sellerie_cuir?: boolean;
  sellerie_alcantara?: boolean;    sellerie_tissu?: boolean;
  volant_cuir?: boolean;           volant_chauffant?: boolean;
  volant_reglable?: boolean;       accoudoir_central?: boolean;
  vitres_electriques_avant?: boolean; vitres_electriques_arriere?: boolean;
  fermeture_centralisee?: boolean; demarrage_sans_cle?: boolean;
  coffre_electrique?: boolean;     ouverture_sans_cle?: boolean;
  commande_au_volant?: boolean;    sieges_rabattables?: boolean;
  // Multimédia & technologie
  ecran_tactile?: boolean;         gps?: boolean;
  bluetooth?: boolean;             usb?: boolean;
  usb_c?: boolean;                 chargeur_induction?: boolean;
  systeme_audio?: boolean;         commande_vocale?: boolean;
  tableau_bord_numerique?: boolean; affichage_tete_haute?: boolean;
  prise_12v?: boolean;
  // Sécurité
  abs?: boolean;                   esp?: boolean;
  airbags?: boolean;               airbags_lateraux?: boolean;
  airbags_rideaux?: boolean;       aide_freinage_urgence?: boolean;
  detection_pression_pneus?: boolean; isofix?: boolean;
  alarme?: boolean;                antidemarrage?: boolean;
  // Aides à la conduite
  regulateur_vitesse?: boolean;    regulateur_adaptatif?: boolean;
  limiteur_vitesse?: boolean;      aide_maintien_voie?: boolean;
  alerte_franchissement_ligne?: boolean; detection_angle_mort?: boolean;
  freinage_automatique?: boolean;  detection_pietons?: boolean;
  reconnaissance_panneaux?: boolean; radar_avant?: boolean;
  radar_arriere?: boolean;         camera_recul?: boolean;
  camera_360?: boolean;            stationnement_automatique?: boolean;
  // Motorisation & conduite
  boite_automatique?: boolean;     boite_manuelle?: boolean;
  palettes_volant?: boolean;       mode_sport?: boolean;
  suspension_adaptative?: boolean; transmission_integrale?: boolean;
  start_stop?: boolean;
  // Options personnalisées
  autres_options?: string;
}

export interface DbGarageHours {
  open: string;   // "08:00"
  close: string;  // "19:00"
}
export type DbGarageOpeningHours = Partial<Record<
  "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche",
  DbGarageHours | null
>>;

// ─────────────────────────────────────────────────────────────────
//  ROW TYPES (lecture depuis Supabase — résultat de SELECT *)
// ─────────────────────────────────────────────────────────────────

export interface GarageRow {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  plan: GaragePlanEnum;
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  opening_hours: DbGarageOpeningHours | null;
  created_at: string;
  updated_at: string;
}

export interface GarageUserRow {
  id: string;
  garage_id: string;
  user_id: string;
  role: UserRoleEnum;
  created_at: string;
}

export interface VehicleCategoryRow {
  id: string;
  garage_id: string;
  slug: string;
  label: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleRow {
  id: string;
  garage_id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: FuelTypeEnum;
  transmission: TransmissionTypeEnum;
  power: number | null;
  price: number;
  color: string;
  doors: number | null;
  crit_air: string | null;
  description: string | null;
  images: string[];
  thumbnail_url: string | null;
  status: VehicleStatusEnum;
  published_at: string | null;
  sold_at: string | null;
  featured: boolean;
  featured_order: number | null;
  categories: string[];
  features: DbVehicleFeatures;
  options: DbVehicleOptions;
  slug: string | null;
  meta_description: string | null;
  export_leboncoin: boolean;
  external_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleImageRow {
  id: string;
  vehicle_id: string;
  garage_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string | null;
}

export interface ServiceRow {
  id: string;
  garage_id: string;
  slug: string;
  sort_order: number | null;
  title: string;
  icon: string;
  short_description: string;
  long_description: string;
  features: string[];
  steps: unknown;
  pricing: unknown;
  faq: unknown;
  testimonials: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceImageRow {
  id: string;
  service_id: string;
  garage_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface BannerRow {
  id: string;
  garage_id: string | null;
  is_active: boolean;
  message: string;
  sub_message: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  bg_color: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  display_pages: DisplayPagesEnum;
  is_dismissible: boolean;
  updated_at: string | null;
}

export interface MessageRow {
  id: string;
  garage_id: string | null;
  vehicle_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read_at: string | null;
  status: MessageStatusEnum;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────
//  INSERT TYPES (création — champs required uniquement)
// ─────────────────────────────────────────────────────────────────

export type GarageInsert = Omit<GarageRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type VehicleInsert = Omit<VehicleRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  power?: number | null;
  doors?: number | null;
  crit_air?: string | null;
  description?: string | null;
  images?: string[];
  thumbnail_url?: string | null;
  status?: VehicleStatusEnum;
  published_at?: string | null;
  sold_at?: string | null;
  featured?: boolean;
  featured_order?: number | null;
  categories?: string[];
  features?: DbVehicleFeatures;
  options?: DbVehicleOptions;
  slug?: string | null;
  meta_description?: string | null;
  export_leboncoin?: boolean;
  external_id?: string | null;
};

export type VehicleImageInsert = Omit<VehicleImageRow, "id" | "created_at"> & {
  id?: string;
  alt?: string | null;
  sort_order?: number;
  is_primary?: boolean;
};

export type MessageInsert = Omit<MessageRow, "id" | "created_at" | "read_at" | "status"> & {
  id?: string;
  phone?: string | null;
  subject?: string | null;
  garage_id?: string | null;
  vehicle_id?: string | null;
  status?: MessageStatusEnum;
};

// ─────────────────────────────────────────────────────────────────
//  UPDATE TYPES (mise à jour partielle)
// ─────────────────────────────────────────────────────────────────

export type GarageUpdate         = Partial<Omit<GarageRow, "id" | "created_at">>;
export type VehicleUpdate        = Partial<Omit<VehicleRow, "id" | "garage_id" | "created_at">>;
export type VehicleImageUpdate   = Partial<Omit<VehicleImageRow, "id" | "vehicle_id" | "garage_id" | "created_at">>;
export type MessageUpdate        = Partial<Omit<MessageRow, "id" | "garage_id" | "vehicle_id" | "created_at">>;
export type VehicleCategoryUpdate = Partial<Omit<VehicleCategoryRow, "id" | "garage_id" | "created_at">>;

// ─────────────────────────────────────────────────────────────────
//  DATABASE interface (compatibilité @supabase/supabase-js generics)
//
//  @supabase/supabase-js v2.x exige que chaque table ait un champ
//  Relationships, et que le schéma public ait Views, Functions,
//  CompositeTypes — même vides.
// ─────────────────────────────────────────────────────────────────

// never[] is a mutable array — satisfies GenericRelationship[] via covariance (never extends anything)
type NoRel = { Relationships: never[] };

export interface Database {
  public: {
    Tables: {
      garages: {
        Row: GarageRow; Insert: GarageInsert; Update: GarageUpdate;
      } & NoRel;
      garage_users: {
        Row: GarageUserRow;
        Insert: Omit<GarageUserRow, "id" | "created_at">;
        Update: Partial<GarageUserRow>;
      } & NoRel;
      vehicle_categories: {
        Row: VehicleCategoryRow;
        Insert: Omit<VehicleCategoryRow, "id" | "created_at" | "updated_at">;
        Update: VehicleCategoryUpdate;
      } & NoRel;
      vehicles: {
        Row: VehicleRow; Insert: VehicleInsert; Update: VehicleUpdate;
      } & NoRel;
      vehicle_images: {
        Row: VehicleImageRow; Insert: VehicleImageInsert; Update: VehicleImageUpdate;
      } & NoRel;
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, "id" | "created_at" | "updated_at">;
        Update: Partial<ServiceRow>;
      } & NoRel;
      service_images: {
        Row: ServiceImageRow; Insert: Omit<ServiceImageRow, "id">; Update: Partial<ServiceImageRow>;
      } & NoRel;
      banners: {
        Row: BannerRow; Insert: Omit<BannerRow, "id" | "updated_at">; Update: Partial<BannerRow>;
      } & NoRel;
      messages: {
        Row: MessageRow; Insert: MessageInsert; Update: MessageUpdate;
      } & NoRel;
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    CompositeTypes: Record<string, never>;
    Enums: {
      vehicle_status:    VehicleStatusEnum;
      user_role:         UserRoleEnum;
      garage_plan:       GaragePlanEnum;
      fuel_type:         FuelTypeEnum;
      transmission_type: TransmissionTypeEnum;
    };
  };
}

// ─────────────────────────────────────────────────────────────────
//  Helpers utilitaires (usage dans les repos et mappers)
// ─────────────────────────────────────────────────────────────────

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
