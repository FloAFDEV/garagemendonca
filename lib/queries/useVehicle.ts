"use client";

import { useQuery } from "@tanstack/react-query";
import { vehicleKeys } from "./keys";
import { STALE_TIMES, GC_TIMES } from "./config";
import {
  fetchVehicleBySlugAction,
  fetchVehicleByIdAction,
} from "@/lib/safe-actions/fetchVehicle";
import type { UIVehicle } from "@/types/ui";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

// ─── Fiche véhicule par slug (SEO) ───────────────────────────────

export function useVehicle(slug: string) {
  return useQuery<UIVehicle | null>({
    queryKey:  vehicleKeys.detail(slug),
    queryFn:   () => fetchVehicleBySlugAction(GARAGE_ID, slug),
    staleTime: STALE_TIMES.PUBLIC,
    gcTime:    GC_TIMES.PUBLIC,
    enabled:   !!slug && !!GARAGE_ID,
  });
}

// ─── Fiche véhicule par ID (admin) ───────────────────────────────

export function useVehicleById(id: string) {
  return useQuery<UIVehicle | null>({
    queryKey:  vehicleKeys.detail(id),
    queryFn:   () => fetchVehicleByIdAction(id),
    staleTime: STALE_TIMES.ADMIN,
    gcTime:    GC_TIMES.ADMIN,
    enabled:   !!id,
  });
}
