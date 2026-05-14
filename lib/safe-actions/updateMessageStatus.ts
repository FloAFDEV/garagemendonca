"use server";

import { requireAdminForGarage } from "@/lib/auth/getSession";
import { messageDb } from "@/lib/db/message.repository";
import { messageUpdateSchema } from "@/lib/validation/message.schema";
import { parseSupabaseError } from "@/lib/errors/supabaseErrorParser";
import { revalidatePath } from "next/cache";
import type { MessageStatusInput } from "@/lib/validation/message.schema";

type Result = { data: true } | { error: { message: string; code?: string } };

export async function updateMessageStatusAction(
  messageId: string,
  garageId: string,
  status: MessageStatusInput,
): Promise<Result> {
  const authError = await requireAdminForGarage(garageId);
  if (authError) return { error: authError };

  try {
    if (status === "answered") {
      await messageDb.markAnswered(messageId);
    } else if (status === "in_progress") {
      await messageDb.markRead(messageId);
    } else {
      await messageDb.update(messageId, { status, is_read: status !== "new" });
    }
    revalidatePath("/admin/messages");
    return { data: true };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}

export async function updateMessageNotesAction(
  messageId: string,
  garageId: string,
  admin_notes: string | null,
): Promise<Result> {
  const authError = await requireAdminForGarage(garageId);
  if (authError) return { error: authError };

  const parsed = messageUpdateSchema.safeParse({ admin_notes });
  if (!parsed.success) return { error: { message: "Données invalides" } };

  try {
    await messageDb.update(messageId, { admin_notes });
    return { data: true };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}

export async function deleteMessageAction(
  messageId: string,
  garageId: string,
): Promise<Result> {
  const authError = await requireAdminForGarage(garageId);
  if (authError) return { error: authError };

  try {
    await messageDb.delete(messageId);
    revalidatePath("/admin/messages");
    return { data: true };
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }
}
