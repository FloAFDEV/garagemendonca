"use server";

import { headers } from "next/headers";
import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { messageToInsert } from "@/lib/mappers/message.mapper";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimit";
import { sendContactConfirmation, sendNewLeadNotification } from "@/lib/email";
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

  // 5. Emails fire-and-forget
  const garageEmail = process.env.GARAGE_EMAIL ?? process.env.RESEND_FROM?.match(/<(.+)>/)?.[1];
  const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL ?? "https://garagemendonca.com";

  if (garageEmail) {
    void sendNewLeadNotification({
      garageEmail,
      firstname:   parsed.data.firstname,
      lastname:    parsed.data.lastname,
      email:       parsed.data.email,
      phone:       parsed.data.phone,
      subject:     parsed.data.subject,
      message:     parsed.data.message,
      adminUrl:    `${baseUrl}/admin/messages`,
    }).catch(console.error);
  }

  void sendContactConfirmation({
    to:        parsed.data.email,
    firstname: parsed.data.firstname,
    subject:   parsed.data.subject,
  }).catch(console.error);

  return { data: message };
}
