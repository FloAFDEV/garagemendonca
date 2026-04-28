"use server";

/**
 * Safe action — envoi d'un message de contact (formulaire public).
 *
 * Flux :
 *   1. Validation Zod (email format, longueur message)
 *   2. Mapping → DB row
 *   3. Insert via client anon (RLS anti-spam : email regex + length > 10)
 *   4. Normalisation erreur → AppError
 *
 * Pas d'auth requise : action publique.
 * La RLS Supabase ajoute une double protection côté DB.
 */

import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { messageToInsert } from "@/lib/mappers/message.mapper";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import type { Message } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateMessageResult =
  | { data: Message; error?: never }
  | { error: AppError | ZodFormattedError<MessageCreateInput>; data?: never };

export async function createMessageAction(
  rawInput: unknown,
): Promise<CreateMessageResult> {
  // 1. Validation Zod
  const parsed = messageCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  // 2. Mapping → DB row
  const row = messageToInsert(parsed.data);

  // 3. Insert (client anon — RLS active)
  try {
    const message = await messageDb.create(row);
    return { data: message };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
