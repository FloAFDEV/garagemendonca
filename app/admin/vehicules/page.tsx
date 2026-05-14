"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { Vehicle, VehicleStatus } from "@/types";
import {
	Plus,
	Search,
	Pencil,
	Trash2,
	Eye,
	Car,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Star,
	SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import clsx from "clsx";
import { adminUI } from "@/lib/admin-ui";
import { useVehicleImage } from "@/lib/hooks/useVehicleImage";
import {
	getAdminVehicles,
	updateVehicleStatus,
	deleteVehicleAction,
} from "./actions";

const ADMIN_PER_PAGE = 20;

const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
	Essence: "orange",
	Diesel: "gray",
	Hybride: "green",
	Électrique: "green",
	GPL: "blue",
};

const STATUS_BADGE: Record<
	VehicleStatus,
	{ label: string; className: string }
> = {
	published: { label: "Publié", className: adminUI.badgePublished },
	draft: { label: "Brouillon", className: adminUI.badgeDraft },
	scheduled: { label: "Programmé", className: adminUI.badgeScheduled },
	sold: { label: "Vendue", className: adminUI.badgeSold },
};

const STATUS_ORDER: VehicleStatus[] = [
	"published",
	"draft",
	"scheduled",
	"sold",
];

type SortKey =
	| "date-desc"
	| "date-asc"
	| "price-asc"
	| "price-desc"
	| "year-desc";

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
	const cfg = STATUS_BADGE[current];

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className={clsx(
					cfg.className,
					"flex items-center gap-1.5 transition-opacity hover:opacity-80",
					adminUI.focusGhost,
				)}
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
									adminUI.focusGhost,
								)}
							>
								{STATUS_BADGE[s].label}
								{s === current && " ✓"}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
}

