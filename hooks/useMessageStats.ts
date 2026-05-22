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
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
