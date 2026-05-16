import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUser, getUserRole } from "@/lib/auth/getSession";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { logSecurityEvent } from "@/lib/security/logEvent";
import AdminThemeRoot from "@/components/admin/AdminThemeRoot";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (SUPABASE_ENABLED) {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;

    const user = await getUser();
    if (!user) {
      await logSecurityEvent({ eventType: "unauthorized_action", ip });
      redirect("/login");
    }

    const garageId = process.env.NEXT_PUBLIC_GARAGE_ID;
    if (garageId) {
      const role = await getUserRole(garageId);
      if (role !== "admin" && role !== "superadmin") {
        await logSecurityEvent({
          eventType: "access_denied",
          ip,
          userId: user.id,
          userEmail: user.email,
          details: { role: role ?? "none" },
        });
        redirect("/login?error=unauthorized");
      }
    }
  }

  return <AdminThemeRoot>{children}</AdminThemeRoot>;
}
