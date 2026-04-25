// ─────────────────────────────────────────────
//  Options véhicule — stockées en JSONB Supabase (champ `options`)
//  Toutes les clés sont optionnelles pour permettre une migration progressive.
// ─────────────────────────────────────────────
export interface VehicleOptions {
  // ── EXTÉRIEUR ──────────────────────────────
  jantes_alliage?: boolean;
  taille_jantes?: number;           // pouces — présent uniquement si jantes_alliage = true
  jantes_tole?: boolean;
  toit_ouvrant?: boolean;
  toit_panoramique?: boolean;
  barres_toit?: boolean;
  vitres_teintees?: boolean;
  vitres_surteintees?: boolean;
  retroviseurs_electriques?: boolean;
  retroviseurs_rabattables?: boolean;
  retroviseurs_degivrants?: boolean;
  feux_led?: boolean;
  feux_xenon?: boolean;
  feux_matrix_led?: boolean;
  feux_automatiques?: boolean;
  essuie_glaces_automatiques?: boolean;
  attelage?: boolean;
  hayon_electrique?: boolean;
  portes_coulissantes?: boolean;
  fermeture_soft_close?: boolean;

  // ── INTÉRIEUR & CONFORT ─────────────────────
  climatisation?: boolean;
  climatisation_automatique?: boolean;
  climatisation_bizone?: boolean;
  climatisation_trizone?: boolean;
  sieges_chauffants?: boolean;
  sieges_ventiles?: boolean;
  sieges_massants?: boolean;
  sieges_electriques?: boolean;
  sieges_memoire?: boolean;
  sellerie_cuir?: boolean;
  sellerie_alcantara?: boolean;
  sellerie_tissu?: boolean;
  volant_cuir?: boolean;
  volant_chauffant?: boolean;
  volant_reglable?: boolean;
  accoudoir_central?: boolean;
  vitres_electriques_avant?: boolean;
  vitres_electriques_arriere?: boolean;
  fermeture_centralisee?: boolean;
  demarrage_sans_cle?: boolean;
  coffre_electrique?: boolean;
  ouverture_sans_cle?: boolean;
  commande_au_volant?: boolean;
  sieges_rabattables?: boolean;

  // ── MULTIMÉDIA & TECHNOLOGIE ────────────────
  ecran_tactile?: boolean;
  gps?: boolean;
  bluetooth?: boolean;
  usb?: boolean;
  usb_c?: boolean;
  chargeur_induction?: boolean;
  systeme_audio?: boolean;
  commande_vocale?: boolean;
  tableau_bord_numerique?: boolean;
  affichage_tete_haute?: boolean;
  prise_12v?: boolean;

  // ── SÉCURITÉ ───────────────────────────────
  abs?: boolean;
  esp?: boolean;
  airbags?: boolean;
  airbags_lateraux?: boolean;
  airbags_rideaux?: boolean;
  aide_freinage_urgence?: boolean;
  detection_pression_pneus?: boolean;
  isofix?: boolean;
  alarme?: boolean;
  antidemarrage?: boolean;

  // ── AIDES À LA CONDUITE ────────────────────
  regulateur_vitesse?: boolean;
  regulateur_adaptatif?: boolean;
  limiteur_vitesse?: boolean;
  aide_maintien_voie?: boolean;
  alerte_franchissement_ligne?: boolean;
  detection_angle_mort?: boolean;
  freinage_automatique?: boolean;
  detection_pietons?: boolean;
  reconnaissance_panneaux?: boolean;
  radar_avant?: boolean;
  radar_arriere?: boolean;
  camera_recul?: boolean;
  camera_360?: boolean;
  stationnement_automatique?: boolean;

  // ── MOTORISATION & CONDUITE ────────────────
  boite_automatique?: boolean;
  boite_manuelle?: boolean;
  palettes_volant?: boolean;
  mode_sport?: boolean;
  suspension_adaptative?: boolean;
  transmission_integrale?: boolean;
  start_stop?: boolean;

  // ── OPTIONS PERSONNALISÉES ─────────────────
  autres_options?: string;
}

// ─────────────────────────────────────────────
//  Statut métier d'un véhicule
//  Mirrors: CREATE TYPE vehicle_status AS ENUM (...)
// ─────────────────────────────────────────────
// draft      → brouillon, non visible côté public
// published  → visible
// scheduled  → visible uniquement à partir de published_at
// sold       → reste visible avec badge "Vendu"
export type VehicleStatus = "draft" | "published" | "scheduled" | "sold";

