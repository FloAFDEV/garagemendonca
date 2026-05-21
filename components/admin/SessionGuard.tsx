"use client";

/**
 * SessionGuard — Surveillance d'inactivité admin
 * ─────────────────────────────────────────────────────────────────────────
 * - Réinitialise le timer à chaque interaction utilisateur
 * - Affiche un toast d'avertissement à WARN_MS avant l'expiration
 * - Déconnecte automatiquement après IDLE_MS d'inactivité
 * - Compatible dark/light mode (lit le thème via CSS variables)
 *
 * La déconnexion passe par POST /api/auth/signout (route serveur) pour
 * effacer les cookies HTTP-only de @supabase/ssr — un simple browser
 * signOut() ne suffit pas et permettrait de rester connecté après F5.
 */

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

const IDLE_MS  = 30 * 60 * 1000; // 30 min → déconnexion
const WARN_MS  = 25 * 60 * 1000; // 25 min → avertissement
const EVENTS   = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;

export default function SessionGuard() {
  const idleRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef = useRef(false);

  // POST vers le route handler serveur qui révoque la session ET efface
  // les cookies HTTP-only — garantit que F5 ne bypasse pas le re-login.
  const signOut = useCallback(async (reason: "expired" | "inactivity" = "expired") => {
    await fetch(`/api/auth/signout?reason=${reason}`, { method: "POST" });
    window.location.href = `/login?session=${reason}`;
  }, []);

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
      void signOut("inactivity");
    }, IDLE_MS);
  }, [signOut]);

  // Vérifie la validité de la session côté serveur quand l'onglet redevient
  // visible. Les timers JS sont suspendus en arrière-plan — on ne peut donc
  // pas compter sur IDLE_MS pour détecter qu'un token a expiré pendant que
  // l'onglet était caché. On appelle /api/auth/signout en mode dry-run via
  // un GET pour vérifier la session sans la révoquer.
  const checkSessionOnFocus = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const res = await fetch("/api/auth/session-check", { method: "GET", cache: "no-store" });
    if (res.status === 401) {
      toast.error("Session expirée — reconnexion requise", {
        id: "session-expiry-logout",
        duration: 4_000,
      });
      void signOut("expired");
    }
  }, [signOut]);

  useEffect(() => {
    // Ne rien faire si Supabase n'est pas configuré
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    resetTimers();
    for (const ev of EVENTS) {
      window.addEventListener(ev, resetTimers, { passive: true });
    }
    document.addEventListener("visibilitychange", checkSessionOnFocus);
    return () => {
      if (idleRef.current)  clearTimeout(idleRef.current);
      if (warnRef.current)  clearTimeout(warnRef.current);
      for (const ev of EVENTS) {
        window.removeEventListener(ev, resetTimers);
      }
      document.removeEventListener("visibilitychange", checkSessionOnFocus);
    };
  }, [resetTimers, checkSessionOnFocus]);

  return null; // Aucun markup — composant de logique pure
}
