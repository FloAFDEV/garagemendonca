"use server";

import { headers } from "next/headers";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { messageToInsert } from "@/lib/mappers/message.mapper";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimit";
import { checkSpam } from "@/lib/utils/spamDetector";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";
import { sendContactConfirmation } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Message } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateMessageResult =
  | { data: Message; error?: never }
  | { error: AppError | ZodFormattedError<MessageCreateInput>; data?: never };

// ─── Logging structuré des rejets anti-spam ────────────────────────────────────
function logRejected(
  reason: string,
  ip: string,
  extra?: Record<string, unknown>,
) {
  console.warn(
    "[contact-spam]",
    JSON.stringify({
      ts:     new Date().toISOString(),
      reason,
      ip,
      ...extra,
    }),
  );
}

export async function createMessageAction(
  rawInput: unknown,
): Promise<CreateMessageResult> {
  // 0. Vérification d'origine — même mécanisme que les Server Actions admin.
  //    Placée en tête : une requête cross-origin est rejetée avant tout traitement.
  await assertSameOrigin();

  // 1. Extraction IP tôt (nécessaire pour les logs et le rate limit)
  const hdrs = await headers();
  const ip   = getClientIp(hdrs);

  // 2. Honeypot anti-spam
  //    Retourne un succès factice pour ne pas alerter le bot.
  const input = rawInput as Record<string, unknown>;
  if (typeof input?.website === "string" && input.website.length > 0) {
    logRejected("honeypot", ip);
    return { data: { id: "spam" } as Message };
  }

  // 3. Rate limiting — deux fenêtres complémentaires :
  //    - Burst  : 3 messages / 10 min   → stoppe les rafales courtes
  //    - Horaire: 5 messages / heure    → plafond global par IP
  const burstRl = checkRateLimit({
    key:      `contact:burst:${ip}`,
    limit:    3,
    windowMs: 10 * 60 * 1000,
  });
  if (!burstRl.allowed) {
    logRejected("rate_limit_burst", ip);
    return {
      error: {
        message: "Trop de messages envoyés. Réessayez dans quelques minutes.",
        code:    "RATE_LIMITED",
      },
    };
  }

  const hourlyRl = checkRateLimit({
    key:      `contact:hourly:${ip}`,
    limit:    5,
    windowMs: 60 * 60 * 1000,
  });
  if (!hourlyRl.allowed) {
    logRejected("rate_limit_hourly", ip);
    return {
      error: {
        message: "Trop de messages envoyés. Réessayez dans une heure.",
        code:    "RATE_LIMITED",
      },
    };
  }

  // 4. Validation Zod (extrait aussi cf_turnstile_token du payload)
  const parsed = messageCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const fieldLabel  = firstIssue?.path.join(".") ?? "champ";
    const humanMsg    = firstIssue?.message ?? "Données invalides";
    return {
      error: {
        message: `${humanMsg} (${fieldLabel})`,
        code:    "VALIDATION_ERROR",
      } satisfies import("@/lib/errors/supabaseErrorParser").AppError,
    };
  }

  // 5. Vérification Cloudflare Turnstile côté serveur
  const turnstileResult = await verifyTurnstileToken(
    parsed.data.cf_turnstile_token ?? null,
    ip,
  );
  if (!turnstileResult.success) {
    logRejected("captcha_fail", ip, {
      errorCodes: turnstileResult.errorCodes,
    });
    return {
      error: {
        message: "Vérification de sécurité échouée. Rechargez la page et réessayez.",
        code:    "CAPTCHA_FAILED",
      },
    };
  }

  // 6. Détection spam — domaine jetable + analyse du contenu
  const spamResult = checkSpam(parsed.data.email, parsed.data.message);
  if (spamResult.blocked) {
    logRejected(spamResult.reason ?? "spam_content", ip, {
      email: parsed.data.email.replace(/^(.{2}).*@(.*)$/, "$1***@$2"),
      score: spamResult.score,
    });
    // Réponse silencieuse : ne pas indiquer au bot qu'il est bloqué
    return { data: { id: "spam" } as Message };
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
  //    L'Edge Function enrichit l'email avec les données véhicule depuis la DB
  //    et génère le lien direct /admin/messages?id={id}.
  void invokeNotifyFunction(message.id).catch((err) =>
    console.error("[createMessage] notify-vehicle-message failed:", err),
  );

  // 9. Confirmation au client (email simple, pas d'accès DB requis).
  //    Invariant anti-amplification : ce point n'est atteint qu'après une
  //    insertion réussie. Toute soumission rejetée sort en amont sans envoyer d'email.
  void sendContactConfirmation({
    to:        parsed.data.email,
    firstname: parsed.data.firstname,
    subject:   parsed.data.subject,
  }).catch(console.error);

  return { data: message };
}

// ─── Edge Function invocation ─────────────────────────────────────────────────

async function invokeNotifyFunction(messageId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.functions.invoke("notify-vehicle-message", {
    body: { message_id: messageId },
  });

  if (error) {
    throw new Error(`Edge Function error: ${error.message}`);
  }
}
