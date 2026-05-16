import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── CSP ────────────────────────────────────────────────────────────────
//
// Approche : 'unsafe-inline' pour script-src.
//
// Pourquoi : Next.js 15 App Router génère des <script> inline pour
// l'hydratation. L'approche nonce nécessite de passer le nonce dans
// window.__NEXT_NONCE__ depuis le root layout (modification lourde).
// 'unsafe-inline' est le compromis standard pour Next.js sans nonce.
//
// Valeur ajoutée réelle de cette CSP :
//   - Bloque les scripts depuis des domaines tiers non listés
//   - Bloque les iframes (frame-ancestors 'none')
//   - Restreint connect-src, img-src, font-src
//   - Empêche les form submissions cross-origin (form-action 'self')
//
function buildCsp(): string {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
    : "*.supabase.co";

  const isDev = process.env.NODE_ENV === "development";

  const directives = [
    `default-src 'self'`,
    // Dev : unsafe-eval requis pour webpack HMR / React Refresh
    isDev
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com`
      : `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`,
    // Google Fonts CSS dans style-src
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' blob: data: https://${supabaseHost} https://www.garagemendonca.com https://images.unsplash.com https://upload.wikimedia.org`,
    // Dev : websocket HMR sur localhost + Supabase Realtime
    isDev
      ? `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://challenges.cloudflare.com ws://localhost:* http://localhost:*`
      : `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://challenges.cloudflare.com`,
    // Google Fonts fichiers dans font-src
    `font-src 'self' data: https://fonts.gstatic.com`,
    `frame-src https://challenges.cloudflare.com https://maps.google.com https://www.google.com`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    // upgrade-insecure-requests uniquement en prod (localhost est HTTP)
    ...(!isDev ? [`upgrade-insecure-requests`] : []),
  ];

  return directives.join("; ").trim();
}

// ── Security headers statiques ─────────────────────────────────────────
const STATIC_HEADERS: [string, string][] = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-DNS-Prefetch-Control", "on"],
  [
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  ],
  [
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  ],
];

// ── Middleware principal ───────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  // Nonce unique par requête pour la CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  let supabaseResponse = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        "x-nonce": nonce,
      }),
    },
  });

  // ── Appliquer les headers de sécurité ──────────────────────────
  const csp = buildCsp();
  supabaseResponse.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of STATIC_HEADERS) {
    supabaseResponse.headers.set(key, value);
  }

  const { pathname } = request.nextUrl;

  // Routes admin et login : pas d'indexation, pas de cache
  if (pathname.startsWith("/admin") || pathname === "/login") {
    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (pathname.startsWith("/admin")) {
    supabaseResponse.headers.set("Cache-Control", "no-store, max-age=0");
  }

  // ── Auth Supabase ──────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!supabaseUrl || !supabaseAnonKey || demoMode) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request: {
            headers: new Headers({
              ...Object.fromEntries(request.headers),
              "x-nonce": nonce,
            }),
          },
        });
        // Réappliquer les headers après reconstruction
        supabaseResponse.headers.set("Content-Security-Policy", csp);
        for (const [key, value] of STATIC_HEADERS) {
          supabaseResponse.headers.set(key, value);
        }
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rediriger l'ancienne URL /admin/login vers /login
  if (pathname === "/admin/login") {
    return NextResponse.redirect(
      new URL(user ? "/admin/dashboard" : "/login", request.url),
    );
  }

  // Protéger toutes les routes /admin/*
  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger les utilisateurs déjà connectés qui arrivent sur /login
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Matcher tous les chemins sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico, images, fonts…
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/|logos/).*)",
  ],
};
