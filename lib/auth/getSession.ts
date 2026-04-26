/**
 * Utilitaires auth côté serveur — Server Components & Server Actions.
 *
 * Utilise @supabase/ssr (createServerClient) pour lire les cookies
 * de session de manière sécurisée.
 *
 * IMPORTANT : ces fonctions sont async et doivent être appelées dans
 * des Server Components ou des Server Actions uniquement.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AppError } from "@/lib/errors/supabaseErrorParser";
import type { UserRoleEnum } from "@/lib/supabase/database.types";

// ─── Client SSR (lit les cookies de session) ──────────────────────

async function createAuthClient() {
  const cookieStore = await cookies();
  // Pas de générique Database (incompatibilité postgrest-js v12).
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

// ─────────────────────────────────────────────────────────────────
//  getSession — session Supabase Auth
// ─────────────────────────────────────────────────────────────────

export async function getSession() {
  const supabase = await createAuthClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

// ─────────────────────────────────────────────────────────────────
//  getUser — utilisateur authentifié (plus fiable que getSession)
// ─────────────────────────────────────────────────────────────────

export async function getUser() {
  const supabase = await createAuthClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─────────────────────────────────────────────────────────────────
//  getUserRole — rôle de l'utilisateur dans un garage
// ─────────────────────────────────────────────────────────────────

export async function getUserRole(garageId: string): Promise<UserRoleEnum | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createAuthClient();
  const { data } = await supabase
    .from("garage_users")
    .select("role")
    .eq("garage_id", garageId)
    .eq("user_id", user.id)
    .maybeSingle();

  return ((data as { role: UserRoleEnum } | null)?.role) ?? null;
}

// ─────────────────────────────────────────────────────────────────
//  Gardes d'autorisation — retournent AppError | null
// ─────────────────────────────────────────────────────────────────

const FORBIDDEN: AppError = { code: "FORBIDDEN", message: "Action non autorisée." };
const UNAUTHENTICATED: AppError = { code: "UNAUTHORIZED", message: "Vous devez être connecté." };

/** Vérifie que l'utilisateur est admin ou superadmin du garage. */
export async function requireAdminForGarage(garageId: string): Promise<AppError | null> {
  const user = await getUser();
  if (!user) return UNAUTHENTICATED;

  const role = await getUserRole(garageId);
  if (role !== "admin" && role !== "superadmin") return FORBIDDEN;

  return null;
}

/** Vérifie que l'utilisateur est membre (staff+) du garage. */
export async function requireMemberOfGarage(garageId: string): Promise<AppError | null> {
  const user = await getUser();
  if (!user) return UNAUTHENTICATED;

  const role = await getUserRole(garageId);
  if (!role) return FORBIDDEN;

  return null;
}

/** Vérifie que l'utilisateur est superadmin (cross-garages). */
export async function requireSuperAdmin(): Promise<AppError | null> {
  const user = await getUser();
  if (!user) return UNAUTHENTICATED;

  const supabase = await createAuthClient();
  const { data } = await supabase
    .from("garage_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "superadmin")
    .limit(1)
    .maybeSingle();

  if (!data) return FORBIDDEN;
  return null;
}
