"use server";

import { requireAdminForGarage } from "@/lib/auth/getSession";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError } from "@/lib/errors/supabaseErrorParser";
import { revalidatePath } from "next/cache";

type MessageStatus = "new" | "read" | "archived";

type Result =
  | { data: true }
  | { error: { message: string; code?: string } };

export async function updateMessageStatusAction(
  messageId: string,
  garageId: string,
  status: MessageStatus,
): Promise<Result> {
  const authError = await requireAdminForGarage(garageId);
  if (authError) return { error: authError };

  try {
    if (status === "read") {
      await messageDb.markRead(messageId);
    } else {
      await messageDb.update(messageId, { status });
    }
    revalidatePath("/admin/messages");
    return { data: true };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
