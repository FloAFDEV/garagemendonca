"use client";

/**
 * Hook React — garage courant + rôle de l'utilisateur.
 *
 * En single-garage (mode actuel) : lit NEXT_PUBLIC_GARAGE_ID.
 * Charge le profil depuis Supabase et détermine le rôle via garage_users.
 *
 * Usage :
 *   const { garageId, role, isAdmin, loading } = useGarage();
 */

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";
import { useUser } from "./useUser";
import type { UserRoleEnum } from "@/lib/supabase/database.types";

interface UseGarageReturn {
  garageId: string | null;
  role:     UserRoleEnum | null;
  isAdmin:  boolean;
  loading:  boolean;
}

export function useGarage(): UseGarageReturn {
  const { user, loading: userLoading } = useUser();
  const [role,    setRole]    = useState<UserRoleEnum | null>(null);
  const [loading, setLoading] = useState(true);

  const garageId = process.env.NEXT_PUBLIC_GARAGE_ID ?? null;

  useEffect(() => {
    if (userLoading) return;

    if (!user || !garageId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase
      .from("garage_users")
      .select("role")
      .eq("garage_id", garageId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRole(((data as { role: UserRoleEnum } | null)?.role) ?? null);
        setLoading(false);
      });
  }, [user, userLoading, garageId]);

  const isAdmin = role === "admin" || role === "superadmin";

  return { garageId, role, isAdmin, loading: userLoading || loading };
}
