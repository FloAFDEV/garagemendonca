"use server";

import { messageDb, type MessageListOptions, DEFAULT_MESSAGE_LIMIT } from "@/lib/db/message.repository";
import { replyDb } from "@/lib/db/reply.repository";
import { toUIMessage, toUIContactReply } from "@/types/ui";
import type { UIMessage, UIContactReply } from "@/types/ui";
import { requireMemberOfGarage } from "@/lib/auth/getSession";

/** Résultat paginé d'une page de messages. nextCursor = null si dernière page. */
export interface MessagePage {
  messages:   UIMessage[];
  nextCursor: string | null;
}

export async function fetchMessagesAction(
  garageId: string,
  options?: MessageListOptions,
): Promise<MessagePage> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) throw new Error(authError.message);

  const effectiveLimit = options?.limit ?? DEFAULT_MESSAGE_LIMIT;
  const rows = await messageDb.list(garageId, { ...options, limit: effectiveLimit });
  const messages = rows.map((m) => toUIMessage(m));

  // Si on a reçu exactement effectiveLimit items, il peut y en avoir d'autres.
  // Le curseur est le created_at du dernier item (order DESC → le plus ancien de la page).
  const nextCursor = messages.length === effectiveLimit
    ? (rows[rows.length - 1]?.created_at ?? null)
    : null;

  return { messages, nextCursor };
}

export async function fetchMessageWithRepliesAction(
  messageId: string,
  garageId: string,
): Promise<UIMessage | null> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) throw new Error(authError.message);

  // Les deux requêtes sont indépendantes — parallélisation pour éliminer le waterfall.
  const [message, replies] = await Promise.all([
    messageDb.getById(messageId),
    replyDb.listByMessage(messageId),
  ]);
  if (!message) return null;
  return toUIMessage(message, replies);
}

export async function fetchRepliesAction(
  messageId: string,
  garageId: string,
): Promise<UIContactReply[]> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) throw new Error(authError.message);

  const replies = await replyDb.listByMessage(messageId);
  return replies.map(toUIContactReply);
}

export async function fetchUnreadCountAction(garageId: string): Promise<number> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) return 0;
  return messageDb.countUnread(garageId);
}

export async function fetchMessageStatsAction(
  garageId: string,
): Promise<{ total: number; unread: number; read: number }> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) return { total: 0, unread: 0, read: 0 };
  return messageDb.countStats(garageId);
}
