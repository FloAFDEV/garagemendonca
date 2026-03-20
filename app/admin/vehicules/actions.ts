"use server";

import { updateVehicle } from "@/lib/vehicles";
import { VehicleStatus, VehicleUpdateInput } from "@/types";

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  await updateVehicle(id, {
    status,
    ...(status === "sold" ? { sold_at: new Date().toISOString() } : {}),
  });
}

export async function saveVehicle(id: string, input: VehicleUpdateInput) {
  await updateVehicle(id, input);
}
