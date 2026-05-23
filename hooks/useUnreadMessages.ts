"use client";

import { useQuery } from "@tanstack/react-query";
import { messageKeys } from "@/lib/queries/keys";
import { fetchUnreadCountAction } from "@/lib/safe-actions/fetchMessages";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";

export function useUnreadMessages() {
  const garageId = ACTIVE_GARAGE_ID;

  const { data: count = 0 } = useQuery({
    queryKey: messageKeys.unread(garageId),
    queryFn: () => fetchUnreadCountAction(garageId),
    enabled: Boolean(garageId),
    // Polling uniquement quand l'onglet est actif
    refetchInterval: () => (typeof document !== "undefined" && document.hidden ? false : 60_000),
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });

  return count;
}