/* ── Thumbnail signée ───────────────────────────────────────────── */
function VehicleThumb({ vehicle, className }: { vehicle: Vehicle; className: string }) {
  const path = vehicle.vehicleImages?.[0]?.storage_path;
  const fallback = vehicle.thumbnailUrl ?? vehicle.vehicleImages?.[0]?.url ?? vehicle.images?.[0];
  const { url } = useVehicleImage(path, fallback);
  if (!url) return <Car size={14} className="text-slate-500" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={className} />;
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function AdminVehiclesPage() {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [search, setSearch] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [filterBrand, setFilterBrand] = useState("");
	const [filterYear, setFilterYear] = useState("");
	const [filterPriceMax, setFilterPriceMax] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [sortBy, setSortBy] = useState<SortKey>("date-desc");
	const [page, setPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const t = useAdminTokens();

	useEffect(() => {
		getAdminVehicles().then(setVehicles).catch(console.error);
	}, []);

	// Reset page when any filter/search changes
	useEffect(() => {
		setPage(1);
	}, [search, filterBrand, filterYear, filterPriceMax, filterStatus, sortBy]);

	const availableBrands = useMemo(
		() => Array.from(new Set(vehicles.map((v) => v.brand))).sort(),
		[vehicles],
	);

	const filtered = useMemo(() => {
		let list = vehicles.filter((v) => {
			const q = `${v.brand} ${v.model} ${v.year}`.toLowerCase();
			if (search && !q.includes(search.toLowerCase())) return false;
			if (filterBrand && v.brand !== filterBrand) return false;
			if (filterYear && v.year !== parseInt(filterYear)) return false;
			if (filterPriceMax && v.price > parseInt(filterPriceMax))
				return false;
			if (filterStatus && v.status !== filterStatus) return false;
			return true;
		});

		list = [...list].sort((a, b) => {
			switch (sortBy) {
				case "date-asc":
					return (
						new Date(a.createdAt ?? 0).getTime() -
						new Date(b.createdAt ?? 0).getTime()
					);
				case "price-asc":
					return a.price - b.price;
				case "price-desc":
					return b.price - a.price;
				case "year-desc":
					return b.year - a.year;
				default:
					return (
						new Date(b.createdAt ?? 0).getTime() -
						new Date(a.createdAt ?? 0).getTime()
					);
			}
		});

		return list;
	}, [
		vehicles,
		search,
		filterBrand,
		filterYear,
		filterPriceMax,
		filterStatus,
		sortBy,
	]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PER_PAGE));
	const paginated = filtered.slice(
		(page - 1) * ADMIN_PER_PAGE,
		page * ADMIN_PER_PAGE,
	);
	const hasActiveFilters = !!(
		filterBrand ||
		filterYear ||
		filterPriceMax ||
		filterStatus
	);

	const handleDelete = (id: string) => {
		setVehicles((prev) => prev.filter((v) => v.id !== id));
		setDeleteConfirm(null);
		deleteVehicleAction(id).catch(console.error);
	};

	const handleStatusChange = (id: string, status: VehicleStatus) => {
		setVehicles((prev) =>
			prev.map((v) =>
				v.id === id
					? {
							...v,
							status,
							...(status === "sold"
								? { sold_at: new Date().toISOString() }
								: {}),
						}
					: v,
			),
		);
		updateVehicleStatus(id, status).catch(console.error);
	};

	const actionBtn = clsx(
		"flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-colors text-xs",
		t.txtMuted,
		t.hoverBgStrong,
	);

	const selectClass = clsx(
		"border rounded-xl px-3 py-2 text-sm outline-none transition-all cursor-pointer",
		t.inputBg,
		t.inputBorder,
		t.inputText,
		"focus:border-brand-500",
	);

	return (
		<AdminLayout>
			<div className="space-y-5">
				{/* ── Header ──────────────────────────────────────────── */}
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
							{filtered.length} / {vehicles.length} véhicule
							{vehicles.length > 1 ? "s" : ""}
						</p>
					</div>
					<Link
						href="/admin/vehicules/nouveau"
						className="btn-secondary text-sm"
					>
						<Plus size={16} />
						<span className="hidden sm:inline">Ajouter</span>
					</Link>
				</div>

				{/* ── Search + filter toggle ───────────────────────── */}
				<div className="flex gap-2">
					<div className="relative flex-1">
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
					<button
						onClick={() => setShowFilters((v) => !v)}
						className={clsx(
							"flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors",
							showFilters || hasActiveFilters
								? "bg-brand-600 text-white border-brand-600"
								: clsx(
										t.surface,
										t.border,
										t.txtMuted,
										t.hoverBgStrong,
									),
						)}
					>
						<SlidersHorizontal size={15} />
						<span className="hidden sm:inline">Filtres</span>
						{hasActiveFilters && (
							<span className="w-5 h-5 rounded-full text-brand-600 text-[10px] flex items-center justify-center font-medium">
								{
									[
										filterBrand,
										filterYear,
										filterPriceMax,
										filterStatus,
									].filter(Boolean).length
								}
							</span>
						)}
					</button>
				</div>

				{/* ── Filters panel ───────────────────────────────── */}
				{showFilters && (
					<div
						className={clsx(
							"rounded-2xl border p-4 grid grid-cols-2 sm:grid-cols-4 gap-3",
							t.surface,
							t.border,
						)}
					>
						<div>
							<label
								className={clsx(
									"text-xs mb-1 block",
									t.txtMuted,
								)}
							>
								Marque
							</label>
							<select
								value={filterBrand}
								onChange={(e) => setFilterBrand(e.target.value)}
								className={clsx(selectClass, "w-full")}
							>
								<option value="">Toutes</option>
								{availableBrands.map((b) => (
									<option key={b} value={b}>
										{b}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								className={clsx(
									"text-xs mb-1 block",
									t.txtMuted,
								)}
							>
								Année
							</label>
							<input
								type="number"
								placeholder="2019"
								min="1990"
								max={new Date().getFullYear()}
								value={filterYear}
								onChange={(e) => setFilterYear(e.target.value)}
								className={clsx(
									"w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500",
									t.inputBg,
									t.inputBorder,
									t.inputText,
								)}
							/>
						</div>
						<div>
							<label
								className={clsx(
									"text-xs mb-1 block",
									t.txtMuted,
								)}
							>
								Prix max (€)
							</label>
							<select
								value={filterPriceMax}
								onChange={(e) =>
									setFilterPriceMax(e.target.value)
								}
								className={clsx(selectClass, "w-full")}
							>
								<option value="">Tous</option>
								{[5000, 8000, 10000, 12000, 15000, 20000].map(
									(p) => (
										<option key={p} value={p}>
											{p.toLocaleString("fr-FR")} €
										</option>
									),
								)}
							</select>
						</div>
						<div>
							<label
								className={clsx(
									"text-xs mb-1 block",
									t.txtMuted,
								)}
							>
								Statut
							</label>
							<select
								value={filterStatus}
								onChange={(e) =>
									setFilterStatus(e.target.value)
								}
								className={clsx(selectClass, "w-full")}
							>
								<option value="">Tous</option>
								<option value="published">Publié</option>
								<option value="draft">Brouillon</option>
								<option value="scheduled">Programmé</option>
								<option value="sold">Vendu</option>
							</select>
						</div>
						<div className="col-span-2 sm:col-span-4 flex items-center justify-between pt-1">
							<div>
								<label
									className={clsx(
										"text-xs mb-1 block",
										t.txtMuted,
									)}
								>
									Trier par
								</label>
								<select
									value={sortBy}
									onChange={(e) =>
										setSortBy(e.target.value as SortKey)
									}
									className={selectClass}
								>
									<option value="date-desc">
										Plus récents
									</option>
									<option value="date-asc">
										Plus anciens
									</option>
									<option value="price-asc">
										Prix croissant
									</option>
									<option value="price-desc">
										Prix décroissant
									</option>
									<option value="year-desc">
										Année décroissante
									</option>
								</select>
							</div>
							{hasActiveFilters && (
								<button
									onClick={() => {
										setFilterBrand("");
										setFilterYear("");
										setFilterPriceMax("");
										setFilterStatus("");
									}}
									className={clsx(
										"text-xs px-3 py-1.5 rounded-xl border transition-colors",
										t.border,
										t.txtMuted,
										t.hoverBgStrong,
									)}
								>
									Réinitialiser
								</button>
							)}
						</div>
					</div>
				)}

				{/* ── Mobile cards ────────────────────────────────── */}
				<div className="md:hidden space-y-3">
					{paginated.length === 0 ? (
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
						paginated.map((vehicle) => (
							<div
								key={vehicle.id}
								className={clsx(
									"rounded-2xl border overflow-hidden",
									t.surface,
									t.border,
								)}
							>
								<div className={clsx("w-full h-36 overflow-hidden flex items-center justify-center", t.surface)}>
									<VehicleThumb vehicle={vehicle} className="w-full h-full object-cover" />
								</div>
								<div className="p-4 space-y-3">
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
												{vehicle.features?.[
													"Finition"
												] && (
													<span className="text-brand-400 text-xs font-normal ml-1">
														—{" "}
														{
															vehicle.features[
																"Finition"
															]
														}
													</span>
												)}
											</p>
											<p
												className={clsx(
													"text-xs mt-0.5",
													t.txtSubtle,
												)}
											>
												{vehicle.year} · {vehicle.color}{" "}
												· {vehicle.transmission}
											</p>
										</div>
										<span className="font-heading font-medium text-brand-400 text-sm flex-shrink-0">
											{vehicle.price.toLocaleString(
												"fr-FR",
											)}{" "}
											€
										</span>
									</div>
									<div className="flex items-center gap-2 flex-wrap">
										<Badge
											variant={
												fuelVariants[vehicle.fuel] ??
												"gray"
											}
										>
											{vehicle.fuel}
										</Badge>
										<span
											className={clsx(
												"text-xs",
												t.txtMuted,
											)}
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
											className={clsx(
												actionBtn,
												t.hoverTxt,
											)}
										>
											<Eye size={13} /> Voir
										</Link>
										<Link
											href={`/admin/vehicules/${vehicle.id}/modifier`}
											className={clsx(
												actionBtn,
												"hover:text-blue-500",
											)}
										>
											<Pencil size={13} /> Modifier
										</Link>
										{deleteConfirm === vehicle.id ? (
											<div className="flex-1 flex items-center gap-1">
												<button
													onClick={() =>
														handleDelete(vehicle.id)
													}
													className={clsx(
														"flex-1",
														adminUI.btnDangerSm,
													)}
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
												<Trash2 size={13} /> Supprimer
											</button>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* ── Desktop table ────────────────────────────────── */}
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
								{paginated.map((vehicle) => (
									<tr
										key={vehicle.id}
										className={clsx(
											"border-b last:border-0 transition-colors",
											t.border,
											t.tableRowHover,
										)}
									>
										<td className="px-3 py-3">
											<div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
												<VehicleThumb vehicle={vehicle} className="w-full h-full object-cover" />
											</div>
										</td>
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
													{vehicle.brand}{" "}
													{vehicle.model}
													{vehicle.features?.[
														"Finition"
													] && (
														<span className="text-brand-400 text-xs font-normal ml-1">
															—{" "}
															{
																vehicle
																	.features[
																	"Finition"
																]
															}
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
												{vehicle.status ===
													"scheduled" &&
													vehicle.published_at && (
														<div className="text-blue-400 text-xs mt-1">
															📅{" "}
															{new Date(
																vehicle.published_at,
															).toLocaleDateString(
																"fr-FR",
															)}
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
															).toLocaleDateString(
																"fr-FR",
															)}
														</div>
													)}
											</div>
										</td>
										<td
											className={clsx(
												"px-5 py-4 text-sm",
												t.txtMuted,
											)}
										>
											{vehicle.mileage.toLocaleString(
												"fr-FR",
											)}{" "}
											km
										</td>
										<td className="px-5 py-4">
											<span className="font-heading font-medium text-brand-400 text-sm">
												{vehicle.price.toLocaleString(
													"fr-FR",
												)}{" "}
												€
											</span>
										</td>
										<td className="px-5 py-4">
											<StatusSelect
												vehicleId={vehicle.id}
												current={
													vehicle.status ?? "draft"
												}
												onChange={handleStatusChange}
											/>
										</td>
										<td
											className={clsx(
												"px-5 py-4 text-xs",
												t.txtSubtle,
											)}
										>
											{vehicle.createdAt
												? new Date(
														vehicle.createdAt,
													).toLocaleDateString(
														"fr-FR",
														{
															day: "2-digit",
															month: "2-digit",
															year: "2-digit",
														},
													)
												: "—"}
										</td>
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
												{deleteConfirm ===
												vehicle.id ? (
													<div className="flex items-center gap-1">
														<button
															onClick={() =>
																handleDelete(
																	vehicle.id,
																)
															}
															className={
																adminUI.btnDangerSm
															}
														>
															Confirmer
														</button>
														<button
															onClick={() =>
																setDeleteConfirm(
																	null,
																)
															}
															className={
																adminUI.btnGhostSm
															}
														>
															Annuler
														</button>
													</div>
												) : (
													<button
														onClick={() =>
															setDeleteConfirm(
																vehicle.id,
															)
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
								{paginated.length === 0 && (
									<tr>
										<td
											colSpan={7}
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

				{/* ── Pagination ──────────────────────────────────── */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between gap-4">
						<p className={clsx("text-xs", t.txtSubtle)}>
							Page {page} / {totalPages} · {filtered.length}{" "}
							résultats
						</p>
						<div className="flex items-center gap-1">
							<button
								onClick={() =>
									setPage((p) => Math.max(1, p - 1))
								}
								disabled={page === 1}
								className={clsx(
									"p-2 rounded-xl border transition-colors disabled:opacity-30",
									t.border,
									t.txtMuted,
									t.hoverBgStrong,
								)}
							>
								<ChevronLeft size={16} />
							</button>
							{Array.from(
								{ length: Math.min(5, totalPages) },
								(_, i) => {
									const start = Math.max(
										1,
										Math.min(page - 2, totalPages - 4),
									);
									const p = start + i;
									return (
										<button
											key={p}
											onClick={() => setPage(p)}
											className={clsx(
												"w-9 h-9 rounded-xl text-sm border transition-colors",
												p === page
													? "text-white border-gray-600"
													: clsx(
															t.border,
															t.txtMuted,
															t.hoverBgStrong,
														),
											)}
										>
											{p}
										</button>
									);
								},
							)}
							<button
								onClick={() =>
									setPage((p) => Math.min(totalPages, p + 1))
								}
								disabled={page === totalPages}
								className={clsx(
									"p-2 rounded-xl border transition-colors disabled:opacity-30",
									t.border,
									t.txtMuted,
									t.hoverBgStrong,
								)}
							>
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
