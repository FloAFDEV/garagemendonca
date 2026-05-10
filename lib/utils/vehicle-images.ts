import type { Vehicle, VehicleImage } from "@/types";

/**
 * Returns the resolved image URL list for a vehicle.
 * Priority: vehicleImages table (new) → vehicles.images JSONB (legacy).
 */
export function getVehicleImages(
  vehicle: Pick<Vehicle, "images" | "vehicleImages">,
  vehicleImages?: VehicleImage[],
): string[] {
  const joined = vehicleImages ?? vehicle.vehicleImages;
  if (joined && joined.length > 0) return joined.map((img) => img.url);
  return vehicle.images ?? [];
}

/**
 * Returns the primary image URL for a vehicle, with optional thumbnail shortcut.
 * Priority: thumbnailUrl → first vehicleImage → first images[] URL.
 */
export function getPrimaryImageUrl(
  vehicle: Pick<Vehicle, "images" | "vehicleImages" | "thumbnailUrl">,
  vehicleImages?: VehicleImage[],
): string | undefined {
  if (vehicle.thumbnailUrl) return vehicle.thumbnailUrl;
  const joined = vehicleImages ?? vehicle.vehicleImages;
  if (joined && joined.length > 0) return joined[0].url;
  return vehicle.images?.[0];
}
