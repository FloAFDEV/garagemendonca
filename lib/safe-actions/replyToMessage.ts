"use server";

import { requireAdminForGarage } from "@/lib/auth/getSession";
import { replyCreateSchema } from "@/lib/validation/message.schema";
import { replyToInsert } from "@/lib/mappers/message.mapper";
import { replyDb } from "@/lib/db/reply.repository";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError } from "@/lib/errors/supabaseErrorParser";
import { sendAdminReply } from "@/lib/email";
import type { ContactReply } from "@/types";

type ReplyResult = { data: ContactReply } | { error: { message: string; code?: string } };

export async function replyToMessageAction(
  rawInput: unknown,
  garageId: string,
): Promise<ReplyResult> {
  const authError = await requireAdminForGarage(garageId);
  if (authError) return { error: authError };

  const parsed = replyCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: { message: "Données invalides", code: "VALIDATION" } };
  }

  try {
    // 1. Récupérer le message original
    const original = await messageDb.getById(parsed.data.message_id);
    if (!original) return { error: { message: "Message introuvable", code: "NOT_FOUND" } };

    // 2. Sauvegarder la réponse
    const row   = replyToInsert({ ...parsed.data, garage_id: garageId });
    const reply = await replyDb.create(row);

    // 3. Mettre le statut du message à "answered"
    await messageDb.markAnswered(parsed.data.message_id);

    // 4. Envoyer l'email au client (fire-and-forget)
    const garageEmail = process.env.GARAGE_EMAIL ?? "contact@garagemendonca.com";
    void sendAdminReply({
      to:              original.email,
      clientFirstname: original.firstname,
      originalSubject: original.subject,
      replyContent:    parsed.data.content,
      garageEmail,
    }).catch(console.error);

    return { data: reply };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
