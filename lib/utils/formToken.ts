import "server-only";

/**
 * Time-trap HMAC — protection anti-bot locale, sans service externe.
 *
 * Fonctionnement :
 *   1. Le Server Component génère un token signé avec le timestamp courant.
 *   2. Le client reçoit le token via props et l'inclut dans la soumission.
 *   3. La Server Action vérifie la signature + l'écart de temps (>= 3 s).
 *
 * Un bot qui remplit et soumet le formulaire instantanément ne peut pas
 * produire un token valide sans connaître FORM_SIGNING_SECRET, et même
 * avec un token volé, l'écart de temps minimal rejette les soumissions < 3 s.
 *
 * Variable d'environnement requise en production : FORM_SIGNING_SECRET
 * (chaîne aléatoire ≥ 32 caractères, ex: `openssl rand -base64 32`)
 */

const MIN_ELAPSED_MS = 3_000;          // soumission minimum 3 s après chargement
const MAX_ELAPSED_MS = 2 * 3_600_000;  // token périmé après 2 h

// Fallback dev uniquement — en prod, une clé manquante émet un warning
// et valide quand même (les autres couches compensent), mais ne génère
// pas de fausse sécurité (la signature serait reproductible).
const DEV_SECRET = "dev-form-signing-secret--ne-pas-utiliser-en-production";

function getSecret(): string {
  const s = process.env.FORM_SIGNING_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    console.warn(
      "[formToken] FORM_SIGNING_SECRET manquante — la protection time-trap est dégradée.",
    );
  }
  return s ?? DEV_SECRET;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Génère un token `{timestamp}.{hmac}` à inclure dans le formulaire. */
export async function generateFormToken(): Promise<string> {
  const ts  = Date.now().toString();
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ts));
  return `${ts}.${Buffer.from(sig).toString("base64url")}`;
}

export type TokenVerifyResult =
  | { valid: true;  elapsedMs: number }
  | { valid: false; reason: "missing" | "malformed" | "invalid_sig" | "too_fast" | "expired" };

/** Vérifie un token reçu dans le payload du formulaire. */
export async function verifyFormToken(
  token: string | null | undefined,
): Promise<TokenVerifyResult> {
  if (!token) return { valid: false, reason: "missing" };

  const dot = token.indexOf(".");
  if (dot === -1) return { valid: false, reason: "malformed" };

  const tsStr = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  const ts = Number(tsStr);
  if (!Number.isFinite(ts) || !sigB64) return { valid: false, reason: "malformed" };

  let sigValid: boolean;
  try {
    const key = await importKey(getSecret());
    sigValid = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(sigB64, "base64url"),
      new TextEncoder().encode(tsStr),
    );
  } catch {
    return { valid: false, reason: "invalid_sig" };
  }

  if (!sigValid) return { valid: false, reason: "invalid_sig" };

  const elapsed = Date.now() - ts;
  if (elapsed < MIN_ELAPSED_MS) return { valid: false, reason: "too_fast" };
  if (elapsed > MAX_ELAPSED_MS) return { valid: false, reason: "expired" };

  return { valid: true, elapsedMs: elapsed };
}
