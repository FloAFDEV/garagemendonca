"use client";

import { useQuery } from "@tanstack/react-query";
import { messageKeys } from "@/lib/queries/keys";
import { fetchMessageStatsAction } from "@/lib/safe-actions/fetchMessages";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";

export function useMessageStats() {
  const garageId = ACTIVE_GARAGE_ID;

  return useQuery({
    queryKey: messageKeys.stats(garageId),
    queryFn: () => fetchMessageStatsAction(garageId),
    enabled: Boolean(garageId),
    // Polling uniquement quand l'onglet est actif
    refetchInterval: () => (typeof document !== "undefined" && document.hidden ? false : 60_000),
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}
