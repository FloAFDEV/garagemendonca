"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Plus,
  LogOut,
  Menu,
  Bell,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import clsx from "clsx";
import { useAdminTheme } from "@/hooks/useAdminTheme";

const navItems = [
  { href: "/admin/dashboard",         label: "Tableau de bord",     Icon: LayoutDashboard },
  { href: "/admin/vehicules",         label: "Véhicules",           Icon: Car },
  { href: "/admin/vehicules/nouveau", label: "Ajouter un véhicule", Icon: Plus },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useAdminTheme();

  /* Avoid flash of wrong theme — render dark until hydrated */
  const isDark = !mounted || theme === "dark";

  /* ── Tokens de thème réutilisables ── */
  const bg       = isDark ? "bg-dark-950"    : "bg-slate-100";
  const surface  = isDark ? "bg-dark-900"    : "bg-white";
  const surface2 = isDark ? "bg-dark-800"    : "bg-slate-50";
  const border   = isDark ? "border-dark-800": "border-slate-200";
  const txt      = isDark ? "text-white"     : "text-[#0f172a]";
  const txtMuted = isDark ? "text-dark-400"  : "text-slate-500";
  const txtSubtle= isDark ? "text-dark-500"  : "text-slate-400";
  const hoverBg  = isDark ? "hover:bg-dark-800" : "hover:bg-slate-100";

  return (
    <div className={clsx("min-h-screen flex", bg)} data-admin-theme={mounted ? theme : "dark"}>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300",
          surface, "border-r", border,
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={clsx("p-6 border-b", border)}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="2" />
                <circle cx="12" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
              </svg>
            </div>
            <div>
              <div className={clsx("font-heading font-bold text-sm leading-none", txt)}>
                Garage Mendonca
              </div>
              <div className={clsx("text-xs mt-0.5", txtSubtle)}>Administration</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4">
          <p className={clsx("text-xs font-semibold uppercase tracking-widest mb-3 px-3", txtSubtle)}>
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map(({ href, label, Icon }) => {
              /* active : exact match, or sub-path (except "nouveau" which is its own item) */
              const isActive =
                pathname === href ||
                (href === "/admin/vehicules" && pathname.startsWith("/admin/vehicules/") && pathname !== "/admin/vehicules/nouveau");

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                        : clsx(txtMuted, "hover:text-white", hoverBg)
                    )}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={clsx("mt-6 pt-6 border-t", border)}>
            <p className={clsx("text-xs font-semibold uppercase tracking-widest mb-3 px-3", txtSubtle)}>
              Accès rapide
            </p>
            <Link
              href="/"
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                txtMuted, "hover:text-white", hoverBg
              )}
            >
              <Settings size={17} />
              Voir le site
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className={clsx("p-4 border-t", border)}>
          <div className={clsx("flex items-center gap-3 px-3 py-3 rounded-xl", surface2)}>
            <div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 font-bold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className={clsx("text-sm font-semibold truncate", txt)}>Administrateur</div>
              <div className={clsx("text-xs truncate", txtSubtle)}>admin@garagemendonca.com</div>
            </div>
            <Link
              href="/admin/login"
              className={clsx("transition-colors hover:text-red-400", txtSubtle)}
              title="Déconnexion"
            >
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className={clsx("px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b", surface, border)}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={clsx("lg:hidden p-1.5 rounded-lg transition-colors", txtMuted, "hover:text-white", hoverBg)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h1 className={clsx("font-semibold text-lg", txt)}>
              {navItems.find((n) =>
                pathname === n.href ||
                (n.href === "/admin/vehicules" && pathname.startsWith("/admin/vehicules/") && pathname !== "/admin/vehicules/nouveau")
              )?.label ?? "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* ── Sélecteur de thème ── */}
            <button
              onClick={toggleTheme}
              className={clsx(
                "p-2 rounded-xl transition-all duration-200",
                txtMuted, hoverBg,
                "hover:text-amber-400"
              )}
              aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
              title={isDark ? "Thème clair" : "Thème sombre"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className={clsx("p-2 rounded-xl transition-colors relative", txtMuted, hoverBg)}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
