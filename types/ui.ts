/**
 * Types UI — couche présentation, découplée des types DB.
 *
 * Règle : les composants n'importent JAMAIS depuis database.types.ts
 * ni directement depuis les repositories. Ils utilisent uniquement ces types.
 *
 * Les champs computés (formattedPrice, label…) sont calculés par les
 * presenters dans lib/ui/presenters.ts — jamais inline dans les composants.
 */

import type {
  VehicleStatus,
  GaragePlan,
  UserRole,
  GarageOpeningHours,
  VehicleOptions,
} from "./index";

// ─────────────────────────────────────────────────────────────────
//  UIVehicle — vue présentation (liste + fiche)
// ─────────────────────────────────────────────────────────────────

export interface UIVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL" | "Hydrogène";
  transmission: "Manuelle" | "Automatique";
  color: string | null;
  doors: number;
  power: number;
  description: string; // description_marketing ?? description (résolu dans toUIVehicle)
  slug?: string;
  thumbnailUrl?: string;
  images: string[];
  status: VehicleStatus;
  featured: boolean;
  categories: string[];
  options?: VehicleOptions;
  critAir?: string;
  meta_description?: string;
  createdAt?: string;
  // Champs computés (remplis par toUIVehicle())
  label: string;           // "Peugeot 208 GTi 2021"
  formattedPrice: string;  // "24 900 €"
  formattedMileage: string; // "45 000 km"
  isSold: boolean;
  isPublished: boolean;
  isDraft: boolean;
}

// ─────────────────────────────────────────────────────────────────
//  UIMessage — vue présentation (boîte de réception admin)
// ─────────────────────────────────────────────────────────────────

export interface UIMessage {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "in_progress" | "answered" | "archived";
  vehicleId?: string;
  vehicleName?: string; // "Toyota Yaris 2019" — présent si message lié à un véhicule
  is_read: boolean;
  isUnread: boolean;
  admin_notes?: string;
  answered_at?: string;
  formattedDate: string;
  created_at: string;
  updated_at: string;
  replies?: UIContactReply[];
}

export interface UIContactReply {
  id: string;
  message_id: string;
  sender_type: "admin" | "client";
  content: string;
  created_at: string;
  formattedDate: string;
}

// ─────────────────────────────────────────────────────────────────
//  UIGarage — vue présentation (publique + admin)
// ─────────────────────────────────────────────────────────────────

export interface UIGarage {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  plan: GaragePlan;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  openingHours?: GarageOpeningHours;
}

// ─────────────────────────────────────────────────────────────────
//  UIUser — utilisateur authentifié côté client
// ─────────────────────────────────────────────────────────────────

export interface UIUser {
  id: string;
  email: string;
  role: UserRole | null;
  garageId: string | null;
  isAdmin: boolean;
}

// ─────────────────────────────────────────────────────────────────
//  Filtres véhicule — utilisés dans useVehicles() et VehicleFilters
// ─────────────────────────────────────────────────────────────────

export interface UIVehicleFilters {
  status?: VehicleStatus;
  brand?: string;
  fuel?: UIVehicle["fuel"];
  transmission?: UIVehicle["transmission"];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

// ─────────────────────────────────────────────────────────────────
//  État générique UI — retourné par tous les hooks
// ─────────────────────────────────────────────────────────────────

export interface UIQueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isEmpty: boolean;
}

// ─────────────────────────────────────────────────────────────────
//  Résultat d'une mutation — normalisé pour les composants
// ─────────────────────────────────────────────────────────────────

export interface UIMutationResult {
  isPending: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────
//  Presenters — Vehicle → UIVehicle, Message → UIMessage
//  (ici pour ne pas créer un fichier supplémentaire)
// ─────────────────────────────────────────────────────────────────

import type { Vehicle, Message, Garage, ContactReply } from "./index";

const FR_NUMBER = new Intl.NumberFormat("fr-FR");
const FR_DATE   = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export function toUIVehicle(v: Vehicle): UIVehicle {
  return {
    id:               v.id,
    brand:            v.brand,
    model:            v.model,
    year:             v.year,
    price:            v.price,
    mileage:          v.mileage,
    fuel:             v.fuel,
    transmission:     v.transmission,
    color:            v.color,
    doors:            v.doors,
    power:            v.power,
    description:      v.description_marketing ?? v.description ?? "",
    slug:             v.slug,
    thumbnailUrl:     v.thumbnailUrl,
    images:           v.images,
    status:           v.status ?? "draft",
    featured:         v.featured ?? false,
    categories:       v.categories ?? [],
    options:          v.options,
    critAir:          v.critAir,
    meta_description: v.meta_description,
    createdAt:        v.createdAt,
    // Computed
    label:            `${v.brand} ${v.model} ${v.year}`,
    formattedPrice:   `${FR_NUMBER.format(v.price)} €`,
    formattedMileage: `${FR_NUMBER.format(v.mileage)} km`,
    isSold:           v.status === "sold",
    isPublished:      v.status === "published",
    isDraft:          v.status === "draft",
  };
}

export function toUIMessage(m: Message, replies?: ContactReply[]): UIMessage {
  return {
    id:           m.id,
    firstname:    m.firstname,
    lastname:     m.lastname,
    name:         m.name || `${m.firstname} ${m.lastname}`.trim(),
    email:        m.email,
    phone:        m.phone,
    subject:      m.subject,
    message:      m.message,
    status:       (m.status as string) === "read" ? "in_progress" : m.status,
    vehicleId:    m.vehicle_id,
    vehicleName:  m.vehicleName,
    is_read:      m.is_read,
    isUnread:     !m.is_read,
    admin_notes:  m.admin_notes,
    answered_at:  m.answered_at,
    formattedDate: FR_DATE.format(new Date(m.created_at)),
    created_at:   m.created_at,
    updated_at:   m.updated_at,
    replies:      replies?.map(toUIContactReply),
  };
}

export function toUIContactReply(r: ContactReply): UIContactReply {
  return {
    id:           r.id,
    message_id:   r.message_id,
    sender_type:  r.sender_type,
    content:      r.content,
    created_at:   r.created_at,
    formattedDate: FR_DATE.format(new Date(r.created_at)),
  };
}

export function toUIGarage(g: Garage): UIGarage {
  return {
    id:           g.id,
    name:         g.name,
    slug:         g.slug,
    address:      g.address,
    city:         g.city,
    postalCode:   g.postal_code,
    phone:        g.phone,
    email:        g.email,
    logoUrl:      g.logo_url,
    description:  g.description,
    isActive:     g.is_active ?? true,
    plan:         g.plan,
    lat:          g.lat,
    lng:          g.lng,
    googleMapsUrl: g.google_maps_url,
    openingHours: g.opening_hours,
  };
}
