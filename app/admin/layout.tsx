import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUser, getUserRole } from "@/lib/auth/getSession";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { logSecurityEvent } from "@/lib/security/logEvent";
import { getActiveGarageId } from "@/lib/config/garage";
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

    const garageId = getActiveGarageId();
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

  return (
    <>
      {/*
       * Script bloquant exécuté avant hydratation React.
       * Lit localStorage et applique immédiatement la classe "dark" sur <html>
       * → évite tout FOUC (flash of unstyled content) au rechargement.
       */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('admin-theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}})()`,
        }}
      />
      <AdminThemeRoot>{children}</AdminThemeRoot>
    </>
  );
}
