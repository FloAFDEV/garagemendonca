import type { MessageRow, MessageInsert, MessageUpdate, MessageStatusEnum } from "@/lib/supabase/database.types";
import { messageFromDb } from "@/lib/mappers/message.mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getReadClient } from "@/lib/supabase/readClient";
import type { Message } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

const anonDb = (): Q => getReadClient();

function adminDb(): Q {
  return createSupabaseAdminClient();
}

export interface MessageListOptions {
  status?:     MessageStatusEnum | "all";
  is_read?:    boolean;
  search?:     string;
  vehicle_id?: string;        // filtre par véhicule spécifique
  has_vehicle?: boolean;      // true = uniquement les messages avec vehicle_id
  limit?:      number;
  offset?:     number;
}

export const messageDb = {
  async create(row: MessageInsert): Promise<Message> {
    // [TRACE] LOG TEMPORAIRE — supprimer après debug
    console.log("[GARAGE_ID][STEP_7_supabase_insert] garage_id =", JSON.stringify(row.garage_id), "| row keys:", Object.keys(row));

    // Utilise adminDb() (service_role) pour contourner le problème RLS SELECT :
    // anonDb() n'a pas de SELECT policy sur messages → INSERT.select().single()
    // retourne 0 lignes (PGRST116) même si l'INSERT réussit.
    // La validation sécurité (Zod, honeypot, rate-limit) est faite en amont
    // dans createMessageAction — la RLS INSERT policy est donc redondante ici.
    const { data, error } = await adminDb()
      .from("messages").insert(row).select().single();
    if (error) throw error;
    return messageFromDb(data as MessageRow);
  },

  async list(garageId: string, options?: MessageListOptions): Promise<Message[]> {
    // JOIN vehicles pour récupérer brand/model/year dans un seul appel
    let q = adminDb()
      .from("messages")
      .select("*, vehicles(brand, model, year)")
      .eq("garage_id", garageId)
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      q = q.eq("status", options.status);
    }
    if (options?.is_read !== undefined) {
      q = q.eq("is_read", options.is_read);
    }
    if (options?.vehicle_id) {
      q = q.eq("vehicle_id", options.vehicle_id);
    }
    if (options?.has_vehicle) {
      q = q.not("vehicle_id", "is", null);
    }
    if (options?.search) {
      const s = `%${options.search}%`;
      q = q.or(`firstname.ilike.${s},lastname.ilike.${s},email.ilike.${s},subject.ilike.${s},message.ilike.${s}`);
    }
    if (options?.limit)  q = q.limit(options.limit);
    if (options?.offset) q = q.range(options.offset, options.offset + (options.limit ?? 50) - 1);

    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map(messageFromDb);
  },

  async getById(id: string): Promise<Message | null> {
    const { data, error } = await adminDb()
      .from("messages")
      .select("*, vehicles(brand, model, year)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data ? messageFromDb(data as any) : null;
  },

  async countUnread(garageId: string): Promise<number> {
    const { count, error } = await adminDb()
      .from("messages").select("id", { count: "exact", head: true })
      .eq("garage_id", garageId).eq("is_read", false);
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
    return messageDb.update(id, {
      is_read: true,
      read_at: new Date().toISOString(),
      status:  "in_progress",
    });
  },

  async archive(id: string): Promise<Message> {
    return messageDb.update(id, { status: "archived" });
  },

  async markAnswered(id: string): Promise<Message> {
    return messageDb.update(id, {
      status:      "answered",
      is_read:     true,
      answered_at: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    const { error } = await adminDb().from("messages").delete().eq("id", id);
    if (error) throw error;
  },
};
