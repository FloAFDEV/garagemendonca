/**
 * Anti-spam detector — trois couches :
 *   1. Blocklist de domaines email jetables connus
 *   2. Score de contenu (liens, patterns, caps)
 *   3. Patterns de spam déterministes
 */

// ─── Domaines jetables / temporaires ──────────────────────────────────────────
// Liste étendue couvrant les services les plus courants signalés en spam.
const DISPOSABLE_DOMAINS = new Set([
  // Signalé dans ce projet
  "jmailservice.com",
  "mailservice.com",
  // Services temporaires connus
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "throwaway.email",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "spam4.me",
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "trashmail.io",
  "maildrop.cc",
  "dispostable.com",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "mintemail.com",
  "filzmail.com",
  "spamfree24.org",
  "discard.email",
  "fakeinbox.com",
  "mailnull.com",
  "spambox.us",
  "throwam.com",
  "emkei.cz",
  "getairmail.com",
  "mailexpire.com",
  "spamhole.com",
  "temporaryemail.net",
  "mailin8r.com",
  "mailnew.com",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "tempinbox.com",
  "spamavert.com",
  "spambox.info",
  "spamfree.eu",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "20minutemail.com",
  "mailnesia.com",
  "mailnull.com",
  "spamgourmet.com",
  "trashmail.at",
  "objectmail.com",
  "spamfree.eu",
  "spamgourmet.com",
  "e4ward.com",
  "mailme.lv",
  "sogetthis.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spamspot.com",
  "spamthis.co.uk",
  "spamthisplease.com",
  "spamtrap.ro",
  "superrito.com",
  "tempalias.com",
  "tempinbox.co.uk",
  "tempomail.fr",
  "thankyou2010.com",
  "throwam.com",
  "trash-me.com",
  "trashdevil.com",
  "trashdevil.de",
  "trashemail.de",
  "trashimail.de",
  "trashmail.at",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "trashmailer.com",
  "trashymail.com",
  "tyldd.com",
  "uggsrock.com",
  "veryrealemail.com",
  "webemail.me",
  "webm4il.info",
  "weg-werf-email.de",
  "wegwerf-emails.de",
  "wegwerfadresse.de",
  "wegwerfemail.de",
  "wegwerfmail.de",
  "wegwerfmail.info",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "wh4f.org",
  "whopy.com",
  "willhackforfood.biz",
  "wilemail.com",
  "winemaven.info",
  "wronghead.com",
  "wuzup.net",
  "wuzupmail.net",
  "xoxy.net",
  "yep.it",
  "yogamaven.com",
  "yopmail.com",
  "yopmail.fr",
  "yourdomain.com",
  "yuurok.com",
  "z1p.biz",
  "za.com",
  "zehnminuten.de",
  "zehnminutenmail.de",
  "zoemail.net",
  "zomg.info",
  "binkmail.com",
  "bobmail.info",
  "chammy.info",
  "devnullmail.com",
  "divermail.com",
  "dummail.com",
  "eatmydirt.com",
  "fakedemail.com",
  "fakemail.fr",
  "fakemailz.com",
  "fastacura.com",
  "fastchevy.com",
  "fastchrysler.com",
  "fastkawasaki.com",
  "fastmazda.com",
  "fastmitsubishi.com",
  "fastnissan.com",
  "fastsubaru.com",
  "fastsuzuki.com",
  "fasttoyota.com",
  "fastyamaha.com",
]);

// ─── Patterns de contenu spam ──────────────────────────────────────────────────
const SPAM_PATTERNS = [
  // Publicité / offres suspectes
  /\b(viagra|cialis|casino|lottery|prize|winner|free\s*money|click\s*here|buy\s*now|limited\s*time|act\s*now)\b/i,
  // Crypto / investissement
  /\b(cryptocurrency|bitcoin|ethereum|investment\s*opportunity|earn\s*money|make\s*money\s*fast|passive\s*income)\b/i,
  // Montants suspects
  /\$\s*\d[\d,.]*\s*(million|billion|thousand)\b/i,
  // SEO spam typique
  /\b(backlink|seo\s*service|rank\s*(higher|#1)|guest\s*post|link\s*building)\b/i,
  // Escroqueries
  /\b(nigerian|inheritance|transfer\s*funds|unclaimed\s*funds|secret\s*shopper)\b/i,
];

// ─── Types ─────────────────────────────────────────────────────────────────────
export type SpamReason =
  | "disposable_domain"
  | "spam_content"
  | "too_many_links"
  | "suspicious_pattern";

export interface SpamCheckResult {
  blocked: boolean;
  reason?: SpamReason;
  score: number; // 0–100
}

// ─── Vérification domaine ──────────────────────────────────────────────────────
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return true;
  // Match exact ou sous-domaine
  return DISPOSABLE_DOMAINS.has(domain) ||
    [...DISPOSABLE_DOMAINS].some(d => domain.endsWith(`.${d}`));
}

// ─── Score contenu ─────────────────────────────────────────────────────────────
export function scoreContent(
  message: string,
): { score: number; reason?: SpamReason } {
  let score = 0;

  // Compter les URLs
  const urls = message.match(/https?:\/\/\S+/gi) ?? [];
  if (urls.length >= 3) return { score: 95, reason: "too_many_links" };
  if (urls.length === 2) score += 45;
  else if (urls.length === 1) score += 20;

  // Patterns spam déterministes
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(message)) {
      return { score: 90, reason: "suspicious_pattern" };
    }
  }

  // Ratio majuscules excessif (hors messages très courts)
  if (message.length > 30) {
    const upper = (message.match(/[A-Z]/g) ?? []).length;
    const alpha = (message.match(/[a-zA-Z]/g) ?? []).length;
    if (alpha > 0 && upper / alpha > 0.6) score += 35;
  }

  // Répétitions de caractères (aaaaaa, !!!!!!!)
  if (/(.)\1{6,}/.test(message)) score += 25;

  // Mots en majuscules répétés (CLICK CLICK CLICK)
  if (/(\b[A-Z]{4,}\b.*){3,}/.test(message)) score += 30;

  return { score: Math.min(score, 100) };
}

// ─── Point d'entrée principal ──────────────────────────────────────────────────
export function checkSpam(email: string, message: string): SpamCheckResult {
  if (isDisposableEmail(email)) {
    return { blocked: true, reason: "disposable_domain", score: 100 };
  }

  const { score, reason } = scoreContent(message);
  if (score >= 70) {
    return { blocked: true, reason: reason ?? "spam_content", score };
  }

  return { blocked: false, score };
}
