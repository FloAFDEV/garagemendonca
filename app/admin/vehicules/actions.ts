"use server";

import {
	updateVehicle,
	createVehicle,
	deleteVehicle,
} from "@/lib/vehicles";
import type { VehicleStatus, VehicleUpdateInput, VehicleCreateInput } from "@/types";
import { revalidatePath } from "next/cache";

/* ── Helpers ─────────────────────────────────────────────────── */

function revalidateAll(id?: string) {
	revalidatePath("/");
	revalidatePath("/vehicules");
	if (id) revalidatePath(`/vehicules/${id}`);
}

/* ── Status ──────────────────────────────────────────────────── */

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
	await updateVehicle(id, {
		status,
		...(status === "sold" ? { sold_at: new Date().toISOString() } : {}),
	});
	revalidateAll(id);
}

/* ── Update ──────────────────────────────────────────────────── */

export async function saveVehicle(id: string, input: VehicleUpdateInput) {
	await updateVehicle(id, input);
	revalidateAll(id);
}

/* ── Create ──────────────────────────────────────────────────── */

/**
 * Crée un véhicule dans le _store serveur.
 * Accepte un `id` optionnel pré-généré pour que demoStore et _store
 * partagent le même identifiant (indispensable pour delete/update cohérent).
 */
export async function createVehicleAction(
	input: VehicleCreateInput & { id?: string },
): Promise<{ id: string }> {
	const vehicle = await createVehicle(input);
	revalidateAll(vehicle.id);
	return { id: vehicle.id };
}

/* ── Delete ──────────────────────────────────────────────────── */

export async function deleteVehicleAction(id: string): Promise<void> {
	await deleteVehicle(id);
	revalidateAll(id);
}
