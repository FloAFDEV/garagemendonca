/**
 * Module email — Resend API via fetch (pas de dépendance npm supplémentaire).
 * Configurer RESEND_API_KEY et RESEND_FROM dans les variables d'environnement.
 *
 * RESEND_API_KEY=re_xxxx
 * RESEND_FROM=Garage Mendonça <contact@garagemendonca.com>
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM       = process.env.RESEND_FROM ?? "Garage Mendonça <contact@garagemendonca.com>";

/** Échappe les caractères HTML spéciaux pour prévenir toute injection dans les emails. */
function escHtml(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#x27;");
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY non configuré — email ignoré");
    return;
  }

  const res = await fetch(RESEND_API, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from:     FROM,
      to:       [opts.to],
      subject:  opts.subject,
      html:     opts.html,
      text:     opts.text,
      reply_to: opts.replyTo,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
  }
}

// ─── Email de confirmation au client ──────────────────────────────

export async function sendContactConfirmation(opts: {
  to: string;
  firstname: string;
  subject?: string;
}): Promise<void> {
  const name    = escHtml(opts.firstname);
  const subject = escHtml(opts.subject);
  const subjectLine = subject ? ` concernant « ${subject} »` : "";

  await sendEmail({
    to:      opts.to,
    subject: "Nous avons bien reçu votre message — Garage Mendonça",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">Bonjour ${name},</h2>
        <p>Nous avons bien reçu votre message${subjectLine}.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>Si votre demande est urgente, n'hésitez pas à nous appeler directement :</p>
        <p><a href="tel:0532002038" style="color:#2563eb;font-weight:bold">05 32 00 20 38</a></p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#64748b;font-size:14px">
          Garage Mendonça — 6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage
        </p>
      </div>
    `,
    text: [
      `Bonjour ${opts.firstname},`,
      "",
      `Nous avons bien reçu votre message${opts.subject ? ` concernant « ${opts.subject} »` : ""}.`,
      "Notre équipe vous répondra dans les plus brefs délais.",
      "",
      "Si votre demande est urgente, appelez-nous directement : 05 32 00 20 38",
      "",
      "Garage Mendonça — 6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage",
    ].join("\n"),
  });
}

// ─── Notification au garage (nouveau lead) ────────────────────────

export async function sendNewLeadNotification(opts: {
  garageEmail: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  vehicleLabel?: string;
  adminUrl: string;
}): Promise<void> {
  const { garageEmail, firstname, lastname, email, phone, subject, message, vehicleLabel, adminUrl } = opts;

  const rows = [
    `<tr><td style="padding:8px 0;color:#64748b;width:120px">Prénom</td><td style="padding:8px 0;font-weight:600">${escHtml(firstname)}</td></tr>`,
    `<tr><td style="padding:8px 0;color:#64748b">Nom</td><td style="padding:8px 0;font-weight:600">${escHtml(lastname)}</td></tr>`,
    `<tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0"><a href="mailto:${escHtml(email)}" style="color:#2563eb">${escHtml(email)}</a></td></tr>`,
    phone        ? `<tr><td style="padding:8px 0;color:#64748b">Téléphone</td><td style="padding:8px 0"><a href="tel:${escHtml(phone)}" style="color:#2563eb">${escHtml(phone)}</a></td></tr>` : "",
    subject      ? `<tr><td style="padding:8px 0;color:#64748b">Sujet</td><td style="padding:8px 0">${escHtml(subject)}</td></tr>` : "",
    vehicleLabel ? `<tr><td style="padding:8px 0;color:#64748b">Véhicule</td><td style="padding:8px 0">${escHtml(vehicleLabel)}</td></tr>` : "",
  ].filter(Boolean).join("\n");

  const textLines = [
    `Nouveau message de contact`,
    ``,
    `Prénom   : ${firstname}`,
    `Nom      : ${lastname}`,
    `Email    : ${email}`,
    phone        ? `Téléphone: ${phone}` : "",
    subject      ? `Sujet    : ${subject}` : "",
    vehicleLabel ? `Véhicule : ${vehicleLabel}` : "",
    ``,
    `Message :`,
    message,
    ``,
    `Voir dans l'admin : ${adminUrl}`,
  ].filter((l) => l !== undefined).join("\n");

  await sendEmail({
    to:      garageEmail,
    subject: `Nouveau message de ${firstname} ${lastname}${subject ? ` — ${subject}` : ""}`,
    replyTo: email,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">Nouveau message de contact</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${rows}
        </table>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;white-space:pre-wrap">${escHtml(message)}</p>
        </div>
        <a href="${escHtml(adminUrl)}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
          Voir dans l'admin →
        </a>
      </div>
    `,
    text: textLines,
  });
}

// ─── Réponse admin envoyée au client ─────────────────────────────

export async function sendAdminReply(opts: {
  to: string;
  clientFirstname: string;
  originalSubject?: string;
  replyContent: string;
  garageEmail: string;
}): Promise<void> {
  const { to, clientFirstname, originalSubject, replyContent, garageEmail } = opts;
  const name    = escHtml(clientFirstname);
  const content = escHtml(replyContent);

  await sendEmail({
    to,
    subject: `Re: ${originalSubject ?? "Votre message"} — Garage Mendonça`,
    replyTo: garageEmail,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">Bonjour ${name},</h2>
        <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px;margin:16px 0;border-radius:0 8px 8px 0">
          <p style="margin:0;white-space:pre-wrap">${content}</p>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#64748b;font-size:14px">
          Garage Mendonça — <a href="tel:0532002038" style="color:#2563eb">05 32 00 20 38</a><br/>
          6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage
        </p>
      </div>
    `,
    text: [
      `Bonjour ${clientFirstname},`,
      "",
      replyContent,
      "",
      "---",
      "Garage Mendonça — 05 32 00 20 38",
      "6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage",
    ].join("\n"),
  });
}
