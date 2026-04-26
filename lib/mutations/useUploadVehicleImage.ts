"use client";

/**
 * Upload d'images véhicule — flux hybride :
 *
 *  1. Client → Server Action : génère une URL signée Supabase Storage
 *  2. Client → PUT direct sur l'URL signée (aucune dépendance Supabase côté UI)
 *  3. Server Action : enregistre le VehicleImage en DB
 *
 * Ce hook orchestre les 3 étapes et invalide le cache React Query.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vehicleKeys } from "@/lib/queries/keys";
import {
  createUploadUrlAction,
  saveVehicleImageAction,
} from "@/lib/safe-actions/uploadVehicleImage";
import type { VehicleImage } from "@/types";

interface UploadImageArgs {
  vehicleId: string;
  garageId:  string;
  file:      File;
  isPrimary?: boolean;
}

export function useUploadVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, garageId, file, isPrimary = false }: UploadImageArgs): Promise<VehicleImage> => {
      // 1. Génère une URL signée côté serveur
      const { signedUrl, publicUrl, error } = await createUploadUrlAction(
        garageId,
        vehicleId,
        file.name,
        file.type,
      );
      if (error || !signedUrl) throw new Error(error ?? "Impossible de générer l'URL d'upload.");

      // 2. Upload direct vers Supabase Storage (PUT sur URL signée — pas de client Supabase)
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body:   file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Échec de l'upload de l'image.");

      // 3. Enregistre le record en DB via server action
      const result = await saveVehicleImageAction({
        vehicleId,
        garageId,
        url:       publicUrl,
        isPrimary,
      });
      if ("error" in result) throw new Error(result.error?.message ?? "Erreur d'enregistrement.");
      return result.data;
    },

    onSuccess: (_img, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      toast.success("Image ajoutée.");
    },

    onError: (err: Error) => {
      toast.error(err.message ?? "Erreur lors de l'upload.");
    },
  });
}
