import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { ContactReplyRow, ContactReplyInsert } from "@/lib/supabase/database.types";
import { replyFromDb } from "@/lib/mappers/message.mapper";
import type { ContactReply } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

function adminDb(): Q {
  return createSupabaseAdminClient();
}

export const replyDb = {
  async create(row: ContactReplyInsert): Promise<ContactReply> {
    const { data, error } = await adminDb()
      .from("contact_replies").insert(row).select().single();
    if (error) throw error;
    return replyFromDb(data as ContactReplyRow);
  },

  async listByMessage(messageId: string): Promise<ContactReply[]> {
    const { data, error } = await adminDb()
      .from("contact_replies").select("*")
      .eq("message_id", messageId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as ContactReplyRow[]).map(replyFromDb);
  },

  async delete(id: string): Promise<void> {
    const { error } = await adminDb().from("contact_replies").delete().eq("id", id);
    if (error) throw error;
  },
};
