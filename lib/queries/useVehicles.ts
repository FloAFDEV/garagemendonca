"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleKeys } from "./keys";
import { STALE_TIMES, GC_TIMES } from "./config";
import {
  fetchVehiclesAction,
  fetchVehiclesAdminAction,
  fetchFeaturedVehiclesAction,
} from "@/lib/safe-actions/fetchVehicles";
import type { UIVehicle, UIVehicleFilters } from "@/types/ui";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

// ─── Catalogue public ─────────────────────────────────────────────

export function useVehicles(filters?: UIVehicleFilters) {
  return useQuery<UIVehicle[]>({
    queryKey:  vehicleKeys.list(filters),
    queryFn:   () => fetchVehiclesAction(GARAGE_ID, filters),
    staleTime: STALE_TIMES.PUBLIC,
    gcTime:    GC_TIMES.PUBLIC,
    enabled:   !!GARAGE_ID,
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
