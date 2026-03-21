/**
 * Layout persistant pour toutes les pages /admin.
 * Fournit le DemoStoreProvider à tous les enfants — le state
 * survit aux navigations entre pages admin.
 */
import { DemoStoreProvider } from "@/lib/demoStore";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoStoreProvider>{children}</DemoStoreProvider>;
}
