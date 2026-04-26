"use server";

import { vehicleDb, type VehicleListFilters } from "@/lib/db/vehicle.repository";
import { toUIVehicle } from "@/types/ui";
import type { UIVehicle } from "@/types/ui";

export async function fetchVehiclesAction(
  garageId: string,
  filters?: VehicleListFilters,
): Promise<UIVehicle[]> {
  const vehicles = await vehicleDb.list(garageId, filters ?? {});
  return vehicles.map(toUIVehicle);
}

export async function fetchVehiclesAdminAction(garageId: string): Promise<UIVehicle[]> {
  const vehicles = await vehicleDb.listAdmin(garageId);
  return vehicles.map(toUIVehicle);
}

export async function fetchFeaturedVehiclesAction(
  garageId: string,
  limit = 6,
): Promise<UIVehicle[]> {
  const vehicles = await vehicleDb.getFeatured(garageId, limit);
  return vehicles.map(toUIVehicle);
}
