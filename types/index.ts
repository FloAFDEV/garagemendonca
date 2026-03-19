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
//  Garage
//  Mirrors: table "garages"
// ─────────────────────────────────────────────
export interface Garage {
  id: string;                  // uuid
  name: string;                // "Garage Auto Mendonça"
  slug: string;                // "garage-mendonca" (URL-safe)
  address?: string;            // "6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage"
  phone?: string;              // "05 32 00 20 38"
  email?: string;              // "contact@garagemendonca.com"
  plan: GaragePlan;            // gestion du stock
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
}

// ─────────────────────────────────────────────
//  Utilisateur lié à un garage
//  Mirrors: table "garage_users"
// ─────────────────────────────────────────────
export interface GarageUser {
  id: string;                  // uuid
  garageId: string;            // FK → garages.id
  email: string;
  role: UserRole;
  createdAt: string;           // ISO 8601
}

// ─────────────────────────────────────────────
//  Caractéristiques techniques typées
//  Mirrors: vehicles.features JSONB
//  Toutes les clés sont optionnelles.
//  Un index signature permet des clés libres supplémentaires.
// ─────────────────────────────────────────────
export interface VehicleFeatures {
  finition?:           string;  // ex: "Acenta", "GLX Pack"
  motorisation?:       string;  // ex: "1.4 88 ch", "1.2i 94 ch"
  provenance?:         string;  // ex: "Française", "Importée"
  nbProprietaires?:    string;  // ex: "1", "2"
  carnetEntretien?:    string;  // ex: "À jour", "Partiel"
  controleTechnique?:  string;  // ex: "À jour", "À faire"
  garantie?:           string;  // ex: "6 à 12 mois km illimités"
  options?:            string;  // ex: "Toit ouvrant, clim auto"
  // Clés libres pour des spécificités métier supplémentaires
  [key: string]: string | undefined;
}

// ─────────────────────────────────────────────
//  Véhicule
//  Mirrors: table "vehicles"
// ─────────────────────────────────────────────
export interface Vehicle {
  id: string;                  // uuid (ou slug court pour les données mock)
  garageId?: string;           // FK → garages.id (requis en multi-garage)
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL" | "Hydrogène";
  price: number;
  description: string;
  images: string[];
  thumbnailUrl?: string;       // image principale mise en cache (Supabase Storage)
  transmission: "Manuelle" | "Automatique";
  power: number;
  color: string;
  doors: number;
  critAir?: string;
  // Statut métier
  status?: VehicleStatus;
  // Publication programmée (ISO 8601) — utilisé quand status === "scheduled"
  published_at?: string;
  // Date de vente (ISO 8601) — renseignée quand status === "sold"
  sold_at?: string;
  // Mise en avant
  featured?: boolean;
  featuredOrder?: number;      // position parmi les "à la une" (1 = premier)
  // Timestamps — format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
  createdAt?: string;
  updatedAt?: string;
  // Caractéristiques structurées
  features?: VehicleFeatures;
}

// ─────────────────────────────────────────────
//  Payload de création / mise à jour d'un véhicule
//  (id, createdAt, updatedAt sont gérés par la base)
// ─────────────────────────────────────────────
export type VehicleCreateInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
export type VehicleUpdateInput = Partial<VehicleCreateInput>;

// ─────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
}

// ─────────────────────────────────────────────
//  Formulaire de contact
// ─────────────────────────────────────────────
export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
