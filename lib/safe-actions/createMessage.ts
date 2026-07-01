"use server";

import { headers } from "next/headers";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { messageToInsert } from "@/lib/mappers/message.mapper";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimit";
import { checkSpam } from "@/lib/utils/spamDetector";
import { verifyFormToken } from "@/lib/utils/formToken";
import { sendContactConfirmation } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Message } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateMessageResult =
  | { data: Message; error?: never }
  | { error: AppError | ZodFormattedError<MessageCreateInput>; data?: never };

// ─── Fingerprint léger (IP + User-Agent + Accept-Language) ────────────────────
// Permet de détecter les bots qui tournent sur une IP unique mais gardent
// le même UA/langue, et les utilisateurs légitimes qui partagent une IP NAT.
function clientFingerprint(ip: string, ua: string, lang: string): string {
  const str = `${ip}|${ua.slice(0, 120)}|${lang.slice(0, 20)}`;
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h = h | 0; // 32-bit
  }
  return (h >>> 0).toString(36);
}

// ─── Logging structuré des rejets ─────────────────────────────────────────────
function logRejected(
  reason: string,
  ip: string,
  extra?: Record<string, unknown>,
) {
  console.warn(
    "[contact-spam]",
    JSON.stringify({ ts: new Date().toISOString(), reason, ip, ...extra }),
  );
}

// ─── Réponse silencieuse factice ───────────────────────────────────────────────
// Ne jamais indiquer au bot qu'il est bloqué.
const SILENT_REJECT: CreateMessageResult = { data: { id: "spam" } as Message };

export async function createMessageAction(
  rawInput: unknown,
): Promise<CreateMessageResult> {
  // 0. CSRF strict — en production, absence d'Origin = appel direct suspect.
  //    Les navigateurs légitimes envoient toujours Origin sur les Server Actions.
  await assertSameOrigin({ strict: true });

  // 1. Extraction des headers (IP + fingerprint) — nécessaire pour les étapes suivantes
  const hdrs = await headers();
  const ip   = getClientIp(hdrs);
  const ua   = hdrs.get("user-agent")   ?? "";
  const lang = hdrs.get("accept-language") ?? "";
  const fp   = clientFingerprint(ip, ua, lang);

  // 2. Honeypot — réponse silencieuse si le champ caché est rempli
  const input = rawInput as Record<string, unknown>;
  if (typeof input?.website === "string" && input.website.length > 0) {
    logRejected("honeypot", ip);
    return SILENT_REJECT;
  }

  // 3. Rate limiting — trois fenêtres complémentaires :
  //    a. Burst par IP      : 3 / 10 min  → stoppe les rafales courtes
  //    b. Horaire par IP    : 5 / heure   → plafond global
  //    c. Par fingerprint   : 5 / 10 min  → détecte les bots UA/langue identiques
  const checks = [
    { key: `contact:burst:${ip}`,  limit: 3, windowMs: 10 * 60 * 1000,      label: "rate_limit_burst"       },
    { key: `contact:hourly:${ip}`, limit: 5, windowMs: 60 * 60 * 1000,      label: "rate_limit_hourly"      },
    { key: `contact:fp:${fp}`,     limit: 5, windowMs: 10 * 60 * 1000,      label: "rate_limit_fingerprint" },
  ];

  for (const { key, limit, windowMs, label } of checks) {
    const rl = checkRateLimit({ key, limit, windowMs });
    if (!rl.allowed) {
      logRejected(label, ip, { fp });
      return {
        error: {
          message: "Trop de messages envoyés. Réessayez dans quelques minutes.",
          code:    "RATE_LIMITED",
        },
      };
    }
  }

  // 4. Validation Zod (extrait aussi form_token du payload)
  const parsed = messageCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: {
        message: `${firstIssue?.message ?? "Données invalides"} (${firstIssue?.path.join(".") ?? "champ"})`,
        code:    "VALIDATION_ERROR",
      } satisfies import("@/lib/errors/supabaseErrorParser").AppError,
    };
  }

  // 5. Time-trap HMAC — vérifie que le token est signé par le serveur et que
  //    la soumission a eu lieu >= 3 secondes après le chargement de la page.
  //    Un bot qui remplit et soumet instantanément est rejeté ici.
  const tokenResult = await verifyFormToken(parsed.data.form_token ?? null);
  if (!tokenResult.valid) {
    logRejected(`time_trap:${tokenResult.reason}`, ip, { fp });
    if (tokenResult.reason === "too_fast" || tokenResult.reason === "invalid_sig") {
      return SILENT_REJECT;
    }
    // Token manquant ou périmé → erreur explicite (formulaire rechargé trop tard)
    if (tokenResult.reason === "expired") {
      return {
        error: {
          message: "Le formulaire a expiré. Rechargez la page et réessayez.",
          code:    "FORM_EXPIRED",
        },
      };
    }
    // Token manquant (JS désactivé, bot sans token) → rejet silencieux
    return SILENT_REJECT;
  }

  // 6. Détection spam — domaine jetable + analyse du contenu
  const spamResult = checkSpam(parsed.data.email, parsed.data.message);
  if (spamResult.blocked) {
    logRejected(spamResult.reason ?? "spam_content", ip, {
      email: parsed.data.email.replace(/^(.{2}).*@(.*)$/, "$1***@$2"),
      score: spamResult.score,
    });
    return SILENT_REJECT;
  }

  // 7. Insert DB
  const row = messageToInsert(parsed.data);
  let message: Message;
  try {
    message = await messageDb.create(row);
  } catch (err) {
    return { error: parseSupabaseError(err) };
  }

  // 8. Notification garage via Edge Function (fire-and-forget)
  void invokeNotifyFunction(message.id).catch((err) =>
    console.error("[createMessage] notify-vehicle-message failed:", err),
  );

  // 9. Confirmation client — uniquement après insertion réussie (anti-amplification)
  void sendContactConfirmation({
    to:        parsed.data.email,
    firstname: parsed.data.firstname,
    subject:   parsed.data.subject,
  }).catch(console.error);

  return { data: message };
}

// ─── Edge Function invocation ──────────────────────────────────────────────────

async function invokeNotifyFunction(messageId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.functions.invoke("notify-vehicle-message", {
    body: { message_id: messageId },
  });
  if (error) throw new Error(`Edge Function error: ${error.message}`);
}
