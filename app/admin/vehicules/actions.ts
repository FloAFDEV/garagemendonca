"use server";

import type { Vehicle, VehicleStatus, VehicleUpdateInput, VehicleCreateInput } from "@/types";
import { revalidatePath } from "next/cache";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { vehicleFromDb } from "@/lib/mappers/vehicle.mapper";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { logAudit } from "@/lib/audit/logAction";

const GARAGE_ID = () => process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

async function assertAdmin() {
	await assertSameOrigin();
	const err = await requireAdminForGarage(GARAGE_ID());
	if (err) throw new Error(err.message);
}

/* ── Admin reads (service-role, bypasse RLS) ─────────────────── */

export async function getAdminVehicles(): Promise<Vehicle[]> {
	if (!SUPABASE_ENABLED) throw new Error("[getAdminVehicles] Supabase requis");
	const db = createSupabaseAdminClient();
	const { data, error } = await db
		.from("vehicles")
		.select("*, vehicle_images(id, url, storage_path, alt, sort_order, is_primary)")
		.eq("garage_id", GARAGE_ID())
		.order("created_at", { ascending: false });
	if (error) throw error;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (data ?? []).map((row) => vehicleFromDb(row as any));
}

export async function getAdminVehicleById(id: string): Promise<Vehicle | null> {
	if (!SUPABASE_ENABLED) throw new Error("[getAdminVehicleById] Supabase requis");
	const db = createSupabaseAdminClient();
	const { data, error } = await db
		.from("vehicles")
		.select("*, vehicle_images(id, url, alt, sort_order, is_primary, storage_path)")
		.eq("id", id)
		.maybeSingle();
	if (error) throw error;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return data ? vehicleFromDb(data as any) : null;
}

/* ── Helpers ─────────────────────────────────────────────────── */

function revalidateAll(id?: string) {
	revalidatePath("/");
	revalidatePath("/vehicules");
	if (id) revalidatePath(`/vehicules/${id}`);
}

function toDbRow(input: VehicleUpdateInput): Record<string, unknown> {
	const row: Record<string, unknown> = {};
	if (input.garageId !== undefined)         row.garage_id = input.garageId;
	if (input.brand !== undefined)            row.brand = input.brand;
	if (input.model !== undefined)            row.model = input.model;
	if (input.year !== undefined)             row.year = input.year;
	if (input.mileage !== undefined)          row.mileage = input.mileage;
	if (input.fuel !== undefined)             row.fuel = input.fuel;
	if (input.transmission !== undefined)     row.transmission = input.transmission;
	if (input.power !== undefined)            row.power = input.power;
	if (input.price !== undefined)            row.price = input.price;
	if (input.color !== undefined)            row.color = input.color;
	if (input.doors !== undefined)            row.doors = input.doors;
	if (input.description !== undefined)             row.description = input.description;
	if (input.description_marketing !== undefined)   row.description_marketing = input.description_marketing;
	if (input.images !== undefined)           row.images = input.images;
	if (input.status !== undefined)           row.status = input.status;
	if (input.published_at !== undefined)     row.published_at = input.published_at;
	if (input.sold_at !== undefined)          row.sold_at = input.sold_at;
	if (input.featured !== undefined)         row.featured = input.featured;
	if (input.featuredOrder !== undefined)    row.featured_order = input.featuredOrder;
	if (input.categories !== undefined)       row.categories = input.categories;
	if (input.slug !== undefined)             row.slug = input.slug;
	if (input.meta_description !== undefined) row.meta_description = input.meta_description;
	if (input.critAir !== undefined)          row.crit_air = input.critAir;
	if (input.features !== undefined)         row.features = input.features;
	if (input.options !== undefined)          row.options = input.options;
	if (input.export_leboncoin !== undefined) row.export_leboncoin = input.export_leboncoin;
	return row;
}

/* ── Status ──────────────────────────────────────────────────── */

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
	if (!SUPABASE_ENABLED) throw new Error("[updateVehicleStatus] Supabase requis");
	await assertAdmin();
	const db = createSupabaseAdminClient();
	const { error } = await db
		.from("vehicles")
		.update({
			status,
			...(status === "sold" ? { sold_at: new Date().toISOString() } : {}),
			updated_at: new Date().toISOString(),
		})
		.eq("id", id);
	if (error) throw error;
	revalidateAll(id);
	await logAudit({ action: "update", resourceType: "vehicle", resourceId: id, details: { status } });
}

/* ── Update ──────────────────────────────────────────────────── */

export async function saveVehicle(id: string, input: VehicleUpdateInput) {
	if (!SUPABASE_ENABLED) throw new Error("[saveVehicle] Supabase requis");
	await assertAdmin();
	const db = createSupabaseAdminClient();
	const row = { ...toDbRow(input), updated_at: new Date().toISOString() };
	const { error } = await db.from("vehicles").update(row).eq("id", id);
	if (error) throw error;
	revalidateAll(id);
	await logAudit({ action: "update", resourceType: "vehicle", resourceId: id });
}

/* ── Create ──────────────────────────────────────────────────── */

export async function createVehicleAction(
	input: VehicleCreateInput & { id?: string },
): Promise<{ id: string }> {
	if (!SUPABASE_ENABLED) throw new Error("[createVehicleAction] Supabase requis");
	await assertAdmin();
	const db = createSupabaseAdminClient();
	const row = {
		...toDbRow(input),
		garage_id: input.garageId ?? GARAGE_ID(),
		...(input.id ? { id: input.id } : {}),
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	const { data, error } = await db
		.from("vehicles")
		.insert(row)
		.select("id")
		.single();
	if (error) throw error;
	revalidateAll(data.id);
	await logAudit({ action: "create", resourceType: "vehicle", resourceId: data.id });
	return { id: data.id };
}

/* ── Delete ──────────────────────────────────────────────────── */

export async function deleteVehicleAction(id: string): Promise<void> {
	if (!SUPABASE_ENABLED) throw new Error("[deleteVehicleAction] Supabase requis");
	await assertAdmin();
	const db = createSupabaseAdminClient();
	const { error } = await db.from("vehicles").delete().eq("id", id);
	if (error) throw error;
	revalidateAll(id);
	await logAudit({ action: "delete", resourceType: "vehicle", resourceId: id });
}
