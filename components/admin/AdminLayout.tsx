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
  X,
  Bell,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/admin/vehicules", label: "Véhicules", Icon: Car },
  { href: "/admin/vehicules/nouveau", label: "Ajouter un véhicule", Icon: Plus },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-dark-900 border-r border-dark-800 z-30 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-800">
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
              <div className="font-heading font-bold text-white text-sm leading-none">
                Garage Mendonca
              </div>
              <div className="text-xs text-dark-500 mt-0.5">Administration</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-dark-500 uppercase tracking-widest mb-3 px-3">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname === href
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                      : "text-dark-400 hover:text-white hover:bg-dark-800"
                  )}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-dark-800">
            <p className="text-xs font-semibold text-dark-500 uppercase tracking-widest mb-3 px-3">
              Accès rapide
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <Settings size={17} />
              Voir le site
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-dark-800">
            <div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 font-bold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">Administrateur</div>
              <div className="text-dark-500 text-xs truncate">admin@garagemendonca.com</div>
            </div>
            <Link
              href="/admin/login"
              className="text-dark-500 hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-dark-900 border-b border-dark-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-dark-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-white font-semibold text-lg">
              {navItems.find((n) => n.href === pathname)?.label ?? "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-dark-400 hover:text-white p-2 rounded-xl hover:bg-dark-800 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
