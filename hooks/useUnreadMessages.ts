"use client";

import { useMessageStats } from "@/hooks/useMessageStats";

/**
 * Dérive le compteur non-lus depuis useMessageStats.
 * Les deux hooks partagent la même query key → une seule requête Supabase,
 * un seul polling, zéro duplication réseau.
 */
export function useUnreadMessages(): number {
  const { data: stats } = useMessageStats();
  return stats?.unread ?? 0;
}
