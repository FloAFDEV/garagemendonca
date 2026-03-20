"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
	ChevronDown,
	X,
	SlidersHorizontal,
	Check,
	RotateCcw,
} from "lucide-react";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";

export type SortOption = "price-asc" | "price-desc" | "km-asc" | "year-desc";

export interface FilterState {
	brands: string[];
	fuels: string[];
	kmMax: number | null;
	priceMax: number | null;
	sortBy: SortOption;
}

export const INITIAL_FILTERS: FilterState = {
	brands: [],
	fuels: [],
	kmMax: null,
	priceMax: null,
	sortBy: "price-asc",
};

interface VehicleFiltersProps {
	filters: FilterState;
	onChange: (f: FilterState) => void;
	availableBrands: string[];
	availableFuels: string[];
	totalCount: number;
	filteredCount: number;
}

/* Options statiques */
const KM_OPTIONS = [
	{ label: "Tous kilométrages", value: null },
	{ label: "Moins de 30 000 km", value: 30000 },
	{ label: "Moins de 50 000 km", value: 50000 },
	{ label: "Moins de 80 000 km", value: 80000 },
	{ label: "Moins de 100 000 km", value: 100000 },
];

const PRICE_OPTIONS = [
	{ label: "Tous les prix", value: null },
	{ label: "Moins de 8 000 €", value: 8000 },
	{ label: "Moins de 10 000 €", value: 10000 },
	{ label: "Moins de 12 000 €", value: 12000 },
	{ label: "Moins de 15 000 €", value: 15000 },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
	{ label: "Prix croissant", value: "price-asc" },
	{ label: "Prix décroissant", value: "price-desc" },
	{ label: "Kilométrage croissant", value: "km-asc" },
	{ label: "Plus récent", value: "year-desc" },
];

/* Sous-composant : Logo avec fallback intelligent */
function BrandLogo({ brand }: { brand: string }) {
	const normalized =
		brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
	const logoPath = BRAND_LOGO_MAP[normalized] || BRAND_LOGO_MAP[brand];

	if (!logoPath) {
		return (
			<span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0 border border-slate-50 uppercase">
				{brand.slice(0, 2)}
			</span>
		);
	}

	return (
		<div className="w-8 h-8 relative flex-shrink-0">
			<Image src={logoPath} alt="" fill className="object-contain" />
		</div>
	);
}

/* Dropdown Générique */
function Dropdown({
	label,
	active,
	children,
	badge,
}: {
	label: string;
	active?: boolean;
	children: React.ReactNode;
	badge?: number;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node))
				setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
					active
						? "bg-brand-500 text-white border-brand-500 shadow-md"
						: "bg-white text-slate-700 border-slate-200 hover:border-brand-300"
				}`}
			>
				{label}
				{badge ? (
					<span className="w-5 h-5 rounded-full bg-white text-brand-600 text-[10px] flex items-center justify-center font-black">
						{badge}
					</span>
				) : null}
				<ChevronDown
					size={14}
					className={`transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl min-w-[240px] overflow-hidden animate-in fade-in slide-in-from-top-2">
					{children}
				</div>
			)}
		</div>
	);
}

export default function VehicleFilters({
	filters,
	onChange,
	availableBrands,
	availableFuels,
	totalCount,
	filteredCount,
}: VehicleFiltersProps) {
	const [mobileOpen, setMobileOpen] = useState(false);

	const set = useCallback(
		<K extends keyof FilterState>(key: K, value: FilterState[K]) =>
			onChange({ ...filters, [key]: value }),
		[filters, onChange],
	);

	const toggleBrand = (brand: string) => {
		const next = filters.brands.includes(brand)
			? filters.brands.filter((b) => b !== brand)
			: [...filters.brands, brand];
		set("brands", next);
	};

	const toggleFuel = (fuel: string) => {
		const next = filters.fuels.includes(fuel)
			? filters.fuels.filter((f) => f !== fuel)
			: [...filters.fuels, fuel];
		set("fuels", next);
	};

	const activeCount =
		filters.brands.length +
		filters.fuels.length +
		(filters.kmMax ? 1 : 0) +
		(filters.priceMax ? 1 : 0);
	const isFiltered = activeCount > 0;

	return (
		<div className="mb-8 space-y-4">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<p className="text-sm font-bold text-slate-800 uppercase tracking-tight">
						<span className="text-brand-600 text-lg">
							{filteredCount}
						</span>{" "}
						véhicules disponibles
					</p>
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm"
					>
						<SlidersHorizontal size={16} /> Filtres{" "}
						{activeCount > 0 && `(${activeCount})`}
					</button>
				</div>

				<div
					className={`${mobileOpen ? "flex" : "hidden"} sm:flex flex-wrap items-center gap-3`}
				>
					{/* Dropdown Marques Filtrées */}
					<Dropdown
						label="Marques"
						active={filters.brands.length > 0}
						badge={filters.brands.length || undefined}
					>
						<ul className="max-h-64 overflow-y-auto py-2 px-1">
							{availableBrands.map((brand) => (
								<li key={brand}>
									<button
										onClick={() => toggleBrand(brand)}
										className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
									>
										<BrandLogo brand={brand} />
										<span
											className={`flex-1 text-sm font-semibold ${filters.brands.includes(brand) ? "text-brand-600" : "text-slate-700"}`}
										>
											{brand}
										</span>
										{filters.brands.includes(brand) && (
											<Check
												size={14}
												className="text-brand-500"
											/>
										)}
									</button>
								</li>
							))}
						</ul>
					</Dropdown>

					<Dropdown
						label="Prix max"
						active={filters.priceMax !== null}
					>
						<ul className="py-2 px-1">
							{PRICE_OPTIONS.map((opt) => (
								<li key={opt.label}>
									<button
										onClick={() =>
											set("priceMax", opt.value)
										}
										className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 rounded-lg"
									>
										{opt.label}
									</button>
								</li>
							))}
						</ul>
					</Dropdown>

					<Dropdown
						label="Kilométrage"
						active={filters.kmMax !== null}
					>
						<ul className="py-2 px-1">
							{KM_OPTIONS.map((opt) => (
								<li key={opt.label}>
									<button
										onClick={() => set("kmMax", opt.value)}
										className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 rounded-lg"
									>
										{opt.label}
									</button>
								</li>
							))}
						</ul>
					</Dropdown>

					{/* Carburants disponibles */}
					<div className="flex items-center gap-2">
						{availableFuels.map((fuel) => (
							<button
								key={fuel}
								onClick={() => toggleFuel(fuel)}
								className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
									filters.fuels.includes(fuel)
										? "bg-slate-800 text-white border-slate-800"
										: "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
								}`}
							>
								{fuel}
							</button>
						))}
					</div>

					<div className="flex-1 min-w-[140px]">
						<select
							value={filters.sortBy}
							onChange={(e) =>
								set("sortBy", e.target.value as SortOption)
							}
							className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 ring-brand-500/20 outline-none appearance-none"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{isFiltered && (
						<button
							onClick={() => onChange(INITIAL_FILTERS)}
							className="p-3 text-slate-400 hover:text-red-500 transition-colors"
						>
							<RotateCcw size={18} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
