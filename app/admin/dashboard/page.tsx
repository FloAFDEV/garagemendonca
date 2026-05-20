"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useVehiclesAdmin } from "@/lib/queries/useVehicles";
import { useUser } from "@/lib/auth/useUser";
import ProfileWidget from "@/components/admin/ProfileWidget";
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
	const { user } = useUser();
	const [firstName, setFirstName] = useState<string | null>(null);

	const displayName =
		firstName ??
		(user?.user_metadata?.first_name as string | undefined) ??
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
		},
		{
			label: "Demandes reçues",
			value: "—",
			change: "voir messagerie",
			icon: Mail,
			color: "text-emerald-500",
			bg: "bg-emerald-500/10",
		},
		{
			label: "Véhicules vendus",
			value: soldCount.toString(),
			change: "au total",
			icon: TrendingUp,
			color: "text-violet-500",
			bg: "bg-violet-500/10",
		},
	];

	return (
		<div className="space-y-6">
			{/* Welcome */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>
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
					Ajouter un véhicule
				</Link>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
				{stats.map(({ label, value, change, icon: Icon, color, bg }) => (
					<div
						key={label}
						className={clsx("rounded-2xl border p-6", t.surface, t.border)}
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className={clsx(
									"w-10 h-10 rounded-xl flex items-center justify-center",
									bg,
								)}
							>
								<Icon size={20} className={color} />
							</div>
						</div>
						<div
							className={clsx(
								"font-heading font-light text-3xl mb-1 tracking-tight",
								t.txt,
							)}
						>
							{value}
						</div>
						<div className={clsx("text-sm", t.txtMuted)}>{label}</div>
						<div className={clsx("text-xs mt-1", t.txtSubtle)}>{change}</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Recent vehicles */}
				<div
					className={clsx(
						"xl:col-span-2 rounded-2xl border p-6",
						t.surface,
						t.border,
					)}
				>
					<div className="flex items-center justify-between mb-6">
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
						{vehicles.slice(0, 5).map((v) => (
							<Link
								key={v.id}
								href={`/admin/vehicules/${v.id}/modifier`}
								className={clsx(
									"flex items-center justify-between py-3 border-b last:border-0 rounded-lg px-2 -mx-2 transition-colors group/row",
									t.border,
									t.tableRowHover,
								)}
							>
								<div>
									<div className={clsx("font-medium text-sm", t.txt)}>
										{v.brand} {v.model}
									</div>
									<div className={clsx("text-xs mt-0.5", t.txtSubtle)}>
										{v.year} · {v.mileage.toLocaleString("fr-FR")} km · {v.fuel}
									</div>
								</div>
								<div className="flex items-center gap-3">
									<span className="font-heading font-medium text-brand-500">
										{v.price.toLocaleString("fr-FR")} €
									</span>
									<ArrowRight
										size={14}
										className={clsx("transition-colors flex-shrink-0", t.txtSubtle, "group-hover/row:text-brand-500")}
										aria-hidden="true"
									/>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Colonne latérale */}
				<div className="flex flex-col gap-5">
					{/* Messagerie */}
					<div
						className={clsx(
							"rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 text-center",
							t.surface,
							t.border,
						)}
					>
						<Mail size={28} className={t.txtMuted} aria-hidden="true" />
						<div>
							<p className={clsx("font-normal text-sm", t.txt)}>Messagerie</p>
							<p className={clsx("text-xs mt-1", t.txtSubtle)}>
								Consultez les demandes de contact
							</p>
						</div>
						<Link
							href="/admin/messages"
							className="btn-secondary text-xs py-2 px-4"
						>
							Voir les messages
						</Link>
					</div>

					{/* Profil */}
					{user && (
						<ProfileWidget
							user={user}
							onUpdate={(name) => setFirstName(name)}
						/>
					)}
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
