"use server";

import { vehicleDb } from "@/lib/db/vehicle.repository";
import { toUIVehicle } from "@/types/ui";
import type { UIVehicle } from "@/types/ui";

export async function fetchVehicleBySlugAction(
  garageId: string,
  slug: string,
): Promise<UIVehicle | null> {
  const vehicle = await vehicleDb.getBySlug(garageId, slug);
  return vehicle ? toUIVehicle(vehicle) : null;
}

export async function fetchVehicleByIdAction(id: string): Promise<UIVehicle | null> {
  const vehicle = await vehicleDb.getById(id);
  return vehicle ? toUIVehicle(vehicle) : null;
}
