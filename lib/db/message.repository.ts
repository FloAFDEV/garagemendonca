import { createBrowserClient } from "@supabase/ssr";
import type { MessageRow, MessageInsert, MessageUpdate, MessageStatusEnum } from "@/lib/supabase/database.types";
import { messageFromDb } from "@/lib/mappers/message.mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Message } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

function anonDb(): Q {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function adminDb(): Q {
  return createSupabaseAdminClient();
}

export const messageDb = {
  // Insertion publique — RLS anti-spam (email regex + length > 10)
  async create(row: MessageInsert): Promise<Message> {
    const { data, error } = await anonDb()
      .from("messages").insert(row).select().single();
    if (error) throw error;
    return messageFromDb(data as MessageRow);
  },

  async list(garageId: string, options?: { status?: MessageStatusEnum; limit?: number }): Promise<Message[]> {
    let q = adminDb()
      .from("messages").select("*").eq("garage_id", garageId)
      .order("created_at", { ascending: false });
    if (options?.status) q = q.eq("status", options.status);
    if (options?.limit)  q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
    return ((data ?? []) as MessageRow[]).map(messageFromDb);
  },

  async getById(id: string): Promise<Message | null> {
    const { data, error } = await adminDb()
      .from("messages").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? messageFromDb(data as MessageRow) : null;
  },

  async countUnread(garageId: string): Promise<number> {
    const { count, error } = await adminDb()
      .from("messages").select("id", { count: "exact", head: true })
      .eq("garage_id", garageId).eq("status", "new");
    if (error) throw error;
    return count ?? 0;
  },

  async update(id: string, row: MessageUpdate): Promise<Message> {
    const { data, error } = await adminDb()
      .from("messages").update(row).eq("id", id).select().single();
    if (error) throw error;
    return messageFromDb(data as MessageRow);
  },

  async markRead(id: string): Promise<Message> {
    return messageDb.update(id, { status: "read", read_at: new Date().toISOString() });
  },

  async archive(id: string): Promise<Message> {
    return messageDb.update(id, { status: "archived" });
  },

  async delete(id: string): Promise<void> {
    const { error } = await adminDb().from("messages").delete().eq("id", id);
    if (error) throw error;
  },
};
