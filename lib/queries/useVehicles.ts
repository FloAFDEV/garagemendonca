"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleKeys } from "./keys";
import { STALE_TIMES, GC_TIMES } from "./config";
import {
  fetchVehiclesAction,
  fetchVehiclesAdminAction,
  fetchFeaturedVehiclesAction,
} from "@/lib/safe-actions/fetchVehicles";
import { getAdminVehicles } from "@/app/admin/vehicules/actions";
import type { UIVehicle, UIVehicleFilters } from "@/types/ui";
import type { Vehicle } from "@/types";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";

// ─── Catalogue public ─────────────────────────────────────────────

export function useVehicles(filters?: UIVehicleFilters) {
  return useQuery<UIVehicle[]>({
    queryKey:            vehicleKeys.list(filters),
    queryFn:             () => fetchVehiclesAction(GARAGE_ID, filters),
    staleTime:           STALE_TIMES.PUBLIC,
    gcTime:              GC_TIMES.PUBLIC,
    enabled:             !!GARAGE_ID,
    refetchOnWindowFocus: false, // pas de rechargement intempestif au focus
  });
}

// ─── Liste admin complète (Vehicle[] — page véhicules admin) ────────
// Utilise React Query pour éviter un re-fetch complet à chaque navigation.
// Les données sont servies depuis le cache (staleTime 30s) au retour sur la page.

export function useAdminVehiclesList() {
  return useQuery<Vehicle[]>({
    queryKey:            ["vehicles", "admin-list", GARAGE_ID],
    queryFn:             getAdminVehicles,
    staleTime:           STALE_TIMES.ADMIN_LIST, // 3 min — cache chaud pour retour liste
    gcTime:              GC_TIMES.ADMIN_LIST,    // 10 min — survit aller-retour fiche
    enabled:             !!GARAGE_ID,
    refetchOnMount:      false, // affiche immédiatement le cache au retour
    refetchOnWindowFocus: false, // pas de re-fetch sur focus fenêtre
  });
}

// ─── Liste admin (tous statuts) ───────────────────────────────────

export function useVehiclesAdmin(garageId?: string) {
  const gid = garageId ?? GARAGE_ID;
  return useQuery<UIVehicle[]>({
    queryKey:  vehicleKeys.admin(gid),
    queryFn:   () => fetchVehiclesAdminAction(gid),
    staleTime: STALE_TIMES.ADMIN,
    gcTime:    GC_TIMES.ADMIN,
    enabled:   !!gid,
  });
}

// ─── Véhicules mis en avant (home) ───────────────────────────────

export function useFeaturedVehicles(limit = 6) {
  return useQuery<UIVehicle[]>({
    queryKey:  [...vehicleKeys.lists(), "featured", limit],
    queryFn:   () => fetchFeaturedVehiclesAction(GARAGE_ID, limit),
    staleTime: STALE_TIMES.PUBLIC,
    gcTime:    GC_TIMES.PUBLIC,
    enabled:   !!GARAGE_ID,
  });
}

// ─── Préchargement (Server Component → Client Component) ──────────

export function usePrefetchVehicles(filters?: UIVehicleFilters) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.prefetchQuery({
      queryKey: vehicleKeys.list(filters),
      queryFn:  () => fetchVehiclesAction(GARAGE_ID, filters),
      staleTime: STALE_TIMES.PUBLIC,
    });
}
