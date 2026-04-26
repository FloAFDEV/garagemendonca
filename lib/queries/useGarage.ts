"use client";

import { useQuery } from "@tanstack/react-query";
import { garageKeys } from "./keys";
import { STALE_TIMES, GC_TIMES } from "./config";
import {
  fetchGarageByIdAction,
  fetchGarageBySlugAction,
} from "@/lib/safe-actions/fetchGarage";
import type { UIGarage } from "@/types/ui";

const GARAGE_ID   = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
const GARAGE_SLUG = process.env.NEXT_PUBLIC_GARAGE_SLUG ?? "";

// ─── Config garage courante (données quasi-statiques) ─────────────

export function useCurrentGarage() {
  return useQuery<UIGarage | null>({
    queryKey:  garageKeys.detail(GARAGE_ID),
    queryFn:   () => fetchGarageByIdAction(GARAGE_ID),
    staleTime: STALE_TIMES.STATIC,
    gcTime:    GC_TIMES.STATIC,
    enabled:   !!GARAGE_ID,
  });
}

// ─── Garage par ID ───────────────────────────────────────────────

export function useGarageById(id: string) {
  return useQuery<UIGarage | null>({
    queryKey:  garageKeys.detail(id),
    queryFn:   () => fetchGarageByIdAction(id),
    staleTime: STALE_TIMES.STATIC,
    gcTime:    GC_TIMES.STATIC,
    enabled:   !!id,
  });
}

// ─── Garage par slug ─────────────────────────────────────────────

export function useGarageBySlug(slug: string) {
  return useQuery<UIGarage | null>({
    queryKey:  garageKeys.slug(slug),
    queryFn:   () => fetchGarageBySlugAction(slug),
    staleTime: STALE_TIMES.STATIC,
    gcTime:    GC_TIMES.STATIC,
    enabled:   !!slug,
  });
}
