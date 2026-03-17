export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique" | "GPL";
  price: number;
  description: string;
  images: string[];
  transmission: "Manuelle" | "Automatique";
  power: number;
  color: string;
  doors: number;
  featured?: boolean;
  // Extended — Supabase-ready
  critAir?: string;
  isAvailable?: boolean;
  features?: Record<string, string>;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
