"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vehicleKeys } from "@/lib/queries/keys";
import { updateVehicleAction } from "@/lib/safe-actions/updateVehicle";
import { extractGlobalError } from "@/lib/ui/formErrorMapper";
import type { VehicleUpdateInput } from "@/lib/validation/vehicle.schema";
import type { UIVehicle } from "@/types/ui";
import { toUIVehicle } from "@/types/ui";

interface UpdateVehicleArgs {
  id: string;
  garageId: string;
  input: VehicleUpdateInput;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, garageId, input }: UpdateVehicleArgs) => {
      const result = await updateVehicleAction(id, garageId, input);
      if ("error" in result) throw result.error;
      return toUIVehicle(result.data);
    },

    // Optimistic update : met à jour le cache avant la confirmation serveur
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: vehicleKeys.all() });
      const slug = input.slug ?? id;
      const previous = queryClient.getQueryData<UIVehicle | null>(vehicleKeys.detail(slug));

      if (previous) {
        queryClient.setQueryData<UIVehicle>(vehicleKeys.detail(slug), (old) =>
          old ? { ...old, ...input } as UIVehicle : old!,
        );
      }

      return { previous, slug };
    },

    onSuccess: (vehicle: UIVehicle, _vars, _ctx) => {
      // Remplace le cache optimiste par les vraies données serveur
      queryClient.setQueryData(vehicleKeys.detail(vehicle.slug ?? vehicle.id), vehicle);
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success("Véhicule mis à jour.");
    },

    onError: (err: unknown, _vars, ctx) => {
      // Rollback de l'optimistic update
      if (ctx?.previous !== undefined && ctx.slug) {
        queryClient.setQueryData(vehicleKeys.detail(ctx.slug), ctx.previous);
      }
      const msg = extractGlobalError(err) ?? "Erreur lors de la mise à jour.";
      toast.error(msg);
    },
  });
}
