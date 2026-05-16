"use server";

import { headers } from "next/headers";
import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { messageToInsert } from "@/lib/mappers/message.mapper";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimit";
import { sendContactConfirmation } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Message } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateMessageResult =
  | { data: Message; error?: never }
  | { error: AppError | ZodFormattedError<MessageCreateInput>; data?: never };

export async function createMessageAction(
  rawInput: unknown,
): Promise<CreateMessageResult> {
  // 1. Anti-spam honeypot
  const input = rawInput as Record<string, unknown>;
  if (typeof input?.website === "string" && input.website.length > 0) {
    return { data: { id: "spam" } as Message };
  }

  // 2. Rate limiting : 5 messages / heure par IP
  const hdrs = await headers();
  const ip   = getClientIp(hdrs);
  const rl   = checkRateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return { error: { message: "Trop de messages envoyés. Réessayez dans une heure.", code: "RATE_LIMITED" } };
  }

  // 3. Validation Zod
  const parsed = messageCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  // 4. Insert DB
  const row = messageToInsert(parsed.data);
  let message: Message;
  try {
    message = await messageDb.create(row);
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }

  // 5. Notification garage via Edge Function (fire-and-forget)
  //    L'Edge Function enrichit l'email avec les données véhicule depuis la DB
  //    et génère le lien direct /admin/messages?id={id}.
  void invokeNotifyFunction(message.id).catch((err) =>
    console.error("[createMessage] notify-vehicle-message failed:", err),
  );

  // 6. Confirmation au client (email simple, pas d'accès DB requis)
  void sendContactConfirmation({
    to:        parsed.data.email,
    firstname: parsed.data.firstname,
    subject:   parsed.data.subject,
  }).catch(console.error);

  return { data: message };
}

// ─── Edge Function invocation ─────────────────────────────────────────────────

async function invokeNotifyFunction(messageId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  // functions.invoke() utilise automatiquement la clé service_role pour l'auth.
  // L'Edge Function reçoit le message_id et se charge de fetcher les données
  // véhicule + garage depuis Supabase avant d'envoyer l'email Resend.
  const { error } = await supabase.functions.invoke("notify-vehicle-message", {
    body: { message_id: messageId },
  });

  if (error) {
    throw new Error(`Edge Function error: ${error.message}`);
  }
}
