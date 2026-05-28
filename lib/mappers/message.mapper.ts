import type { Message, ContactReply } from "@/types";
import type { MessageRow, MessageInsert, MessageUpdate, ContactReplyRow, ContactReplyInsert } from "@/lib/supabase/database.types";
import type { MessageCreateInput, MessageUpdateInput, ReplyCreateInput } from "@/lib/validation/message.schema";
import { generateVehicleSlug, buildVehicleUrl } from "@/lib/utils/slug";

// ─── DB → Domaine ─────────────────────────────────────────────────

// Données véhicule enrichies via JOIN dans messageDb.list() / getById()
interface VehicleJoin {
  brand: string;
  model: string;
  year:  number;
  slug?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function messageFromDb(row: (MessageRow & { vehicles?: VehicleJoin | null }) | Record<string, any>): Message {
  const firstname = row.firstname || row.name?.split(" ")[0] || "";
  const lastname  = row.lastname  || row.name?.split(" ").slice(1).join(" ") || "";

  const vehicle   = (row.vehicles ?? null) as VehicleJoin | null;
  const vehicleName = vehicle
    ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
    : undefined;

  const vehicleId = row.vehicle_id as string | undefined;
  const vehicleHref = vehicleId && vehicle
    ? buildVehicleUrl(
        vehicle.slug ?? generateVehicleSlug(vehicle.brand, vehicle.model, vehicle.year),
        vehicleId,
      )
    : undefined;

  return {
    id:           row.id,
    garage_id:    row.garage_id  ?? undefined,
    vehicle_id:   row.vehicle_id ?? undefined,
    vehicleName,
    vehicleHref,
    firstname,
    lastname,
    name:         row.name || `${firstname} ${lastname}`.trim(),
    email:        row.email,
    phone:        row.phone      ?? undefined,
    subject:      row.subject    ?? undefined,
    message:      row.message,
    read_at:      row.read_at    ?? undefined,
    is_read:      row.is_read    ?? false,
    status:       row.status === "read" ? "in_progress" : row.status,
    admin_notes:  row.admin_notes ?? undefined,
    answered_at:  row.answered_at ?? undefined,
    created_at:   row.created_at,
    updated_at:   row.updated_at ?? row.created_at,
  };
}

export function replyFromDb(row: ContactReplyRow): ContactReply {
  return {
    id:          row.id,
    message_id:  row.message_id,
    garage_id:   row.garage_id ?? undefined,
    sender_type: row.sender_type,
    content:     row.content,
    created_at:  row.created_at,
  };
}

// ─── Domaine → Insert DB ──────────────────────────────────────────

export function messageToInsert(input: MessageCreateInput): MessageInsert {
  const name = `${input.firstname} ${input.lastname}`.trim();
  return {
    garage_id:  input.garage_id  ?? null,
    vehicle_id: input.vehicle_id ?? null,
    firstname:  input.firstname,
    lastname:   input.lastname,
    name,
    email:      input.email,
    phone:      input.phone ?? null,
    subject:    input.subject ?? null,
    message:    input.message,
    is_read:    false,
  };
}

export function replyToInsert(input: ReplyCreateInput): ContactReplyInsert {
  return {
    message_id:  input.message_id,
    garage_id:   input.garage_id ?? null,
    sender_type: input.sender_type,
    content:     input.content,
  };
}

// ─── Domaine → Update DB ──────────────────────────────────────────

export function messageToUpdate(input: MessageUpdateInput): MessageUpdate {
  const update: MessageUpdate = {};
  if (input.status      !== undefined) update.status      = input.status;
  if (input.is_read     !== undefined) update.is_read     = input.is_read;
  if (input.admin_notes !== undefined) update.admin_notes = input.admin_notes;
  if (input.answered_at !== undefined) update.answered_at = input.answered_at;
  return update;
}
