"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vehicleKeys } from "@/lib/queries/keys";
import { createVehicleAction } from "@/lib/safe-actions/createVehicle";
import { extractGlobalError, extractFieldErrors } from "@/lib/ui/formErrorMapper";
import type { VehicleCreateInput } from "@/lib/validation/vehicle.schema";
import type { UIVehicle } from "@/types/ui";
import { toUIVehicle } from "@/types/ui";

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VehicleCreateInput) => {
      const result = await createVehicleAction(input);
      if ("error" in result) throw result.error;
      return toUIVehicle(result.data);
    },

    onSuccess: (vehicle: UIVehicle) => {
      // Invalide toutes les listes — le nouveau véhicule y apparaîtra
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.admin(vehicle.id) });
      toast.success(`${vehicle.label} ajouté avec succès.`);
    },

    onError: (err: unknown) => {
      const msg = extractGlobalError(err) ?? "Erreur lors de la création du véhicule.";
      toast.error(msg);
    },
  });
}

// ─── Helpers ré-exportés pour les formulaires ─────────────────────
export { extractFieldErrors };
