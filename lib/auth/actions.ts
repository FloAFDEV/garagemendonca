"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth/rateLimit";
import { logAudit } from "@/lib/audit/logAction";
import { logSecurityEvent } from "@/lib/security/logEvent";

async function createActionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              ...options,
            }),
          );
        },
      },
    },
  );
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      },
    );
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

export interface SignInResult {
  error: string;
  requireTurnstile?: boolean;
}

export async function signInAction(
  email: string,
  password: string,
  redirectTo?: string,
  turnstileToken?: string,
): Promise<SignInResult> {
  const h = await headers();
  const ip = getClientIp(h);

  // ── 1. Rate limiting ──────────────────────────────────────────
  const rateResult = await checkRateLimit(ip);
  if (rateResult.blocked) {
    const minutes = Math.ceil(
      (rateResult.retryAfter!.getTime() - Date.now()) / 60_000,
    );
    await logSecurityEvent({ eventType: "rate_limited", ip, userEmail: email });
    return {
      error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).`,
    };
  }

  // ── 2. Turnstile (si configuré et seuil atteint) ─────────────
  const turnstileEnabled = !!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  const turnstileThreshold = 3;

  if (turnstileEnabled && rateResult.attempts >= turnstileThreshold) {
    if (!turnstileToken) {
      return {
        error: "Veuillez compléter le test de sécurité ci-dessous.",
        requireTurnstile: true,
      };
    }
    const valid = await verifyTurnstile(turnstileToken, ip);
    if (!valid) {
      return {
        error: "Vérification de sécurité échouée. Réessayez.",
        requireTurnstile: true,
      };
    }
  }

  // ── 3. Rotation de session (anti-fixation) ────────────────────
  // On détruit la session locale avant de créer la nouvelle.
  // Supabase génère de nouveaux tokens à chaque signInWithPassword,
  // mais ce signOut garantit qu'aucun cookie résiduel ne persiste.
  const supabase = await createActionClient();
  await supabase.auth.signOut({ scope: "local" });

  // ── 4. Tentative d'authentification Supabase ─────────────────
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const newAttempts = rateResult.attempts + 1;
    await Promise.all([
      recordFailedAttempt(ip),
      // On ne log pas l'email exact pour éviter l'énumération d'utilisateurs
      // dans les logs (timing side-channel)
      logSecurityEvent({ eventType: "login_failed", ip }),
    ]);
    return {
      // Message volontairement identique quel que soit l'erreur
      // (mauvais email ou mauvais mot de passe) — évite l'énumération
      error: "Email ou mot de passe incorrect.",
      requireTurnstile:
        turnstileEnabled && newAttempts >= turnstileThreshold,
    };
  }

  // ── 5. Succès ────────────────────────────────────────────────
  await Promise.all([
    resetRateLimit(ip),
    logAudit({ action: "login", resourceType: "session" }),
  ]);

  const destination =
    redirectTo?.startsWith("/admin") ? redirectTo : "/admin/dashboard";
  redirect(destination);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createActionClient();

  await logAudit({ action: "logout", resourceType: "session" });
  await supabase.auth.signOut();
  redirect("/login");
}
