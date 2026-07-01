import "server-only";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Vérifie un token Cloudflare Turnstile côté serveur.
 *
 * - Si CLOUDFLARE_TURNSTILE_SECRET_KEY n'est pas configurée (env de dev),
 *   la vérification est ignorée (fail-open local uniquement).
 * - En production, un token absent ou invalide est toujours rejeté.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  ip?: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Développement sans clé configurée → skip
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      // En prod sans clé : rejeter par défaut (misconfiguration)
      console.error("[turnstile] CLOUDFLARE_TURNSTILE_SECRET_KEY non configurée en production");
      return { success: false, errorCodes: ["secret-key-missing"] };
    }
    return { success: true };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const body: Record<string, string> = {
      secret:   secretKey,
      response: token,
    };
    if (ip) body.remoteip = ip;

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      },
    );

    if (!res.ok) {
      console.error("[turnstile] siteverify HTTP error:", res.status);
      return { success: false, errorCodes: ["internal-error"] };
    }

    const data = (await res.json()) as TurnstileResponse;
    return {
      success:    data.success,
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("[turnstile] verification failed:", err);
    // Fail-open réseau (Cloudflare indisponible) → on laisse passer
    // mais on log pour alerter. Les autres couches (honeypot, rate limit,
    // spam detector) continuent de filtrer.
    return { success: true };
  }
}