// ─────────────────────────────────────────────
//  Rôles utilisateur (multi-garage)
//  Mirrors: CREATE TYPE user_role AS ENUM (...)
// ─────────────────────────────────────────────
export type UserRole = "superadmin" | "admin" | "staff";

// ─────────────────────────────────────────────
//  Plan d'un garage
//  isolated = voit uniquement ses véhicules
//  shared   = voit tous les véhicules (catalogue commun)
// ─────────────────────────────────────────────
export type GaragePlan = "isolated" | "shared";

// ─────────────────────────────────────────────
//  Horaires d'ouverture d'un garage
//  Mirrors: garages.opening_hours JSONB
//
//  Format JSONB :
//  {
//    "lundi":    {"open": "08:00", "close": "19:00"},
//    "vendredi": {"open": "08:00", "close": "18:00"},
//    "samedi":   null,
//    "dimanche": null
//  }
// ─────────────────────────────────────────────
export interface GarageHours {
  open: string;   // "08:00"
  close: string;  // "19:00"
}

export type GarageDay =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"
  | "samedi"
  | "dimanche";

export type GarageOpeningHours = Partial<Record<GarageDay, GarageHours | null>>;

// ─────────────────────────────────────────────
//  Garage
//  Mirrors: table "garages"
// ─────────────────────────────────────────────
export interface Garage {
  id: string;          // uuid
  name: string;        // "Garage Auto Mendonça"
  slug: string;        // "garage-mendonca" (URL-safe)
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;   // Supabase Storage URL
  description?: string;
  is_active?: boolean;
  plan: GaragePlan;
  // ── SEO local ──────────────────────────────
  city?: string;
  postal_code?: string;
  lat?: number;        // ex: 43.604652
  lng?: number;        // ex: 1.444209
  google_maps_url?: string;
  opening_hours?: GarageOpeningHours;
  // ── Timestamps ─────────────────────────────
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

// ─────────────────────────────────────────────
//  Utilisateur lié à un garage
//  Mirrors: table "garage_users"
// ─────────────────────────────────────────────
export interface GarageUser {
  id: string;        // uuid
  garageId: string;  // FK → garages.id
  email: string;
  role: UserRole;
  createdAt: string; // ISO 8601
}

// ─────────────────────────────────────────────
//  Catégorie de véhicule — administrable depuis le dashboard
//  Mirrors: table "vehicle_categories"
//
//  Exemples de slugs : voitures, utilitaires, deux-roues, bateaux, engins-agricoles
//  Aucune valeur n'est hardcodée dans le code — tout provient de la base.
// ─────────────────────────────────────────────
export interface VehicleCategory {
  id: string;           // uuid
  garage_id: string;    // FK → garages.id
  slug: string;         // "voitures" — utilisé dans Vehicle.categories[]
  label: string;        // "Voitures" — affiché dans les filtres et formulaires
  icon?: string;        // emoji ou nom icône Lucide : "car", "truck", "🚗"
  color?: string;       // hex facultatif : "#3b82f6"
  description?: string; // usage interne admin uniquement
  sort_order: number;
  is_active: boolean;
  created_at: string;   // ISO 8601
  updated_at: string;   // ISO 8601
}

// ─────────────────────────────────────────────
//  Image d'un véhicule
//  Mirrors: table "vehicle_images"
//
//  Remplace progressivement le tableau vehicles.images[]
// ─────────────────────────────────────────────
export interface VehicleImage {
  id: string;           // uuid
  vehicle_id: string;   // FK → vehicles.id
  garage_id: string;    // FK → garages.id
  url: string;          // URL Supabase Storage
  alt?: string;         // texte alternatif SEO
  sort_order: number;   // 0 = première photo
  is_primary: boolean;  // true = thumbnail principal
  created_at?: string;  // ISO 8601
}

// ─────────────────────────────────────────────
//  Caractéristiques techniques typées
//  Mirrors: vehicles.features JSONB
// ─────────────────────────────────────────────
export interface VehicleFeatures {
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

// ─────────────────────────────────────────────
//  Véhicule
//  Mirrors: table "vehicles"
// ─────────────────────────────────────────────
export interface Vehicle {
  id: string;          // uuid (ou slug court pour les données mock)
  garageId?: string;   // FK → garages.id (requis en multi-garage)
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL" | "Hydrogène";
  price: number;
  description: string;
  images: string[];
  thumbnailUrl?: string;  // image principale mise en cache (Supabase Storage)
  transmission: "Manuelle" | "Automatique";
  power: number;
  color: string;
  doors: number;
  critAir?: string;
  // Statut métier
  status?: VehicleStatus;
  published_at?: string;  // ISO 8601 — utilisé quand status === "scheduled"
  sold_at?: string;       // ISO 8601 — renseignée quand status === "sold"
  // Mise en avant
  featured?: boolean;
  featuredOrder?: number; // position parmi les "à la une" (1 = premier)
  // Classification dynamique — slugs des VehicleCategory de ce garage
  categories?: string[];  // Mirrors: vehicles.categories TEXT[]
  // ── SEO ──────────────────────────────────────────────────────
  slug?: string;           // URL-safe unique par garage, ex: "peugeot-208-2021"
  meta_description?: string;
  // ── Export portails ──────────────────────────────────────────
  export_leboncoin?: boolean;
  external_id?: string;   // identifiant sur le portail externe
  // ── Timestamps ───────────────────────────────────────────────
  createdAt?: string;     // ISO 8601
  updatedAt?: string;     // ISO 8601
  // Caractéristiques structurées (ancien système — maintenu pour compatibilité)
  features?: VehicleFeatures;
  // Options équipement (nouveau système structuré — JSONB Supabase)
  options?: VehicleOptions;
}

// ─────────────────────────────────────────────
//  Payload de création / mise à jour d'un véhicule
// ─────────────────────────────────────────────
export type VehicleCreateInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
export type VehicleUpdateInput = Partial<VehicleCreateInput>;

// ─────────────────────────────────────────────
//  Message de contact / lead
//  Mirrors: table "messages"
// ─────────────────────────────────────────────
export interface Message {
  id: string;           // uuid
  garage_id?: string;   // FK → garages.id (optionnel)
  vehicle_id?: string;  // FK → vehicles.id (lead depuis fiche VO)
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read_at?: string;     // ISO 8601 — null = non lu
  created_at: string;   // ISO 8601
}

// ─────────────────────────────────────────────
//  ServiceImage
//  snake_case intentionnel — mapping 1:1 avec table Supabase service_images
// ─────────────────────────────────────────────
export interface ServiceImage {
  id: string;
  service_id: string;
  garage_id: string;
  url: string;          // chemin local (/images/…) ou URL Supabase Storage
  alt?: string;
  order: number;
  is_primary: boolean;
}

// ─────────────────────────────────────────────
//  Étapes du processus d'un service
// ─────────────────────────────────────────────
export interface ServiceStep {
  order: number;
  title: string;
  description: string;
}

// ─────────────────────────────────────────────
//  Tarif indicatif d'un service
// ─────────────────────────────────────────────
export interface ServicePricing {
  label: string;
  price: string;  // ex: "à partir de 79 €" ou "Sur devis"
  note?: string;
}

// ─────────────────────────────────────────────
//  Question / réponse FAQ d'un service
// ─────────────────────────────────────────────
export interface ServiceFAQItem {
  question: string;
  answer: string;
}

// ─────────────────────────────────────────────
//  Témoignage client lié à un service
// ─────────────────────────────────────────────
export interface ServiceTestimonial {
  author: string;
  location: string;
  date: string;    // format libre, ex : "mars 2025"
  rating: number;  // 1 à 5
  content: string;
}

// ─────────────────────────────────────────────
//  Service
//  Mirrors: table "services"
// ─────────────────────────────────────────────
export interface Service {
  id: string;
  garage_id?: string;   // FK → garages.id (optionnel en mode mock)
  slug: string;
  order?: number;
  title: string;
  icon: string;
  short_description: string;
  long_description: string;
  features: string[];
  steps?: ServiceStep[];
  pricing?: ServicePricing[];
  faq?: ServiceFAQItem[];
  testimonials?: ServiceTestimonial[];
  images: ServiceImage[];
  is_active: boolean;
}

// ─────────────────────────────────────────────
//  Banner promotionnelle
//  Mirrors: table "banners"
// ─────────────────────────────────────────────
export interface Banner {
  id: string;
  garage_id?: string;       // FK → garages.id (optionnel en mode mock)
  is_active: boolean;
  message: string;
  sub_message?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  bg_color: string;         // hex : "#DC2626"
  scheduled_start?: string; // ISO 8601
  scheduled_end?: string;   // ISO 8601
  display_pages: "all" | "home_only";
  is_dismissible: boolean;
  updated_at?: string;      // ISO 8601
}

// ─────────────────────────────────────────────
//  Formulaire de contact
//  (input formulaire → crée un Message côté serveur)
// ─────────────────────────────────────────────
export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
