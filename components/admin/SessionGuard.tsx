"use client";

/**
 * SessionGuard — Surveillance d'inactivité admin
 * ─────────────────────────────────────────────────────────────────────────
 * - Réinitialise le timer à chaque interaction utilisateur
 * - Affiche un toast d'avertissement à WARN_MS avant l'expiration
 * - Déconnecte automatiquement après IDLE_MS d'inactivité
 * - Compatible dark/light mode (lit le thème via CSS variables)
 */

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

const IDLE_MS  = 30 * 60 * 1000; // 30 min → déconnexion
const WARN_MS  = 25 * 60 * 1000; // 25 min → avertissement
const EVENTS   = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;

export default function SessionGuard() {
  const router   = useRouter();
  const idleRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef = useRef(false);

  const signOut = useCallback(async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push("/login?session=expired");
  }, [router]);

  const resetTimers = useCallback(() => {
    if (idleRef.current)  clearTimeout(idleRef.current);
    if (warnRef.current)  clearTimeout(warnRef.current);
    warnedRef.current = false;

    warnRef.current = setTimeout(() => {
      if (warnedRef.current) return;
      warnedRef.current = true;
      toast.warning("Votre session va expirer dans 5 minutes", {
        description: "Bougez la souris ou appuyez sur une touche pour rester connecté.",
        duration: 10_000,
        id: "session-expiry-warn",
      });
    }, WARN_MS);

    idleRef.current = setTimeout(() => {
      toast.error("Session expirée — reconnexion requise", {
        id: "session-expiry-logout",
        duration: 4_000,
      });
      void signOut();
    }, IDLE_MS);
  }, [signOut]);

  useEffect(() => {
    // Ne rien faire si Supabase n'est pas configuré
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    resetTimers();
    for (const ev of EVENTS) {
      window.addEventListener(ev, resetTimers, { passive: true });
    }
    return () => {
      if (idleRef.current)  clearTimeout(idleRef.current);
      if (warnRef.current)  clearTimeout(warnRef.current);
      for (const ev of EVENTS) {
        window.removeEventListener(ev, resetTimers);
      }
    };
  }, [resetTimers]);

  return null; // Aucun markup — composant de logique pure
}
