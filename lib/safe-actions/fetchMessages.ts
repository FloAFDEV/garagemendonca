"use server";

import { messageDb, type MessageListOptions } from "@/lib/db/message.repository";
import { replyDb } from "@/lib/db/reply.repository";
import { toUIMessage, toUIContactReply } from "@/types/ui";
import type { UIMessage, UIContactReply } from "@/types/ui";
import { requireMemberOfGarage } from "@/lib/auth/getSession";

export async function fetchMessagesAction(
  garageId: string,
  options?: MessageListOptions,
): Promise<UIMessage[]> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) throw new Error(authError.message);

  const messages = await messageDb.list(garageId, options);
  return messages.map((m) => toUIMessage(m));
}

export async function fetchMessageWithRepliesAction(
  messageId: string,
  garageId: string,
): Promise<UIMessage | null> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) throw new Error(authError.message);

  const message = await messageDb.getById(messageId);
  if (!message) return null;

  const replies = await replyDb.listByMessage(messageId);
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
