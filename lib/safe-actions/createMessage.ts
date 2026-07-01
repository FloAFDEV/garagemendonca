"use server";

import { headers } from "next/headers";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { messageToInsert } from "@/lib/mappers/message.mapper";
import { messageDb } from "@/lib/db/message.repository";
import { parseSupabaseError, type AppError } from "@/lib/errors/supabaseErrorParser";
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimit";
import { checkSpam } from "@/lib/utils/spamDetector";
import { sendContactConfirmation } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import type { Message } from "@/types";
import type { ZodFormattedError } from "zod";

type CreateMessageResult =
  | { data: Message; error?: never }
  | { error: AppError | ZodFormattedError<MessageCreateInput>; data?: never };

// ─── Fingerprint léger (IP + User-Agent + Accept-Language) ────────────────────
// Détecte les bots qui tournent sur une IP fixe mais identifiables via UA/langue,
// et distingue les utilisateurs légitimes derrière un NAT partagé.
// Aucun secret requis — hash djb2 déterministe, résistant aux collisions courantes.
function clientFingerprint(ip: string, ua: string, lang: string): string {
  const str = `${ip}|${ua.slice(0, 120)}|${lang.slice(0, 20)}`;
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h = h | 0;
  }
  return (h >>> 0).toString(36);
}

// ─── Logging structuré des rejets ─────────────────────────────────────────────
function logRejected(reason: string, ip: string, extra?: Record<string, unknown>) {
  console.warn(
    "[contact-spam]",
    JSON.stringify({ ts: new Date().toISOString(), reason, ip, ...extra }),
  );
}

// ─── Réponse silencieuse factice ───────────────────────────────────────────────
const SILENT_REJECT: CreateMessageResult = { data: { id: "spam" } as Message };

export async function createMessageAction(
  rawInput: unknown,
): Promise<CreateMessageResult> {
  // 1. CSRF strict — en production, absence d'Origin = appel direct suspect.
  //    Les navigateurs légitimes envoient toujours Origin sur les Server Actions.
  await assertSameOrigin({ strict: true });

  // 2. Extraction IP + fingerprint
  const hdrs = await headers();
  const ip   = getClientIp(hdrs);
  const ua   = hdrs.get("user-agent")      ?? "";
  const lang = hdrs.get("accept-language") ?? "";
  const fp   = clientFingerprint(ip, ua, lang);

  // 3. Honeypot — réponse silencieuse si le champ caché est rempli
  const input = rawInput as Record<string, unknown>;
  if (typeof input?.website === "string" && input.website.length > 0) {
    logRejected("honeypot", ip);
    return SILENT_REJECT;
  }

  // 4. Rate limiting — trois fenêtres complémentaires :
  //    - Burst IP      : 3 / 10 min  → stoppe les rafales courtes
  //    - Horaire IP    : 5 / heure   → plafond global
  //    - Fingerprint   : 5 / 10 min  → bots UA/langue identiques
  const rateLimitChecks = [
    { key: `contact:burst:${ip}`,  limit: 3, windowMs: 10 * 60 * 1000, label: "rate_limit_burst"       },
    { key: `contact:hourly:${ip}`, limit: 5, windowMs: 60 * 60 * 1000, label: "rate_limit_hourly"      },
    { key: `contact:fp:${fp}`,     limit: 5, windowMs: 10 * 60 * 1000, label: "rate_limit_fingerprint" },
  ];
  for (const { key, limit, windowMs, label } of rateLimitChecks) {
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

  // 5. Validation Zod
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

  // 6. Détection spam — domaine jetable + score contenu
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
