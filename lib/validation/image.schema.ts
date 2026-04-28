import { z } from "zod";

// ─── Ajout d'une image véhicule ───────────────────────────────────

export const vehicleImageCreateSchema = z.object({
  vehicle_id: z.string().uuid("vehicle_id requis"),
  garage_id:  z.string().uuid("garage_id requis"),
  url:        z.string().min(1, "URL requise").max(500),
  alt:        z.string().max(200).optional(),
  sort_order: z.number().int().min(0).optional().default(0),
  is_primary: z.boolean().optional().default(false),
});

// ─── Mise à jour d'une image ──────────────────────────────────────

export const vehicleImageUpdateSchema = z.object({
  url:        z.string().min(1).max(500).optional(),
  alt:        z.string().max(200).optional(),
  sort_order: z.number().int().min(0).optional(),
  is_primary: z.boolean().optional(),
});

// ─── Réordonnancement batch ───────────────────────────────────────

export const vehicleImageReorderSchema = z.array(
  z.object({
    id:         z.string().uuid(),
    sort_order: z.number().int().min(0),
  }),
).min(1).max(30);

// ─── Types inférés ────────────────────────────────────────────────

export type VehicleImageCreateInput = z.infer<typeof vehicleImageCreateSchema>;
export type VehicleImageUpdateInput = z.infer<typeof vehicleImageUpdateSchema>;
export type VehicleImageReorderInput = z.infer<typeof vehicleImageReorderSchema>;
