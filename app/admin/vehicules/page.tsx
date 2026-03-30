"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useDemoStore } from "@/lib/demoStore";
import { Vehicle, VehicleStatus } from "@/types";
import {
	Plus,
	Search,
	Pencil,
	Trash2,
	Eye,
	Car,
	ChevronDown,
	Star,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import clsx from "clsx";

/* ── Fuel badge variants ─────────────────────────────────────── */
const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
	Essence: "orange",
	Diesel: "gray",
	Hybride: "green",
	Électrique: "green",
	GPL: "blue",
};

/* ── Status config (thème-aware pour "draft") ────────────────── */
function getStatusConfig(
	isDark: boolean,
): Record<VehicleStatus, { label: string; className: string }> {
	return {
		published: {
			label: "Publié",
			className:
				"bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
		},
		draft: {
			label: "Brouillon",
			className: isDark
				? "bg-dark-700 text-dark-400 border border-dark-600"
				: "bg-slate-100 text-slate-500 border border-slate-300",
		},
		scheduled: {
			label: "Programmé",
			className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
		},
		sold: {
			label: "Vendue",
			className: "bg-red-500/15 text-red-400 border border-red-500/30",
		},
	};
}

const STATUS_ORDER: VehicleStatus[] = [
	"published",
	"draft",
	"scheduled",
	"sold",
];

