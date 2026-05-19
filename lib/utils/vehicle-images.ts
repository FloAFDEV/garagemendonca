import type { Vehicle, VehicleImage } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = "vehicle-images";

/**
 * Calcule l'URL publique d'une image depuis son storage_path.
 * Synchrone, sans réseau — le bucket doit être public dans Supabase.
 */
export function getVehiclePublicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/**
 * Returns the resolved image URL list for a vehicle.
 * Priority: storage_path → public URL | stored url | legacy images JSONB.
 */
export function getVehicleImages(
  vehicle: Pick<Vehicle, "images" | "vehicleImages">,
  vehicleImages?: VehicleImage[],
): string[] {
  const joined = vehicleImages ?? vehicle.vehicleImages;
  if (joined && joined.length > 0) {
    return joined.map((img) =>
      img.storage_path ? getVehiclePublicUrl(img.storage_path) : img.url,
    );
  }
  return vehicle.images ?? [];
}
