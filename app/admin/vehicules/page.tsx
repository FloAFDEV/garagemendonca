"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useAdminVehiclesList } from "@/lib/queries/useVehicles";
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
	X,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { adminUI } from "@/lib/admin-ui";
import {
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
	const [openUp, setOpenUp] = useState(false);
	const btnRef = useRef<HTMLButtonElement>(null);
	const t = useAdminTokens();
	const cfg = STATUS_BADGE[current];

	function handleToggle() {
		if (!open && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			setOpenUp(window.innerHeight - rect.bottom < 140);
		}
		setOpen((v) => !v);
	}

	return (
		<div className="relative">
			<button
				ref={btnRef}
				onClick={handleToggle}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={`Statut : ${cfg.label}`}
				className={clsx(
					cfg.className,
					"flex items-center gap-1.5 transition-opacity hover:opacity-80",
					adminUI.focusGhost,
				)}
			>
				{cfg.label}
				<ChevronDown size={11} aria-hidden="true" />
			</button>
			{open && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setOpen(false)}
					/>
					<div
						className={clsx(
							"absolute left-0 z-20 rounded-xl shadow-xl overflow-hidden min-w-[130px] border",
							openUp ? "bottom-full mb-1" : "top-full mt-1",
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

/* ── Thumbnail — URL publique directe (bucket public) ─────────── */
function VehicleThumb({
	vehicle,
	className,
}: {
	vehicle: Vehicle;
	className: string;
}) {
	const displayUrl =
		vehicle.thumbnailUrl ??
		vehicle.vehicleImages?.[0]?.url ??
		vehicle.images?.[0];
	if (!displayUrl) return <Car size={14} className="text-slate-500" />;
	// eslint-disable-next-line @next/next/no-img-element
	return <img src={displayUrl} alt="" className={className} />;
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function AdminVehiclesPage() {
	const router = useRouter();
	const { data: fetchedVehicles = [], isLoading, isFetching } = useAdminVehiclesList();
	const [localVehicles, setLocalVehicles] = useState<Vehicle[] | null>(null);
	const loading = isLoading;
	// localVehicles sert aux optimistic updates (delete/status) sans perdre le cache RQ
	const vehicles = localVehicles ?? fetchedVehicles;
	const [inputValue, setInputValue] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [filterBrand, setFilterBrand] = useState("");
	const [filterYear, setFilterYear] = useState("");
	const [filterPriceMax, setFilterPriceMax] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [sortBy, setSortBy] = useState<SortKey>("date-desc");
	const [page, setPage] = useState<number>(() => {
		if (typeof window === "undefined") return 1;
		return Number(sessionStorage.getItem("admin-vehicles-page")) || 1;
	});
	const [showFilters, setShowFilters] = useState(false);
	const t = useAdminTokens();
	const isFirstRender = useRef(true);
	const scrollRestored = useRef(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Debounce: met à jour debouncedSearch 300ms après la dernière frappe
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(inputValue.trim()), 300);
		return () => clearTimeout(timer);
	}, [inputValue]);

	const clearSearch = useCallback(() => {
		setInputValue("");
		setDebouncedSearch("");
		searchInputRef.current?.focus();
	}, []);

	const navigateToVehicle = useCallback(
		(id: string) => {
			sessionStorage.setItem("admin-vehicles-scroll", String(window.scrollY));
			router.push(`/admin/vehicules/${id}/modifier`);
		},
		[router],
	);

	// Persist page across navigations
	useEffect(() => {
		sessionStorage.setItem("admin-vehicles-page", String(page));
	}, [page]);

	// Reset page when filters/search change — skip initial mount to preserve stored page
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		setPage(1);
	}, [debouncedSearch, filterBrand, filterYear, filterPriceMax, filterStatus, sortBy]);

	// Restore scroll position once data is loaded
	useEffect(() => {
		if (isLoading || scrollRestored.current) return;
		scrollRestored.current = true;
		const saved = Number(sessionStorage.getItem("admin-vehicles-scroll") ?? 0);
		if (saved > 0) {
			requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: "instant" }));
		}
	}, [isLoading]);

	const availableBrands = useMemo(
		() => Array.from(new Set(vehicles.map((v) => v.brand))).sort(),
		[vehicles],
	);

	const filtered = useMemo(() => {
		let list = vehicles.filter((v) => {
			const q = `${v.brand} ${v.model} ${v.year}`.toLowerCase();
			if (debouncedSearch && !q.includes(debouncedSearch.toLowerCase())) return false;
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
		debouncedSearch,
		filterBrand,
		filterYear,
		filterPriceMax,
		filterStatus,
		sortBy,
	]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_PER_PAGE));
	const safePage = Math.min(page, totalPages);
	const paginated = filtered.slice(
		(safePage - 1) * ADMIN_PER_PAGE,
		safePage * ADMIN_PER_PAGE,
	);
	const hasActiveFilters = !!(
		filterBrand ||
		filterYear ||
		filterPriceMax ||
		filterStatus
	);

	const handleDelete = (id: string) => {
		setLocalVehicles((prev) => (prev ?? fetchedVehicles).filter((v) => v.id !== id));
		setDeleteConfirm(null);
		deleteVehicleAction(id).catch(console.error);
	};

	const handleStatusChange = (id: string, status: VehicleStatus) => {
		setLocalVehicles((prev) =>
			(prev ?? fetchedVehicles).map((v) =>
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
								"absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
								inputValue ? "text-brand-500" : t.txtSubtle,
							)}
							aria-hidden="true"
						/>
						<input
							ref={searchInputRef}
							id="admin-vehicle-search"
							name="vehicle-search"
							type="text"
							autoComplete="off"
							spellCheck={false}
							placeholder="Rechercher un véhicule…"
							aria-label="Rechercher un véhicule par marque, modèle ou année"
							aria-controls="vehicle-list"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Escape") clearSearch();
							}}
							className={clsx(
								"w-full border focus:border-brand-500 rounded-xl pl-11 py-3 outline-none transition-all text-sm",
								inputValue ? "pr-9" : "pr-4",
								t.inputBg,
								t.inputBorder,
								t.inputText,
								t.inputPlaceholder,
							)}
						/>
						{inputValue && (
							<button
								type="button"
								onClick={clearSearch}
								aria-label="Effacer la recherche"
								className={clsx(
									"absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors",
									t.txtSubtle,
									t.hoverBgStrong,
								)}
							>
								<X size={14} aria-hidden="true" />
							</button>
						)}
					</div>
					<button
						onClick={() => setShowFilters((v) => !v)}
						className={clsx(
							"flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors",
							showFilters || hasActiveFilters
								? "bg-brand-600 text-white border-brand-600 hover:bg-brand-700"
								: clsx(
										t.surface,
										t.border,
										t.txtMuted,
										t.hoverBgStrong,
										t.hoverTxt,
									),
						)}
					>
						<SlidersHorizontal size={15} />
						<span className="hidden sm:inline">Filtres</span>
						{hasActiveFilters && (
							<span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-medium">
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

				{/* ── Mobile list ─────────────────────────────────── */}
				<div id="vehicle-list" className="md:hidden">
					{loading ? (
						<div className={clsx("rounded-2xl border overflow-hidden divide-y", t.surface, t.border, t.isDark ? "divide-dark-800" : "divide-slate-100")}>
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
									<div className={clsx("w-12 h-10 rounded-lg flex-shrink-0", t.isDark ? "bg-dark-800" : "bg-slate-200")} />
									<div className="flex-1 space-y-1.5">
										<div className={clsx("h-3.5 rounded-lg w-2/3", t.isDark ? "bg-dark-700" : "bg-slate-200")} />
										<div className={clsx("h-3 rounded-lg w-1/2", t.isDark ? "bg-dark-700" : "bg-slate-100")} />
									</div>
									<div className="space-y-1.5 items-end flex flex-col">
										<div className={clsx("h-3.5 rounded-lg w-16", t.isDark ? "bg-dark-700" : "bg-slate-200")} />
										<div className={clsx("h-3 rounded-xl w-12", t.isDark ? "bg-dark-700" : "bg-slate-100")} />
									</div>
								</div>
							))}
						</div>
					) : paginated.length === 0 ? (
						<div className="text-center py-16">
							<Car size={40} className={clsx("mx-auto mb-3", t.txtFaint)} />
							<p className={clsx("text-sm", t.txtSubtle)}>Aucun véhicule trouvé</p>
						</div>
					) : (
						<div className={clsx("rounded-2xl border overflow-hidden", t.surface, t.border)}>
							{paginated.map((vehicle) => (
								<div key={vehicle.id} className={clsx("border-b last:border-0", t.border)}>
									{/* Main row — tap to edit */}
									<div
										role="button"
										tabIndex={0}
										onClick={() => navigateToVehicle(vehicle.id)}
										onKeyDown={(e) => e.key === "Enter" && navigateToVehicle(vehicle.id)}
										className={clsx(
											"flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500",
											t.tableRowHover,
										)}
									>
										<div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700 flex items-center justify-center">
											<VehicleThumb vehicle={vehicle} className="w-full h-full object-cover" />
										</div>
										<div className="flex-1 min-w-0">
											<p className={clsx("font-normal text-sm truncate flex items-center gap-1", t.txt)}>
												{vehicle.featured && (
													<Star size={10} className="text-amber-400 flex-shrink-0" aria-hidden="true" />
												)}
												{vehicle.brand} {vehicle.model}
											</p>
											<p className={clsx("text-xs mt-0.5 truncate", t.txtSubtle)}>
												{vehicle.year} · {vehicle.mileage.toLocaleString("fr-FR")} km · {vehicle.fuel}
											</p>
										</div>
										<div className="flex flex-col items-end gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
											<span className="font-heading font-medium text-brand-400 text-sm">
												{vehicle.price.toLocaleString("fr-FR")} €
											</span>
											<StatusSelect
												vehicleId={vehicle.id}
												current={vehicle.status ?? "draft"}
												onChange={handleStatusChange}
											/>
										</div>
									</div>
									{/* Action bar */}
									<div
										onClick={(e) => e.stopPropagation()}
										className={clsx("flex items-center border-t", t.border)}
									>
										<Link
											href={`/vehicules/${vehicle.id}`}
											target="_blank"
											className={clsx(actionBtn, t.hoverTxt, "py-2")}
										>
											<Eye size={13} aria-hidden="true" /> Voir
										</Link>
										<Link
											href={`/admin/vehicules/${vehicle.id}/modifier`}
											className={clsx(actionBtn, "hover:text-blue-500", "py-2")}
										>
											<Pencil size={13} aria-hidden="true" /> Modifier
										</Link>
										{deleteConfirm === vehicle.id ? (
											<div className="flex-1 flex items-center gap-1 px-2 py-1.5">
												<button
													onClick={() => handleDelete(vehicle.id)}
													className={clsx("flex-1", adminUI.btnDangerSm)}
												>
													Confirmer
												</button>
												<button
													onClick={() => setDeleteConfirm(null)}
													className={clsx("px-2 py-1.5 text-xs rounded-lg transition-colors", t.txtSubtle, t.hoverTxt)}
												>
													✕
												</button>
											</div>
										) : (
											<button
												onClick={() => setDeleteConfirm(vehicle.id)}
												className={clsx(actionBtn, "hover:text-red-500", "py-2")}
											>
												<Trash2 size={13} aria-hidden="true" /> Supprimer
											</button>
										)}
									</div>
								</div>
							))}
						</div>
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
								{loading ? (
									Array.from({ length: 6 }).map((_, i) => (
										<tr key={i} className={clsx("border-b last:border-0 animate-pulse", t.border)}>
											<td className="px-3 py-3"><div className={clsx("w-12 h-10 rounded-lg", t.isDark ? "bg-dark-800" : "bg-slate-200")} /></td>
											<td className="px-5 py-4"><div className={clsx("h-4 rounded-lg w-40 mb-1.5", t.isDark ? "bg-dark-800" : "bg-slate-200")} /><div className={clsx("h-3 rounded-lg w-28", t.isDark ? "bg-dark-700" : "bg-slate-100")} /></td>
											<td className="px-5 py-4"><div className={clsx("h-4 rounded-lg w-16", t.isDark ? "bg-dark-800" : "bg-slate-200")} /></td>
											<td className="px-5 py-4"><div className={clsx("h-4 rounded-lg w-20", t.isDark ? "bg-dark-800" : "bg-slate-200")} /></td>
											<td className="px-5 py-4"><div className={clsx("h-6 rounded-xl w-24", t.isDark ? "bg-dark-800" : "bg-slate-200")} /></td>
											<td className="px-5 py-4"><div className={clsx("h-3 rounded-lg w-16", t.isDark ? "bg-dark-800" : "bg-slate-200")} /></td>
											<td className="px-5 py-4"><div className={clsx("h-8 rounded-lg w-20", t.isDark ? "bg-dark-800" : "bg-slate-200")} /></td>
										</tr>
									))
								) : paginated.map((vehicle) => (
									<tr
										key={vehicle.id}
										tabIndex={0}
										onClick={() => navigateToVehicle(vehicle.id)}
										onKeyDown={(e) => e.key === "Enter" && navigateToVehicle(vehicle.id)}
										className={clsx(
											"border-b last:border-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500",
											t.border,
											t.tableRowHover,
										)}
									>
										<td className="px-3 py-3">
											<div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
												<VehicleThumb
													vehicle={vehicle}
													className="w-full h-full object-cover"
												/>
											</div>
										</td>
										<td className="px-5 py-4">
											<div>
												<div
													className={clsx(
														"font-normal text-brand-500 text-sm flex items-center gap-1.5",
													)}
												>
													{vehicle.featured && (
														<Star
															size={11}
															className="text-amber-500 flex-shrink-0"
														/>
													)}
													{vehicle.brand}{" "}
													{vehicle.model}
													{vehicle.features?.[
														"Finition"
													] && (
														<span className="text-brand-500 text-xs font-normal ml-1">
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
													{vehicle.color ? `${vehicle.color} · ` : ""}{vehicle.transmission} ·{" "}
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
										<td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
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
										<td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
											<div className="flex items-center gap-1">
												<Link
													href={`/vehicules/${vehicle.id}`}
													target="_blank"
													aria-label={`Prévisualiser ${vehicle.brand} ${vehicle.model}`}
													className={clsx(
														"p-2 rounded-lg transition-colors",
														t.txtMuted,
														t.hoverBgStrong,
														t.hoverTxt,
													)}
												>
													<Eye size={15} aria-hidden="true" />
												</Link>
												<Link
													href={`/admin/vehicules/${vehicle.id}/modifier`}
													aria-label={`Modifier ${vehicle.brand} ${vehicle.model}`}
													className={clsx(
														"p-2 rounded-lg transition-colors",
														t.txtMuted,
														t.hoverBgStrong,
														"hover:text-blue-500",
													)}
												>
													<Pencil size={15} aria-hidden="true" />
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
														aria-label={`Supprimer ${vehicle.brand} ${vehicle.model}`}
														className={clsx(
															"p-2 rounded-lg transition-colors",
															t.txtMuted,
															t.hoverBgStrong,
															"hover:text-red-500",
														)}
													>
														<Trash2 size={15} aria-hidden="true" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
								{!loading && paginated.length === 0 && (
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
							Page {safePage} / {totalPages} · {filtered.length}{" "}
							résultats
						</p>
						<div className="flex items-center gap-1">
							<button
								onClick={() =>
									setPage((p) => Math.max(1, p - 1))
								}
								disabled={safePage === 1}
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
										Math.min(safePage - 2, totalPages - 4),
									);
									const p = start + i;
									return (
										<button
											key={p}
											onClick={() => setPage(p)}
											className={clsx(
												"w-9 h-9 rounded-xl text-sm border transition-colors",
												p === safePage
													? "text-pink-700 border-gray-600"
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
								disabled={safePage === totalPages}
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
