/**
 * lib/analytics/trackEvent.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Couche d'abstraction pour tous les événements analytics.
 *
 * Pourquoi centraliser ici plutôt qu'appeler gtag() directement ?
 *  - Découplage provider : changer GTM → Plausible → Mixpanel = 1 fichier
 *  - Consent centralisé : si gtag n'existe pas, l'utilisateur n'a pas consenti
 *  - Debug dev : logs automatiques + window.__analyticsEvents en local
 *  - Typage : les événements métier sont typés, pas des strings libres
 *  - Testabilité : mock facile dans les tests
 *
 * Usage :
 *   import { trackEvent } from "@/lib/analytics/trackEvent";
 *   trackEvent("contact_click", { source: "hero" });
 *   trackEvent("vehicle_view", { brand: "Toyota", model: "Yaris" });
 *
 * Consent-aware Server Components (pattern futur) :
 *   Lire le cookie `cookieConsent` côté serveur pour décider d'inclure
 *   certains embeds (vidéos YouTube, Google Maps, widgets chat).
 *   Exemple dans un Server Component :
 *
 *   import { cookies } from "next/headers";
 *   const cookieStore = await cookies();
 *   const raw = cookieStore.get("cookieConsent")?.value;
 *   const consent = raw ? JSON.parse(decodeURIComponent(raw)) : null;
 *   if (consent?.marketing) { <YoutubeEmbed /> } else { <VideoPlaceholder /> }
 */

// ─── Types événements métier ──────────────────────────────────────────────────

/** Catalogue des événements. Étendre ici pour ajouter de nouveaux events. */
export type AnalyticsEventName =
  // Navigation & engagement
  | "page_view"
  | "scroll_depth"
  | "outbound_click"
  // Véhicules
  | "vehicle_view"
  | "vehicle_gallery_open"
  | "vehicle_filter_apply"
  | "vehicle_contact_click"
  // Leads / conversion
  | "contact_form_start"
  | "contact_form_submit"
  | "phone_click"
  | "email_click"
  | "map_click"
  // Cookies / consentement (à exclure de GA pour éviter la circularité)
  // Ne PAS tracker les events consent via gtag → biais de mesure
  ;

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Envoie un événement analytics.
 *
 * Comportement :
 *  - Si gtag n'est pas disponible (pas de consentement ou GTM/GA non chargé)
 *    → silencieux en prod, log en dev
 *  - Si NODE_ENV = development → log + stockage dans window.__analyticsEvents
 *  - Toujours sûr à appeler même sans consentement (no-op)
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  params?: AnalyticsEventParams,
): void {
  if (typeof window === "undefined") return; // SSR safe

  if (process.env.NODE_ENV === "development") {
    // Dev : logger systématiquement, même sans gtag
    const logEntry = { event: eventName, params: params ?? {}, ts: Date.now() };
    console.log(`[Analytics] %c${eventName}`, "color:#c8102e;font-weight:bold;", params ?? {});

    // Historique accessible depuis la DevTools console : window.__analyticsEvents
    const win = window as typeof window & { __analyticsEvents?: typeof logEntry[] };
    win.__analyticsEvents = win.__analyticsEvents ?? [];
    win.__analyticsEvents.push(logEntry);
  }

  // gtag non disponible = scripts non chargés = pas de consentement analytics
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params);
}

// ─── Helpers sémantiques ──────────────────────────────────────────────────────

/**
 * Tracker un clic téléphone.
 * À appeler sur les liens tel: dans les composants.
 */
export function trackPhoneClick(source: string): void {
  trackEvent("phone_click", { source });
}

/**
 * Tracker une vue véhicule (fiche détail).
 */
export function trackVehicleView(vehicle: {
  brand:  string;
  model:  string;
  year?:  number;
  price?: number;
}): void {
  trackEvent("vehicle_view", {
    brand: vehicle.brand,
    model: vehicle.model,
    ...(vehicle.year  && { year:  vehicle.year  }),
    ...(vehicle.price && { price: vehicle.price }),
  });
}

/**
 * Tracker une soumission de formulaire de contact.
 */
export function trackContactFormSubmit(source: string): void {
  trackEvent("contact_form_submit", { source });
}
