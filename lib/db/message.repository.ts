import type { MessageRow, MessageInsert, MessageUpdate, MessageStatusEnum } from "@/lib/supabase/database.types";
import { messageFromDb } from "@/lib/mappers/message.mapper";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { getReadClient } from "@/lib/supabase/readClient";
import type { Message } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

/** Nombre maximal de messages ramenés par défaut. Protège contre les full-table scans
 *  lorsque l'appelant n'explicite pas de LIMIT. Augmenter si la pagination est activée. */
export const DEFAULT_MESSAGE_LIMIT = 100;

const anonDb = (): Q => getReadClient();

function adminDb(): Q {
  return createSupabaseAdminClient();
}

export interface MessageListOptions {
  status?:      MessageStatusEnum | "all";
  is_read?:     boolean;
  search?:      string;
  vehicle_id?: string;
  limit?:      number;
  offset?:      number;
  /** Cursor-based pagination : ISO created_at du dernier item de la page précédente.
   *  Récupère les messages antérieurs à ce curseur (created_at < cursor).
   *  Prend la priorité sur offset si les deux sont fournis. */
  cursor?:      string;
}

export const messageDb = {
  async create(row: MessageInsert): Promise<Message> {
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
      .select("*, vehicles(brand, model, year, slug)")
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
    if (options?.search) {
      const s = `%${options.search}%`;
      q = q.or(`firstname.ilike.${s},lastname.ilike.${s},email.ilike.${s},subject.ilike.${s},message.ilike.${s}`);
    }
    // Cursor-based pagination : filtre created_at < cursor (ordre DESC garanti).
    // Prend la priorité sur offset si les deux sont fournis.
    if (options?.cursor) {
      q = q.lt("created_at", options.cursor);
    } else if (options?.offset) {
      const effectiveOffset = options.offset;
      q = q.range(effectiveOffset, effectiveOffset + (options.limit ?? DEFAULT_MESSAGE_LIMIT) - 1);
    }
    // Toujours appliquer un LIMIT — ne jamais lire toute la table.
    const effectiveLimit = options?.limit ?? DEFAULT_MESSAGE_LIMIT;
    q = q.limit(effectiveLimit);

    const { data, error } = await q;
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map(messageFromDb);
  },

  async getById(id: string): Promise<Message | null> {
    const { data, error } = await adminDb()
      .from("messages")
      .select("*, vehicles(brand, model, year, slug)")
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

  async countStats(garageId: string): Promise<{ total: number; unread: number; read: number }> {
    const [totalResult, unreadResult] = await Promise.all([
      adminDb().from("messages").select("id", { count: "exact", head: true }).eq("garage_id", garageId),
      adminDb().from("messages").select("id", { count: "exact", head: true }).eq("garage_id", garageId).eq("is_read", false),
    ]);
    if (totalResult.error) throw totalResult.error;
    if (unreadResult.error) throw unreadResult.error;
    const total = totalResult.count ?? 0;
    const unread = unreadResult.count ?? 0;
    return { total, unread, read: total - unread };
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
