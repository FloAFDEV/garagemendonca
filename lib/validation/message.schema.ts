import { z } from "zod";

// ─── Statuts message ───────────────────────────────────────────────
export const MESSAGE_STATUSES = ["new", "in_progress", "answered", "archived"] as const;
export type MessageStatusInput = typeof MESSAGE_STATUSES[number];

// ─── Création d'un message (formulaire contact public) ─────────────
// z.string().uuid() de Zod v4 exige les bits de version [1-8] et de variant [89abAB]
// (RFC-4122 strict). L'ID de garage 00000000-…-000000000001 (non-RFC-4122) est rejeté.
// On valide uniquement le format 8-4-4-4-12 hex, la contrainte FK Supabase fait le reste.
const uuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;

export const messageCreateSchema = z.object({
  garage_id:  z.string().regex(uuidLike, "garage_id invalide").optional(),
  vehicle_id: z.string().uuid().optional(),
  firstname:  z.string().min(2, "Prénom requis (2 caractères min)").max(100).trim(),
  lastname:   z.string().min(2, "Nom requis (2 caractères min)").max(100).trim(),
  email:      z.string().email("Email invalide").max(254).toLowerCase().trim(),
  phone:      z.string().max(20).optional(),
  subject:    z.string().max(200).optional(),
  message:    z.string().min(10, "Message trop court (10 caractères min)").max(3000),
  // honeypot — doit être vide
  website:    z.string().max(0, "Spam détecté").optional(),
  // Time-trap HMAC — token signé généré côté serveur lors du chargement de la page.
  // Vérifié dans createMessageAction pour détecter les soumissions trop rapides (< 3 s).
  form_token: z.string().optional(),
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
  message_id:  z.string().regex(uuidLike),
  garage_id:   z.string().regex(uuidLike).optional(),
  sender_type: z.enum(["admin", "client"]),
  content:     z.string().min(5, "Réponse trop courte").max(5000),
});

// ─── Types inférés ────────────────────────────────────────────────
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>;
export type ReplyCreateInput   = z.infer<typeof replyCreateSchema>;
