import { z } from "zod";

// ─── Statuts message ───────────────────────────────────────────────
export const MESSAGE_STATUSES = ["new", "in_progress", "answered", "archived"] as const;
export type MessageStatusInput = typeof MESSAGE_STATUSES[number];

// ─── Création d'un message (formulaire contact public) ─────────────
export const messageCreateSchema = z.object({
  garage_id:  z.string().uuid("garage_id requis").optional(),
  vehicle_id: z.string().uuid().optional(),
  firstname:  z.string().min(2, "Prénom requis (2 caractères min)").max(100).trim(),
  lastname:   z.string().min(2, "Nom requis (2 caractères min)").max(100).trim(),
  email:      z.string().email("Email invalide").max(254).toLowerCase().trim(),
  phone:      z.string().max(20).optional(),
  subject:    z.string().max(200).optional(),
  message:    z.string().min(10, "Message trop court (10 caractères min)").max(3000),
  // honeypot — doit être vide
  website:    z.string().max(0, "Spam détecté").optional(),
});

// ─── Mise à jour statut + notes admin ──────────────────────────────
export const messageUpdateSchema = z.object({
  status:      z.enum(MESSAGE_STATUSES).optional(),
  is_read:     z.boolean().optional(),
  admin_notes: z.string().max(5000).nullable().optional(),
  answered_at: z.string().datetime().nullable().optional(),
});

// ─── Réponse admin → client ───────────────────────────────────────
export const replyCreateSchema = z.object({
  message_id:  z.string().uuid(),
  garage_id:   z.string().uuid().optional(),
  sender_type: z.enum(["admin", "client"]),
  content:     z.string().min(5, "Réponse trop courte").max(5000),
});

// ─── Types inférés ────────────────────────────────────────────────
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>;
export type ReplyCreateInput   = z.infer<typeof replyCreateSchema>;
