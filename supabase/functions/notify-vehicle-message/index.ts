/**
 * Edge Function : notify-vehicle-message
 * ─────────────────────────────────────────────────────────────────────────────
 * Déclenché par createMessageAction (Next.js Server Action) après insertion
 * d'un message en DB. Envoie une notification email au garage via Resend.
 *
 * Avantages par rapport à l'envoi direct depuis Next.js :
 *  - Accès à la DB Supabase pour enrichir l'email (infos véhicule, garage)
 *  - Découplé du cycle de requête Next.js (fire-and-forget fiable)
 *  - Retry possible côté Supabase si Resend est temporairement indisponible
 *  - Lien direct vers le message admin (/admin/messages?id={id})
 *
 * Invocation (depuis Server Action) :
 *   const admin = createSupabaseAdminClient();
 *   await admin.functions.invoke("notify-vehicle-message", {
 *     body: { message_id: "uuid" },
 *   });
 *
 * Variables d'environnement requises (Supabase Dashboard → Edge Functions) :
 *   RESEND_API_KEY      — clé API Resend
 *   RESEND_FROM         — expéditeur, ex: "Garage Mendonça <contact@garagemendonca.com>"
 *   GARAGE_EMAIL        — destinataire notification (si absent, lu depuis garages.email)
 *   NEXT_PUBLIC_BASE_URL — base URL admin, ex: https://www.garagemendonca.com
 *
 * Variables auto-injectées par Supabase (ne pas configurer manuellement) :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API = "https://api.resend.com/emails";

// ─── Helpers ────────────────────────────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;width:130px;vertical-align:top;font-size:14px">${label}</td>
      <td style="padding:8px 0;font-weight:600;font-size:14px">${escHtml(value)}</td>
    </tr>`;
}

function buildEmailHtml(opts: {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  vehicleLabel?: string | null;
  vehiclePrice?: number | null;
  adminUrl: string;
}): string {
  const {
    firstname, lastname, email, phone,
    subject, message, vehicleLabel, vehiclePrice, adminUrl,
  } = opts;

  const priceLabel = vehiclePrice
    ? new Intl.NumberFormat("fr-FR").format(vehiclePrice) + " €"
    : null;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

        <!-- Header -->
        <div style="background:#0f172a;padding:28px 32px;display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:#c8102e;border-radius:8px;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-weight:800;font-size:14px">GM</span>
          </div>
          <div>
            <div style="color:white;font-weight:700;font-size:16px">Nouveau message de contact</div>
            <div style="color:#94a3b8;font-size:13px">Garage Auto Mendonça</div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:32px">

          ${vehicleLabel ? `
          <!-- Vehicle context -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <div style="font-size:12px;color:#0369a1;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🚗 Véhicule concerné</div>
            <div style="font-weight:700;color:#0f172a;font-size:15px">${escHtml(vehicleLabel)}${priceLabel ? ` — <span style="color:#c8102e">${escHtml(priceLabel)}</span>` : ""}</div>
          </div>` : ""}

          <!-- Contact info -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            ${row("Prénom", firstname)}
            ${row("Nom", lastname)}
            <tr>
              <td style="padding:8px 0;color:#64748b;width:130px;font-size:14px">Email</td>
              <td style="padding:8px 0;font-size:14px">
                <a href="mailto:${escHtml(email)}" style="color:#2563eb;font-weight:600">${escHtml(email)}</a>
              </td>
            </tr>
            ${phone ? `<tr>
              <td style="padding:8px 0;color:#64748b;font-size:14px">Téléphone</td>
              <td style="padding:8px 0;font-size:14px">
                <a href="tel:${escHtml(phone)}" style="color:#2563eb;font-weight:600">${escHtml(phone)}</a>
              </td>
            </tr>` : ""}
            ${row("Sujet", subject)}
          </table>

          <!-- Message -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:28px">
            <div style="font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Message</div>
            <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap">${escHtml(message)}</p>
          </div>

          <!-- CTA -->
          <a href="${escHtml(adminUrl)}"
             style="display:inline-block;background:#c8102e;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.2px">
            Voir le message dans l'admin →
          </a>

          <p style="margin-top:24px;font-size:12px;color:#94a3b8">
            Ce message a été envoyé via le formulaire de contact du site garagemendonca.com.
            Répondez directement à cet email pour contacter ${escHtml(firstname)}.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center">
          <p style="margin:0;color:#94a3b8;font-size:12px">
            Garage Auto Mendonça · 6 Avenue de la Mouyssaguese · 31280 Drémil-Lafage<br/>
            <a href="tel:0532002038" style="color:#64748b">05 32 00 20 38</a>
          </p>
        </div>
      </div>
    </body>
    </html>`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const { message_id } = await req.json() as { message_id: string };
    if (!message_id) {
      return new Response(JSON.stringify({ error: "message_id requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Init Supabase (service role — auto-injecté par Supabase) ──────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Fetch message + vehicle join ──────────────────────────────────────────
    const { data: message, error: msgErr } = await supabase
      .from("messages")
      .select("*, vehicles(brand, model, year, price)")
      .eq("id", message_id)
      .single();

    if (msgErr || !message) {
      console.error("[notify-vehicle-message] Message non trouvé:", message_id, msgErr);
      return new Response(JSON.stringify({ error: "Message non trouvé" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Fetch garage email (si non défini dans les env vars) ─────────────────
    let garageEmail: string | null = Deno.env.get("GARAGE_EMAIL") ?? null;
    if (!garageEmail && message.garage_id) {
      const { data: garage } = await supabase
        .from("garages")
        .select("email")
        .eq("id", message.garage_id)
        .single();
      garageEmail = garage?.email ?? null;
    }

    if (!garageEmail) {
      console.warn("[notify-vehicle-message] Aucune adresse email garage — notification ignorée");
      return new Response(JSON.stringify({ ok: true, skipped: "no_garage_email" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Données véhicule ─────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicle = (message as any).vehicles as {
      brand: string; model: string; year: number; price: number;
    } | null;

    const vehicleLabel = vehicle
      ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
      : null;

    // ── Envoi email Resend ────────────────────────────────────────────────────
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("[notify-vehicle-message] RESEND_API_KEY non configuré");
      return new Response(JSON.stringify({ ok: true, skipped: "no_resend_key" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const FROM = Deno.env.get("RESEND_FROM") ?? "Garage Mendonça <contact@garagemendonca.com>";
    const BASE_URL = Deno.env.get("NEXT_PUBLIC_BASE_URL") ?? "https://www.garagemendonca.com";
    const adminUrl = `${BASE_URL}/admin/messages?id=${message_id}`;

    const subject = [
      "Nouveau message",
      message.firstname ? `de ${message.firstname} ${message.lastname}` : null,
      vehicleLabel ? `— ${vehicleLabel}` : null,
    ].filter(Boolean).join(" ");

    const emailRes = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:     FROM,
        to:       [garageEmail],
        subject,
        reply_to: message.email,
        html:     buildEmailHtml({
          firstname:    message.firstname || message.name?.split(" ")[0] || "",
          lastname:     message.lastname  || message.name?.split(" ").slice(1).join(" ") || "",
          email:        message.email,
          phone:        message.phone,
          subject:      message.subject,
          message:      message.message,
          vehicleLabel,
          vehiclePrice: vehicle?.price ?? null,
          adminUrl,
        }),
      }),
    });

    if (!emailRes.ok) {
      const body = await emailRes.text();
      console.error("[notify-vehicle-message] Resend error:", emailRes.status, body);
      return new Response(JSON.stringify({ error: "Resend error", detail: body }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("[notify-vehicle-message] Email envoyé à", garageEmail, "pour message", message_id);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[notify-vehicle-message] Erreur inattendue:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
