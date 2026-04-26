import { z } from "zod";

const garageHoursSchema = z.object({
  open:  z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
});

const garageDay = z.enum(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]);

const openingHoursSchema = z
  .record(garageDay, garageHoursSchema.nullable())
  .optional();

// ─── Création d'un garage ─────────────────────────────────────────

export const garageCreateSchema = z.object({
  name:           z.string().min(2, "Nom requis").max(120),
  slug:           z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  address:        z.string().max(200).optional(),
  city:           z.string().max(100).optional(),
  postal_code:    z.string().max(10).optional(),
  phone:          z.string().max(30).optional(),
  email:          z.string().email("Email invalide").max(254).optional(),
  logo_url:       z.string().url().optional(),
  description:    z.string().max(1000).optional(),
  is_active:      z.boolean().optional().default(true),
  plan:           z.enum(["isolated", "shared"]).default("isolated"),
  lat:            z.number().min(-90).max(90).optional(),
  lng:            z.number().min(-180).max(180).optional(),
  google_maps_url: z.string().url().optional(),
  opening_hours:  openingHoursSchema,
});

// ─── Mise à jour d'un garage ──────────────────────────────────────

export const garageUpdateSchema = garageCreateSchema.partial();

// ─── Types inférés ────────────────────────────────────────────────

export type GarageCreateInput = z.infer<typeof garageCreateSchema>;
export type GarageUpdateInput = z.infer<typeof garageUpdateSchema>;
