"use client";

import { useQuery } from "@tanstack/react-query";
import { messageKeys } from "./keys";
import { STALE_TIMES, GC_TIMES } from "./config";
import {
  fetchMessagesAction,
  fetchUnreadCountAction,
} from "@/lib/safe-actions/fetchMessages";
import type { UIMessage } from "@/types/ui";

// ─── Boîte de réception admin ────────────────────────────────────

export function useMessages(garageId: string) {
  return useQuery<UIMessage[]>({
    queryKey:  messageKeys.list(garageId),
    queryFn:   () => fetchMessagesAction(garageId),
    staleTime: STALE_TIMES.ADMIN,
    gcTime:    GC_TIMES.ADMIN,
    enabled:   !!garageId,
  });
}

// ─── Compteur non-lus (badge sidebar) ────────────────────────────

export function useUnreadCount(garageId: string) {
  return useQuery<number>({
    queryKey:    messageKeys.unread(garageId),
    queryFn:     () => fetchUnreadCountAction(garageId),
    staleTime:   STALE_TIMES.ADMIN,
    gcTime:      GC_TIMES.ADMIN,
    enabled:     !!garageId,
    refetchInterval: 60 * 1000, // re-poll toutes les 60s
  });
}
