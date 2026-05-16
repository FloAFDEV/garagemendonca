/**
 * Préparation MFA / 2FA — Supabase TOTP
 * ══════════════════════════════════════
 *
 * Ce fichier prépare la structure pour activer le MFA sans refactor futur.
 * L'activation complète nécessite d'activer MFA dans le dashboard Supabase
 * (Authentication → Security → Multi-Factor Authentication).
 *
 * ── Flow complet ────────────────────────────────────────────────────────
 *
 *  1. Enrôlement (une seule fois par utilisateur) :
 *     - Appeler `enrollTotp()` → retourne { qrCode, secret, factorId }
 *     - Afficher le QR code à l'utilisateur (Google Authenticator, Authy…)
 *     - Vérifier avec `verifyTotpEnrollment(factorId, code)` pour activer
 *
 *  2. Connexion avec MFA actif :
 *     - L'utilisateur se connecte normalement (signInWithPassword)
 *     - Supabase retourne un access_token avec AAL1 (Assurance Level 1)
 *     - Appeler `challengeTotp()` → retourne { challengeId }
 *     - L'utilisateur saisit son code 6 chiffres
 *     - Appeler `verifyTotpChallenge(factorId, challengeId, code)`
 *     - Supabase émet un nouveau token AAL2 (niveau de confiance élevé)
 *
 *  3. Vérification du niveau d'assurance (dans middleware ou layout) :
 *     - Appeler `getMfaLevel()` → 'aal1' | 'aal2' | null
 *     - Si l'utilisateur a des facteurs MFA et est seulement aal1 :
 *       redirecter vers /admin/mfa-verify
 *
 * ── Variables d'environnement requises ──────────────────────────────────
 *  Aucune — Supabase gère tout côté serveur.
 *  Activer MFA dans : Supabase Dashboard → Authentication → Security
 *
 * ── Pages à créer pour activer le MFA ──────────────────────────────────
 *  - app/admin/mfa-setup/page.tsx   → enrôlement TOTP
 *  - app/admin/mfa-verify/page.tsx  → saisie du code au login
 *
 * ── Intégration dans le middleware ──────────────────────────────────────
 *  Pour forcer MFA sur les routes admin, ajouter dans middleware.ts :
 *
 *    const { data: { authenticatorAssuranceLevel } } =
 *      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
 *
 *    if (
 *      pathname.startsWith('/admin') &&
 *      authenticatorAssuranceLevel?.currentLevel === 'aal1' &&
 *      authenticatorAssuranceLevel?.nextLevel === 'aal2' &&
 *      pathname !== '/admin/mfa-verify'
 *    ) {
 *      return NextResponse.redirect(new URL('/admin/mfa-verify', request.url))
 *    }
 */

"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createMfaClient() {
  const cookieStore = await cookies();
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

export type MfaLevel = "aal1" | "aal2" | null;

/** Retourne le niveau d'assurance MFA de la session courante. */
export async function getMfaLevel(): Promise<MfaLevel> {
  const supabase = await createMfaClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return null;
  return data.currentLevel as MfaLevel;
}

/** Vérifie si l'utilisateur a un facteur MFA enregistré et qu'une vérification est requise. */
export async function isMfaRequired(): Promise<boolean> {
  const supabase = await createMfaClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
}

/** Lance l'enrôlement TOTP. Retourne le QR code SVG et le secret. */
export async function enrollTotp(): Promise<{
  factorId: string;
  qrCode: string;
  secret: string;
} | { error: string }> {
  const supabase = await createMfaClient();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });

  if (error || !data) {
    return { error: error?.message ?? "Erreur d'enrôlement MFA." };
  }

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

/** Vérifie le code TOTP saisi lors de l'enrôlement pour activer le facteur. */
export async function verifyTotpEnrollment(
  factorId: string,
  code: string,
): Promise<{ error?: string }> {
  const supabase = await createMfaClient();

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: challengeError.message };

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  return error ? { error: error.message } : {};
}

/** Crée un challenge MFA pour un facteur existant. */
export async function challengeTotp(
  factorId: string,
): Promise<{ challengeId: string } | { error: string }> {
  const supabase = await createMfaClient();
  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error || !data) {
    return { error: error?.message ?? "Impossible de créer le challenge MFA." };
  }

  return { challengeId: data.id };
}

/** Vérifie le code TOTP lors de la connexion pour élever à AAL2. */
export async function verifyTotpChallenge(
  factorId: string,
  challengeId: string,
  code: string,
): Promise<{ error?: string }> {
  const supabase = await createMfaClient();
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
  return error ? { error: error.message } : {};
}

/** Liste les facteurs MFA enregistrés pour l'utilisateur courant. */
export async function listMfaFactors() {
  const supabase = await createMfaClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return [];
  return data?.totp ?? [];
}

/** Supprime un facteur MFA (unenroll). */
export async function unenrollFactor(
  factorId: string,
): Promise<{ error?: string }> {
  const supabase = await createMfaClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return error ? { error: error.message } : {};
}
