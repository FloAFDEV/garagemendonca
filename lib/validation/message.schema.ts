import { z } from "zod";

// ─── Création d'un message (formulaire contact public) ─────────────

export const messageCreateSchema = z.object({
  garage_id:  z.string().uuid("garage_id requis").optional(),
  vehicle_id: z.string().uuid().optional(),
  name:       z.string().min(2, "Nom requis (2 caractères min)").max(100),
  email:      z.string().email("Email invalide").max(254),
  phone:      z.string().max(20).optional(),
  subject:    z.string().max(200).optional(),
  message:    z.string().min(10, "Message trop court (10 caractères min)").max(3000),
});

// ─── Mise à jour statut (admin uniquement) ─────────────────────────

export const messageUpdateSchema = z.object({
  status:  z.enum(["new", "read", "archived"]).optional(),
  read_at: z.string().datetime().nullable().optional(),
});

// ─── Types inférés ────────────────────────────────────────────────

export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>;
