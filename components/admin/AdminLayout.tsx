"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import {
	LayoutDashboard,
	Car,
	Plus,
	LogOut,
	Menu,
	Sun,
	Moon,
	Wrench,
	Megaphone,
	ExternalLink,
	Inbox,
	Clock,
	ChevronUp,
	Tag,
} from "lucide-react";
import clsx from "clsx";
import { useAdminTokens, useAdminThemeActions } from "@/contexts/AdminThemeContext";
import { adminUI } from "@/lib/admin-ui";
import { useUser } from "@/lib/auth/useUser";
import { signOutAction } from "@/lib/auth/actions";
import ProfileWidget from "@/components/admin/ProfileWidget";

const navItems = [
	{
		href: "/admin/dashboard",
		label: "Tableau de bord",
		Icon: LayoutDashboard,
	},
	{ href: "/admin/vehicules", label: "Véhicules", Icon: Car },
	{
		href: "/admin/vehicules/nouveau",
		label: "Ajouter un véhicule",
		Icon: Plus,
	},
	{ href: "/admin/messages", label: "Messages", Icon: Inbox },
	{ href: "/admin/categories", label: "Catégories", Icon: Tag },
	{ href: "/admin/services", label: "Services", Icon: Wrench },
	{ href: "/admin/banniere", label: "Bannière promo", Icon: Megaphone },
	{ href: "/admin/horaires", label: "Horaires", Icon: Clock },
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const t = useAdminTokens();
	const { toggleTheme } = useAdminThemeActions();
	const { user } = useUser();

	const userDisplayName =
		(user?.user_metadata?.first_name as string | undefined) ??
		(user?.user_metadata?.given_name as string | undefined) ??
		(user?.user_metadata?.name as string | undefined)?.split(" ")[0] ??
		null;

	const isDark = t.isDark;
	const unreadCount = useUnreadMessages();

	/* ── Tokens de thème ─────────────────────────────────────── */
	const bg      = isDark ? "bg-dark-950"    : "bg-slate-100";
	const surface  = isDark ? "bg-dark-900"   : "bg-white";
	const surface2 = isDark ? "bg-dark-800"   : "bg-slate-50";
	const border   = isDark ? "border-dark-800" : "border-slate-200";

	return (
		<div
			className={clsx("min-h-screen w-full overflow-x-hidden flex", bg)}
			data-admin-theme={isDark ? "dark" : "light"}
			suppressHydrationWarning
		>
				{/* Sidebar overlay (mobile) */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black/60 z-20 lg:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}

				{/* ── Sidebar ────────────────────────────────────── */}
				<aside
					className={clsx(
						"fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300",
						surface,
						"border-r",
						border,
						sidebarOpen
							? "translate-x-0"
							: "-translate-x-full lg:translate-x-0",
					)}
				>
					{/* Logo */}
					<div className={clsx("p-4 border-b", border)}>
						<Link href="/" className="flex items-center gap-3">
							<div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
									<rect
										x="9"
										y="11"
										width="14"
										height="10"
										rx="2"
									/>
									<circle cx="12" cy="21" r="1" />
									<circle cx="20" cy="21" r="1" />
								</svg>
							</div>
							<div>
								<div
									className={clsx(
										"font-heading font-medium text-sm leading-none tracking-wide",
										t.txt,
									)}
								>
									Garage Mendonca
								</div>
								<div
									className={clsx(
										"text-xs mt-0.5",
										t.txtSubtle,
									)}
								>
									Administration
								</div>
							</div>
						</Link>
					</div>

					{/* Nav */}
					<nav className="flex-1 p-4">
						<p
							className={clsx(
								"text-xs font-normal uppercase tracking-widest mb-3 px-3",
								t.txtSubtle,
							)}
						>
							Navigation
						</p>
						<ul className="space-y-1">
							{navItems.map(({ href, label, Icon }) => {
								const isActive =
									pathname === href ||
									(href === "/admin/vehicules" &&
										pathname.startsWith(
											"/admin/vehicules/",
										) &&
										pathname !==
											"/admin/vehicules/nouveau");

								return (
									<li key={href}>
										<Link
											href={href}
											onClick={() =>
												setSidebarOpen(false)
											}
											className={clsx(
												isActive
													? adminUI.navLinkActive
													: clsx(
															adminUI.navLink,
															t.txtMuted,
															"hover:bg-brand-600 hover:text-white",
														),
											)}
										>
											<Icon size={17} />
											<span className="flex-1">{label}</span>
											{href === "/admin/messages" && unreadCount > 0 && (
												<span className="relative flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold leading-none bg-brand-600 text-white rounded-full">
													<span className="absolute inset-0 rounded-full bg-brand-600 animate-ping opacity-60" />
													<span className="relative">{unreadCount > 99 ? "99+" : unreadCount}</span>
												</span>
											)}
										</Link>
									</li>
								);
							})}
						</ul>

						<div className={clsx("mt-6 pt-6 border-t", border)}>
							<p
								className={clsx(
									"text-xs font-normal uppercase tracking-widest mb-3 px-3",
									t.txtSubtle,
								)}
							>
								Accès rapide
							</p>
							<Link
								href="/"
								target="_blank"
								rel="noopener noreferrer"
								className={clsx(
									adminUI.navLink,
									t.txtMuted,
									t.hoverBg,
									t.hoverTxt,
								)}
							>
								<ExternalLink size={17} />
								Voir le site
							</Link>
						</div>
					</nav>

					{/* User + Profile popover */}
					<div className={clsx("p-4 border-t relative", border)}>
						{/* Popover profil */}
						{profileOpen && (
							<>
								<div
									className="fixed inset-0 z-40"
									onClick={() => setProfileOpen(false)}
								/>
								<div
									className={clsx(
										"absolute bottom-full left-4 right-4 mb-2 z-50 rounded-2xl border shadow-2xl overflow-hidden",
										surface,
										border,
									)}
								>
									{user && (
										<ProfileWidget
											user={user}
											onClose={() => setProfileOpen(false)}
										/>
									)}
								</div>
							</>
						)}

						<div className={clsx("flex items-center gap-2 px-3 py-2 rounded-xl", surface2)}>
							{/* Bouton profil cliquable */}
							<button
								onClick={() => setProfileOpen((v) => !v)}
								aria-label="Mon profil"
								aria-expanded={profileOpen}
								className={clsx(
									"flex items-center gap-2.5 flex-1 min-w-0 rounded-lg transition-colors",
									t.hoverBg,
								)}
							>
								<div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
									<span className="text-brand-400 font-medium text-sm">
										{user?.email?.[0]?.toUpperCase() ?? "A"}
									</span>
								</div>
								<div className="flex-1 min-w-0 text-left">
									<div className={clsx("text-sm font-normal truncate", t.txt)}>
										{userDisplayName ?? "Mon profil"}
									</div>
									<div className={clsx("text-xs truncate", t.txtSubtle)}>
										{user?.email ?? "—"}
									</div>
								</div>
								<ChevronUp
									size={14}
									className={clsx(
										"flex-shrink-0 transition-transform duration-200",
										t.txtSubtle,
										!profileOpen && "rotate-180",
									)}
									aria-hidden="true"
								/>
							</button>

							{/* Déconnexion */}
							<form action={signOutAction}>
								<button
									type="submit"
									aria-label="Se déconnecter"
									className={clsx(
										"p-1.5 rounded-lg transition-colors hover:text-red-500",
										adminUI.txtSecondary,
										adminUI.focusDanger,
									)}
								>
									<LogOut size={15} aria-hidden="true" />
								</button>
							</form>
						</div>
					</div>
				</aside>

				{/* ── Main content ───────────────────────────────── */}
				<div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
					{/* Top bar */}
					<header
						className={clsx(
							"px-5 py-3 flex items-center justify-between sticky top-0 z-10 border-b",
							surface,
							border,
						)}
					>
						{/* Hamburger — hover thème-aware */}
						<button
							onClick={() => setSidebarOpen(true)}
							className={clsx(
								"lg:hidden p-2.5 rounded-lg transition-colors",
								t.txtMuted,
								t.hoverBg,
								t.hoverTxt,
								adminUI.focusGhost,
							)}
							aria-label="Ouvrir le menu"
						>
							<Menu size={20} />
						</button>

						<h1
							className={clsx(
								"font-normal text-base tracking-wide truncate min-w-0 flex-1 px-2",
								t.txt,
							)}
						>
							{navItems.find(
								(n) =>
									pathname === n.href ||
									(n.href === "/admin/vehicules" &&
										pathname.startsWith(
											"/admin/vehicules/",
										) &&
										pathname !==
											"/admin/vehicules/nouveau"),
							)?.label ?? "Admin"}
						</h1>

						<div className="flex items-center gap-2">
							{/* Sélecteur de thème */}
							<button
								onClick={toggleTheme}
								className={clsx(
									"p-2 rounded-xl transition-all duration-200",
									t.txtMuted,
									t.hoverBg,
									isDark
										? "hover:text-amber-400"
										: "hover:text-amber-600",
									adminUI.focusGhost,
								)}
								aria-label={
									isDark
										? "Passer au thème clair"
										: "Passer au thème sombre"
								}
								title={isDark ? "Thème clair" : "Thème sombre"}
							>
								{isDark ? (
									<Sun size={18} />
								) : (
									<Moon size={18} />
								)}
							</button>
						</div>
					</header>

					{/* Page content */}
					<main className="flex-1 p-4 md:p-5">{children}</main>
				</div>
			</div>
	);
}
