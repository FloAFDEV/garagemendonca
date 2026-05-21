import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * POST /api/auth/signout
 *
 * Déconnecte l'utilisateur côté serveur en révoquant la session Supabase
 * et en effaçant les cookies HTTP-only créés par @supabase/ssr.
 *
 * Le browser client (createBrowserClient) ne peut pas supprimer les cookies
 * HTTP-only — seul un handler serveur peut le faire via Set-Cookie.
 *
 * Appelé par SessionGuard lors d'une déconnexion pour inactivité ou session
 * expirée, pour garantir qu'un simple F5 ne bypasse pas le re-login.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.signOut();

  const { searchParams } = new URL(request.url);
  const reason = searchParams.get("reason") ?? "expired";

  return NextResponse.redirect(
    new URL(`/login?session=${reason}`, request.url),
    { status: 302 },
  );
}
