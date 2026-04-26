"use client";

/**
 * Hook React — utilisateur authentifié côté client.
 *
 * Souscrit aux changements de session via onAuthStateChange.
 * Utilise le client browser (anon key) — safe pour les Client Components.
 *
 * Usage :
 *   const { user, loading } = useUser();
 */

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";

interface UseUserReturn {
  user:    User | null;
  loading: boolean;
}

export function useUser(): UseUserReturn {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Charge l'utilisateur immédiatement
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    // Souscription aux changements de session (login / logout / refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
