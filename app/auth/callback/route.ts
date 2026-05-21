import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Route Handler PKCE — échange le code Supabase server-side.
 *
 * Le client `@supabase/ssr` écrit les tokens dans les cookies SSR
 * (httpOnly, sameSite=lax), rendus lisibles par le middleware et les
 * Server Components. L'échange browser-side via createBrowserClient
 * n'écrit PAS dans ces cookies — c'est pourquoi cette route est requise.
 *
 * Usage : redirectTo = `${SITE_URL}/auth/callback?next=/reset-password`
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              ...options,
            }),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  // x-forwarded-host : préserve le domaine d'origine derrière un reverse proxy (Vercel)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  return NextResponse.redirect(new URL(next, base));
}