/* ── StatusSelect ────────────────────────────────────────────── */
function StatusSelect({
	vehicleId,
	current,
	onChange,
}: {
	vehicleId: string;
	current: VehicleStatus;
	onChange: (id: string, status: VehicleStatus) => void;
}) {
	const [open, setOpen] = useState(false);
	const t = useAdminTokens();
	const cfg = getStatusConfig(t.isDark)[current];

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg ${cfg.className} transition-opacity hover:opacity-80`}
			>
				{cfg.label}
				<ChevronDown size={11} />
			</button>
			{open && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setOpen(false)}
					/>
					<div
						className={clsx(
							"absolute left-0 top-full mt-1 z-20 rounded-xl shadow-xl overflow-hidden min-w-[130px] border",
							t.dropdownBg,
							t.dropdownBorder,
						)}
					>
						{STATUS_ORDER.map((s) => (
							<button
								key={s}
								onClick={() => {
									onChange(vehicleId, s);
									setOpen(false);
								}}
								className={clsx(
									"w-full text-left px-3 py-2 text-xs transition-colors",
									t.dropdownItemHover,
									s === current
										? `${t.txt} font-medium`
										: t.dropdownItemTxt,
								)}
							>
								{getStatusConfig(t.isDark)[s].label}
								{s === current && " ✓"}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
}

/* ── Page ────────────────────────────────────────────────────── */
export default function AdminVehiclesPage() {
	const { vehicles, updateVehicle, deleteVehicle } = useDemoStore();
	const [search, setSearch] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const t = useAdminTokens();

	const filtered = vehicles.filter((v) =>
		`${v.brand} ${v.model} ${v.year}`
			.toLowerCase()
			.includes(search.toLowerCase()),
	);

	const handleDelete = (id: string) => {
		deleteVehicle(id);
		setDeleteConfirm(null);
	};

	const handleStatusChange = (id: string, status: VehicleStatus) => {
		updateVehicle(id, {
			status,
			...(status === "sold" ? { sold_at: new Date().toISOString() } : {}),
		});
	};

	/* ── Shared style helpers ─────────────────────────── */
	const actionBtn = clsx(
		"flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-colors text-xs",
		t.txtMuted,
		t.hoverBgStrong,
	);

	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* ── Header ───────────────────────────────────────── */}
				<div className="flex items-center justify-between">
					<div>
						<h2
							className={clsx(
								"font-heading font-medium text-2xl",
								t.txt,
							)}
						>
							Véhicules
						</h2>
						<p className={clsx("text-sm mt-1", t.txtMuted)}>
							{vehicles.length} véhicule
							{vehicles.length > 1 ? "s" : ""} au total
						</p>
					</div>
					<Link
						href="/admin/vehicules/nouveau"
						className="btn-primary text-sm !text-slate-50"
					>
						<Plus size={16} />
						<span className="hidden sm:inline">Ajouter</span>
					</Link>
				</div>

				{/* ── Search ───────────────────────────────────────── */}
				<div className="relative">
					<Search
						size={16}
						className={clsx(
							"absolute left-4 top-1/2 -translate-y-1/2",
							t.txtSubtle,
						)}
					/>
					<input
						type="text"
						placeholder="Rechercher un véhicule…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className={clsx(
							"w-full border focus:border-brand-500 rounded-xl pl-11 pr-4 py-3 outline-none transition-all text-sm",
							t.inputBg,
							t.inputBorder,
							t.inputText,
							t.inputPlaceholder,
						)}
					/>
				</div>

				{/* ── Mobile cards (< md) ──────────────────────────── */}
				<div className="md:hidden space-y-3">
					{filtered.length === 0 ? (
						<div className="text-center py-16">
							<Car
								size={40}
								className={clsx("mx-auto mb-3", t.txtFaint)}
							/>
							<p className={clsx("text-sm", t.txtSubtle)}>
								Aucun véhicule trouvé
							</p>
						</div>
					) : (
						filtered.map((vehicle) => (
							<div
								key={vehicle.id}
								className={clsx(
									"rounded-2xl border overflow-hidden",
									t.surface,
									t.border,
								)}
							>
								{/* Thumbnail */}
								{vehicle.images[0] ? (
									<div className="w-full h-36 overflow-hidden bg-slate-700">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={vehicle.images[0]}
											alt=""
											className="w-full h-full object-cover"
										/>
									</div>
								) : (
									<div
										className={clsx(
											"w-full h-36 flex items-center justify-center",
											t.surface,
										)}
									>
										<Car size={32} className={t.txtFaint} />
									</div>
								)}

								<div className="p-4 space-y-3">
									{/* Top row */}
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<p
												className={clsx(
													"font-normal text-sm truncate flex items-center gap-1.5",
													t.txt,
												)}
											>
												{vehicle.featured && (
													<Star
														size={11}
														className="text-amber-400 flex-shrink-0"
													/>
												)}
												{vehicle.brand} {vehicle.model}
												{vehicle.features?.["Finition"] && (
													<span className="text-brand-400 text-xs font-normal ml-1">
														— {vehicle.features["Finition"]}
													</span>
												)}
											</p>
											<p
												className={clsx(
													"text-xs mt-0.5",
													t.txtSubtle,
												)}
											>
												{vehicle.year} · {vehicle.color} ·{" "}
												{vehicle.transmission}
											</p>
										</div>
										<span className="font-heading font-medium text-brand-400 text-sm flex-shrink-0">
											{vehicle.price.toLocaleString("fr-FR")}{" "}
											€
										</span>
									</div>

									{/* Tags */}
									<div className="flex items-center gap-2 flex-wrap">
										<Badge
											variant={
												fuelVariants[vehicle.fuel] ?? "gray"
											}
										>
											{vehicle.fuel}
										</Badge>
										<span
											className={clsx("text-xs", t.txtMuted)}
										>
											{vehicle.mileage.toLocaleString(
												"fr-FR",
											)}{" "}
											km
										</span>
										<StatusSelect
											vehicleId={vehicle.id}
											current={vehicle.status ?? "draft"}
											onChange={handleStatusChange}
										/>
									</div>

									{/* Actions */}
									<div
										className={clsx(
											"flex items-center gap-2 pt-1 border-t",
											t.border,
										)}
									>
										<Link
											href={`/vehicules/${vehicle.id}`}
											target="_blank"
											title="Prévisualiser"
											className={clsx(actionBtn, t.hoverTxt)}
										>
											<Eye size={13} />
											Voir
										</Link>
										<Link
											href={`/admin/vehicules/${vehicle.id}/modifier`}
											className={clsx(
												actionBtn,
												"hover:text-blue-500",
											)}
										>
											<Pencil size={13} />
											Modifier
										</Link>
										{deleteConfirm === vehicle.id ? (
											<div className="flex-1 flex items-center gap-1">
												<button
													onClick={() =>
														handleDelete(vehicle.id)
													}
													className="flex-1 px-2 py-1.5 text-xs bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium"
												>
													Confirmer
												</button>
												<button
													onClick={() =>
														setDeleteConfirm(null)
													}
													className={clsx(
														"px-2 py-1.5 text-xs rounded-lg transition-colors",
														t.txtSubtle,
														t.hoverTxt,
													)}
												>
													✕
												</button>
											</div>
										) : (
											<button
												onClick={() =>
													setDeleteConfirm(vehicle.id)
												}
												className={clsx(
													actionBtn,
													"hover:text-red-500",
												)}
											>
												<Trash2 size={13} />
												Supprimer
											</button>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* ── Desktop table (≥ md) ─────────────────────────── */}
				<div
					className={clsx(
						"hidden md:block rounded-2xl border overflow-hidden",
						t.surface,
						t.border,
					)}
				>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className={clsx("border-b", t.border)}>
									{[
										"Photo",
										"Véhicule",
										"Km",
										"Prix",
										"Statut",
										"Ajouté",
										"Actions",
									].map((th) => (
										<th
											key={th}
											className={clsx(
												"text-left px-5 py-4 text-xs font-normal uppercase tracking-widest",
												th === "Photo" && "w-16",
												t.txtMuted,
											)}
										>
											{th}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{filtered.map((vehicle) => (
									<tr
										key={vehicle.id}
										className={clsx(
											"border-b last:border-0 transition-colors",
											t.border,
											t.tableRowHover,
										)}
									>
										{/* Photo */}
										<td className="px-3 py-3">
											<div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
												{vehicle.images[0] ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														src={vehicle.images[0]}
														alt=""
														className="w-full h-full object-cover"
													/>
												) : (
													<Car size={14} className={t.txtFaint} />
												)}
											</div>
										</td>

										{/* Véhicule */}
										<td className="px-5 py-4">
											<div>
												<div
													className={clsx(
														"font-normal text-sm flex items-center gap-1.5",
														t.txt,
													)}
												>
													{vehicle.featured && (
														<Star
															size={11}
															className="text-amber-400 flex-shrink-0"
														/>
													)}
													{vehicle.brand} {vehicle.model}
													{vehicle.features?.["Finition"] && (
														<span className="text-brand-400 text-xs font-normal ml-1">
															— {vehicle.features["Finition"]}
														</span>
													)}
												</div>
												<div
													className={clsx(
														"text-xs mt-0.5",
														t.txtSubtle,
													)}
												>
													{vehicle.color} ·{" "}
													{vehicle.transmission} ·{" "}
													{vehicle.year}
												</div>
												{vehicle.status === "scheduled" &&
													vehicle.published_at && (
														<div className="text-blue-400 text-xs mt-1">
															📅{" "}
															{new Date(
																vehicle.published_at,
															).toLocaleDateString("fr-FR")}
														</div>
													)}
												{vehicle.status === "sold" &&
													vehicle.sold_at && (
														<div
															className={clsx(
																"text-xs mt-1",
																t.txtSubtle,
															)}
														>
															Vendue le{" "}
															{new Date(
																vehicle.sold_at,
															).toLocaleDateString("fr-FR")}
														</div>
													)}
											</div>
										</td>

										{/* Km */}
										<td
											className={clsx(
												"px-5 py-4 text-sm",
												t.txtMuted,
											)}
										>
											{vehicle.mileage.toLocaleString("fr-FR")}{" "}
											km
										</td>

										{/* Prix */}
										<td className="px-5 py-4">
											<span className="font-heading font-medium text-brand-400 text-sm">
												{vehicle.price.toLocaleString("fr-FR")}{" "}
												€
											</span>
										</td>

										{/* Statut */}
										<td className="px-5 py-4">
											<StatusSelect
												vehicleId={vehicle.id}
												current={vehicle.status ?? "draft"}
												onChange={handleStatusChange}
											/>
										</td>

										{/* Ajouté */}
										<td
											className={clsx(
												"px-5 py-4 text-xs",
												t.txtSubtle,
											)}
										>
											{vehicle.createdAt
												? new Date(
														vehicle.createdAt,
													).toLocaleDateString("fr-FR", {
														day: "2-digit",
														month: "2-digit",
														year: "2-digit",
													})
												: "—"}
										</td>

										{/* Actions */}
										<td className="px-5 py-4">
											<div className="flex items-center gap-1">
												<Link
													href={`/vehicules/${vehicle.id}`}
													target="_blank"
													className={clsx(
														"p-2 rounded-lg transition-colors",
														t.txtMuted,
														t.hoverBgStrong,
														t.hoverTxt,
													)}
													title="Prévisualiser"
												>
													<Eye size={15} />
												</Link>
												<Link
													href={`/admin/vehicules/${vehicle.id}/modifier`}
													className={clsx(
														"p-2 rounded-lg transition-colors",
														t.txtMuted,
														t.hoverBgStrong,
														"hover:text-blue-500",
													)}
													title="Modifier"
												>
													<Pencil size={15} />
												</Link>
												{deleteConfirm === vehicle.id ? (
													<div className="flex items-center gap-1">
														<button
															onClick={() =>
																handleDelete(vehicle.id)
															}
															className="px-2 py-1 text-xs bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium"
														>
															Confirmer
														</button>
														<button
															onClick={() =>
																setDeleteConfirm(null)
															}
															className={clsx(
																"px-2 py-1 text-xs rounded-lg transition-colors",
																t.txtSubtle,
																t.hoverTxt,
															)}
														>
															Annuler
														</button>
													</div>
												) : (
													<button
														onClick={() =>
															setDeleteConfirm(vehicle.id)
														}
														className={clsx(
															"p-2 rounded-lg transition-colors",
															t.txtMuted,
															t.hoverBgStrong,
															"hover:text-red-500",
														)}
														title="Supprimer"
													>
														<Trash2 size={15} />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
								{filtered.length === 0 && (
									<tr>
										<td
											colSpan={8}
											className="text-center py-16"
										>
											<Car
												size={40}
												className={clsx(
													"mx-auto mb-3",
													t.txtFaint,
												)}
											/>
											<p
												className={clsx(
													"text-sm",
													t.txtSubtle,
												)}
											>
												Aucun véhicule trouvé
											</p>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
