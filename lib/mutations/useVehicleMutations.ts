"use client";

/**
 * Mutations admin véhicule avec optimistic updates React Query.
 *
 * Pattern :
 *   onMutate  → cancelQueries + snapshot + setQueryData (update optimiste)
 *   onError   → rollback snapshot + toast erreur
 *   onSettled → invalidateQueries ciblé (sync background silencieux)
 *
 * La clé de cache est volontairement dupliquée depuis useAdminVehiclesList
 * pour éviter d'importer le hook (dépendance circulaire). Si la clé change,
 * mettre à jour ADMIN_LIST_KEY ici et dans useVehicles.ts.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Vehicle, VehicleStatus } from "@/types";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";
import {
  deleteVehicleAction,
  updateVehicleStatus,
} from "@/app/admin/vehicules/actions";

// Doit correspondre exactement à queryKey dans useAdminVehiclesList()
const ADMIN_LIST_KEY = ["vehicles", "admin-list", GARAGE_ID] as const;

// ─── Suppression ─────────────────────────────────────────────────────────────

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => deleteVehicleAction(vehicleId),

    onMutate: async (vehicleId: string) => {
      // Annule les refetch en cours pour éviter d'écraser l'update optimiste
      await queryClient.cancelQueries({ queryKey: ADMIN_LIST_KEY });
      // Snapshot pour rollback
      const previous = queryClient.getQueryData<Vehicle[]>(ADMIN_LIST_KEY);
      // Update optimiste : retrait immédiat du cache
      queryClient.setQueryData<Vehicle[]>(ADMIN_LIST_KEY, (old = []) =>
        old.filter((v) => v.id !== vehicleId),
      );
      return { previous };
    },

    onError: (_err, _vehicleId, ctx) => {
      // Rollback : restaure le cache tel qu'avant la mutation
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(ADMIN_LIST_KEY, ctx.previous);
      }
      toast.error("La suppression a échoué — le véhicule a été restauré.");
    },

    onSettled: () => {
      // Sync silencieux en background (ne bloque pas l'UI)
      queryClient.invalidateQueries({ queryKey: ADMIN_LIST_KEY });
    },
  });
}

// ─── Changement de statut ─────────────────────────────────────────────────────

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VehicleStatus }) =>
      updateVehicleStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_LIST_KEY });
      const previous = queryClient.getQueryData<Vehicle[]>(ADMIN_LIST_KEY);
      queryClient.setQueryData<Vehicle[]>(ADMIN_LIST_KEY, (old = []) =>
        old.map((v) =>
          v.id === id
            ? {
                ...v,
                status,
                ...(status === "sold"
                  ? { sold_at: new Date().toISOString() }
                  : {}),
              }
            : v,
        ),
      );
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(ADMIN_LIST_KEY, ctx.previous);
      }
      toast.error("La mise à jour du statut a échoué.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LIST_KEY });
    },
  });
}
