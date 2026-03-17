// ─────────────────────────────────────────────
//  Statut métier d'un véhicule
//  Mirrors: CREATE TYPE vehicle_status AS ENUM (...)
// ─────────────────────────────────────────────
export type VehicleStatus = "available" | "reserved" | "sold";

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
// ─────────────────────────────────────────────
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL" | "Hydrogène";
  price: number;
  description: string;
  images: string[];
  thumbnailUrl?: string;      // image principale mise en cache (Supabase Storage)
  transmission: "Manuelle" | "Automatique";
  power: number;
  color: string;
  doors: number;
  critAir?: string;
  // Statut métier (remplace isAvailable)
  status?: VehicleStatus;
  // Mise en avant
  featured?: boolean;
  featuredOrder?: number;     // position parmi les "à la une" (1 = premier)
  // Caractéristiques structurées
  features?: VehicleFeatures;
}

// ─────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
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
