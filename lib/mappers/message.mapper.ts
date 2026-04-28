import type { Message } from "@/types";
import type { MessageRow, MessageInsert, MessageUpdate } from "@/lib/supabase/database.types";
import type { MessageCreateInput, MessageUpdateInput } from "@/lib/validation/message.schema";

// ─────────────────────────────────────────────────────────────────
//  DB → Domaine
// ─────────────────────────────────────────────────────────────────

export function messageFromDb(row: MessageRow): Message {
  return {
    id:         row.id,
    garage_id:  row.garage_id ?? undefined,
    vehicle_id: row.vehicle_id ?? undefined,
    name:       row.name,
    email:      row.email,
    phone:      row.phone ?? undefined,
    subject:    row.subject ?? undefined,
    message:    row.message,
    read_at:    row.read_at ?? undefined,
    status:     row.status,
    created_at: row.created_at,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Domaine → Insert DB
// ─────────────────────────────────────────────────────────────────

export function messageToInsert(input: MessageCreateInput): MessageInsert {
  return {
    garage_id:  input.garage_id ?? null,
    vehicle_id: input.vehicle_id ?? null,
    name:       input.name,
    email:      input.email,
    phone:      input.phone ?? null,
    subject:    input.subject ?? null,
    message:    input.message,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Domaine → Update DB
// ─────────────────────────────────────────────────────────────────

export function messageToUpdate(input: MessageUpdateInput): MessageUpdate {
  const update: MessageUpdate = {};
  if (input.status  !== undefined) update.status  = input.status;
  if (input.read_at !== undefined) update.read_at = input.read_at;
  return update;
}
