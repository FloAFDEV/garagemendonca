"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { AdminVehicleRow } from "@/components/admin/AdminVehicleRow";
import { VehicleStatusBadge } from "@/components/admin/VehicleStatusBadge";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useVehiclesAdmin } from "@/lib/queries/useVehicles";
import { useUser } from "@/lib/auth/useUser";
import { useMessageStats } from "@/hooks/useMessageStats";
import { Car, TrendingUp, Mail, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";

/* ─────────────────────────────────────────────────────────────────────
 * DashboardContent — rendu DANS AdminLayout → reçoit les bons tokens
 * ───────────────────────────────────────────────────────────────────── */
function DashboardContent() {
	const t = useAdminTokens();
	const { data: vehicles = [] } = useVehiclesAdmin(GARAGE_ID);
	const { data: msgStats } = useMessageStats();
	const { user } = useUser();

	const displayName =
		(user?.user_metadata?.first_name as string | undefined) ??
		(user?.user_metadata?.given_name as string | undefined) ??
		(user?.user_metadata?.name as string | undefined)?.split(" ")[0] ??
		"";

	const stockCount     = vehicles.filter((v) => v.status !== "sold").length;
	const soldCount      = vehicles.filter((v) => v.status === "sold").length;
	const publishedCount = vehicles.filter((v) => v.status === "published").length;

	const stats = [
		{
			label: "Véhicules en stock",
			value: stockCount.toString(),
			change: `${publishedCount} publiés`,
			icon: Car,
			color: "text-brand-500",
			bg: "bg-brand-500/10",
			href: undefined,
		},
		{
			label: "Demandes reçues",
			value: msgStats ? msgStats.total.toString() : "—",
			change: msgStats && msgStats.unread > 0
				? (
					<span className="flex items-center gap-1.5">
						<span className="w-1.5 h-1.5 rounded-full bg-red-400 motion-safe:animate-pulse inline-block flex-shrink-0" />
						{msgStats.unread} non lu{msgStats.unread > 1 ? "s" : ""}
					</span>
				)
				: "voir messagerie",
			icon: Mail,
			color: "text-emerald-500",
			bg: "bg-emerald-500/10",
			href: "/admin/messages" as const,
		},
		{
			label: "Véhicules vendus",
			value: soldCount.toString(),
			change: "au total",
			icon: TrendingUp,
			color: "text-violet-500",
			bg: "bg-violet-500/10",
			href: undefined,
		},
	];

	return (
		<div className="space-y-6">
			{/* Welcome */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className={clsx("font-heading font-medium text-xl", t.txt)}>
						Bonjour{displayName ? ` ${displayName}` : ""}
					</h2>
					<p className={clsx("mt-1 text-sm", t.txtMuted)}>
						Gestion des annonces
					</p>
				</div>
				<Link
					href="/admin/vehicules/nouveau"
					className="btn-primary text-sm shrink-0"
				>
					<Plus size={16} aria-hidden="true" />
					<span className="hidden sm:inline">Ajouter un véhicule</span>
					<span className="sm:hidden">Ajouter</span>
				</Link>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
				{stats.map(({ label, value, change, icon: Icon, color, bg, href }) => {
					const inner = (
						<>
							<div className="flex items-center justify-between mb-3">
								<div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
									<Icon size={20} className={color} />
								</div>
								{href && (
									<ArrowRight
										size={14}
										className={clsx(t.txtSubtle, "motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5")}
										aria-hidden="true"
									/>
								)}
							</div>
							<div className={clsx("font-heading font-light text-3xl mb-1 tracking-tight tabular-nums", t.txt)}>
								{value}
							</div>
							<div className={clsx("text-sm", t.txtMuted)}>{label}</div>
							<div className={clsx("text-xs mt-1", t.txtSubtle)}>{change}</div>
						</>
					);
					return href ? (
						<Link
							key={label}
							href={href}
							className={clsx("rounded-2xl border p-4 transition-colors group", t.surface, t.border, t.tableRowHover)}
						>
							{inner}
						</Link>
					) : (
						<div key={label} className={clsx("rounded-2xl border p-4", t.surface, t.border)}>
							{inner}
						</div>
					);
				})}
			</div>

			{/* Recent vehicles */}
			<div className={clsx("rounded-2xl border p-5", t.surface, t.border)}>
					<div className="flex items-center justify-between mb-4">
						<h3
							className={clsx(
								"font-heading font-normal tracking-wide",
								t.txt,
							)}
						>
							Véhicules en stock
						</h3>
						<Link
							href="/admin/vehicules"
							className="text-brand-500 text-sm font-medium flex items-center gap-1 group"
						>
							<span className="transition-colors group-hover:text-brand-600">
								Gérer
							</span>
							<ArrowRight
								size={14}
								className="transition-transform duration-200 group-hover:scale-110"
							/>
						</Link>
					</div>
					<div className="space-y-3">
						{[...vehicles]
							.sort((a, b) =>
								new Date(b.createdAt ?? 0).getTime() -
								new Date(a.createdAt ?? 0).getTime()
							)
							.slice(0, 5)
							.map((v) => (
							<Link
								key={v.id}
								href={`/admin/vehicules/${v.id}/modifier`}
								className={clsx(
									"flex items-center gap-3 py-3 border-b last:border-0 rounded-lg px-2 -mx-2 transition-colors group/row",
									t.border,
									t.tableRowHover,
								)}
							>
								<AdminVehicleRow
									vehicle={v}
									statusSlot={<VehicleStatusBadge status={v.status} />}
									afterPrice={
										v.createdAt ? (
											<span className={clsx("text-[10px]", t.txtSubtle)}>
												{new Date(v.createdAt).toLocaleDateString("fr-FR", {
													day: "2-digit",
													month: "2-digit",
													year: "2-digit",
												})}
											</span>
										) : undefined
									}
									trailingSlot={
										<ArrowRight
											size={14}
											className={clsx("transition-colors flex-shrink-0", t.txtSubtle, "group-hover/row:text-brand-500")}
											aria-hidden="true"
										/>
									}
								/>
							</Link>
						))}
					</div>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────────────
 * Page — AdminLayout en wrapper, DashboardContent en enfant
 * ───────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
	return (
		<AdminLayout>
			<DashboardContent />
		</AdminLayout>
	);
}
