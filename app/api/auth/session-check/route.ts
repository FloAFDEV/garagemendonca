import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getSession";

/**
 * GET /api/auth/session-check
 *
 * Vérifie côté serveur si la session est toujours valide.
 * Utilisé par SessionGuard au retour sur l'onglet (visibilitychange).
 *
 * 200 → session OK
 * 401 → session expirée ou absente
 */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
