"use server";

import { messageDb } from "@/lib/db/message.repository";
import { toUIMessage } from "@/types/ui";
import type { UIMessage } from "@/types/ui";
import { requireMemberOfGarage } from "@/lib/auth/getSession";

export async function fetchMessagesAction(garageId: string): Promise<UIMessage[]> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) throw new Error(authError.message);

  const messages = await messageDb.list(garageId);
  return messages.map(toUIMessage);
}

export async function fetchUnreadCountAction(garageId: string): Promise<number> {
  const authError = await requireMemberOfGarage(garageId);
  if (authError) return 0;
  return messageDb.countUnread(garageId);
}
