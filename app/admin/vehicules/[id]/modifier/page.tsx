"use client";

import { useState, use, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import {
	getAdminVehicleById,
	saveVehicle,
	getFeaturedCount,
} from "@/app/admin/vehicules/actions";
import { DescriptionEditor } from "@/components/admin/DescriptionEditor";
import { MAX_FEATURED_VEHICLES as MAX_FEATURED } from "@/lib/config/vehicles";
import VehicleOptionsForm from "@/components/admin/VehicleOptionsForm";
import SortablePhotoGrid from "@/components/admin/SortablePhotoGrid";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import type { VehicleOptions } from "@/types";
import type { Vehicle } from "@/types";
import {
	Save,
	ArrowLeft,
	CheckCircle2,
	Loader2,
	AlertCircle,
	Star,
	Eye,
} from "lucide-react";
import Link from "next/link";
import { BRANDS_MODELS, ALL_BRANDS } from "@/lib/brandsModels";
import { BRAND_LOGO_MAP, getLogoSrc } from "@/lib/brandLogos";
import { getVehicleImages } from "@/lib/utils/vehicle-images";
import { parseDescriptionToOptions } from "@/lib/utils/parse-description-options";
import ImageUploadZone from "@/components/admin/ImageUploadZone";
import { syncVehicleImages } from "@/lib/safe-actions/image.actions";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";

// ── Static data (marques/modèles → @/lib/brandsModels) ──────────────────

const COLORS = [
	"Blanc",
	"Noir",
	"Gris",
	"Gris Anthracite",
	"Argent",
	"Rouge",
	"Bleu",
	"Bleu Marine",
	"Vert",
	"Bordeaux",
	"Beige",
	"Marron",
	"Orange",
	"Jaune",
];

const fuelOptions = [
	"Essence",
	"Diesel",
	"Hybride",
	"Électrique",
	"GPL",
] as const;
const transmissionOptions = ["Manuelle", "Automatique"] as const;
const statusOptions = [
	{ value: "published", label: "Publié", color: "text-emerald-400" },
	{ value: "draft", label: "Brouillon", color: "text-slate-400" },
	{ value: "scheduled", label: "Programmé", color: "text-blue-400" },
	{ value: "sold", label: "Vendue", color: "text-red-400" },
] as const;

// ── Form types ─────────────────────────────────────────────────────

interface VehicleForm {
	brand: string;
	model: string;
	finition: string;
	year: string;
	mileage: string;
	fuel: string;
	transmission: string;
	power: string;
	critAir: string;
	price: string;
	color: string;
	doors: string;
	description: string; // = description_marketing en base (texte propre sans liste d'options)
	status: string;
	published_at: string;
	featured: boolean;
	garantie: string;
	scheduledLabel: "en_preparation" | "en_arrivage" | "";
	options: VehicleOptions;
}

interface FormErrors {
	brand?: string;
	model?: string;
	year?: string;
	mileage?: string;
	power?: string;
	price?: string;
	color?: string;
}

// ── Combobox ───────────────────────────────────────────────────────

function Combobox({
	value,
	onChange,
	suggestions,
	placeholder,
	inputClass,
	error,
	required,
	id,
	logoMap,
	freeInput = false,
}: {
	value: string;
	onChange: (v: string) => void;
	suggestions: string[];
	placeholder?: string;
	inputClass: string;
	error?: string;
	required?: boolean;
	id?: string;
	logoMap?: Record<string, string>;
	freeInput?: boolean;
}) {
	const t = useAdminTokens();
	const [open, setOpen] = useState(false);
	const filtered = value
		? suggestions.filter((s) =>
				s.toLowerCase().includes(value.toLowerCase()),
			)
		: suggestions;

	const exactMatch = suggestions.some(
		(s) => s.toLowerCase() === value.toLowerCase(),
	);
	const showFreeOption = freeInput && value.trim() && !exactMatch;
	const hasLogo = !!logoMap && !!value;

	return (
		<div className="relative">
			{hasLogo && (
				<span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 flex items-center justify-center">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={getLogoSrc(value)}
						alt=""
						aria-hidden
						className="max-w-full max-h-full object-contain"
					/>
				</span>
			)}
			<input
				id={id}
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onBlur={() => setTimeout(() => setOpen(false), 160)}
				placeholder={placeholder}
				required={required}
				autoComplete="off"
				className={
					inputClass +
					(hasLogo ? " pl-10" : "") +
					(error ? " border-red-500 focus:border-red-500" : "")
				}
			/>
			{open && (filtered.length > 0 || showFreeOption) && (
				<div
					className={`absolute left-0 top-full mt-1 w-full z-50 ${t.dropdownBg} border ${t.dropdownBorder} rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto`}
				>
					{filtered.slice(0, 14).map((s) => (
						<button
							key={s}
							type="button"
							onMouseDown={() => {
								onChange(s);
								setOpen(false);
							}}
							className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${t.dropdownItemHover} ${
								s === value
									? `${t.txt} bg-brand-500/10 font-medium`
									: t.dropdownItemTxt
							}`}
						>
							{logoMap ? (
								<span className="w-6 h-5 flex-shrink-0 flex items-center justify-center">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={getLogoSrc(s)}
										alt=""
										aria-hidden
										className="max-w-full max-h-full object-contain"
									/>
								</span>
							) : null}
							{s}
						</button>
					))}
					{showFreeOption && (
						<button
							type="button"
							onMouseDown={() => {
								onChange(value.trim());
								setOpen(false);
							}}
							className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-1.5 border-t ${t.dropdownBorder} ${t.dropdownItemHover} text-brand-400`}
						>
							<span className="text-xs">↵</span>
							Utiliser &laquo;&nbsp;{value.trim()}&nbsp;&raquo;
						</button>
					)}
				</div>
			)}
			{error && (
				<p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
					<AlertCircle size={11} />
					{error}
				</p>
			)}
		</div>
	);
}

// ── Page ───────────────────────────────────────────────────────────

export default function EditVehiclePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const t = useAdminTokens();
	const { id } = use(params);
	const router = useRouter();

	const [loadState, setLoadState] = useState<
		"loading" | "ready" | "notfound"
	>("loading");
	const [vehicleLabel, setVehicleLabel] = useState("");
	const [extraFeatures, setExtraFeatures] = useState<Record<string, unknown>>(
		{},
	);

	const [form, setForm] = useState<VehicleForm>({
		brand: "",
		model: "",
		finition: "",
		year: "",
		mileage: "",
		fuel: "Essence",
		transmission: "Manuelle",
		power: "",
		critAir: "",
		price: "",
		color: "",
		doors: "5",
		description: "",
		status: "draft",
		published_at: "",
		featured: false,
		garantie: "",
		scheduledLabel: "",
		options: {},
	});

	const [images, setImages] = useState<string[]>([]);
	const [errors, setErrors] = useState<FormErrors>({});
	const [saveStatus, setSaveStatus] = useState<
		"idle" | "saving" | "saved" | "error"
	>("idle");
	const [featuredCount, setFeaturedCount] = useState<number>(0);
	const initialFeatured = useRef<boolean>(false);

	useEffect(() => {
		getFeaturedCount()
			.then(setFeaturedCount)
			.catch(() => {});
	}, []);

	useEffect(() => {
		getAdminVehicleById(id)
			.then((vehicle) => {
				if (!vehicle) {
					setLoadState("notfound");
					return;
				}
				setVehicleLabel(
					[
						vehicle.brand,
						vehicle.model,
						vehicle.year,
						`${vehicle.mileage} km`,
						vehicle.color || null,
					]
						.filter(Boolean)
						.join(" · "),
				);
				setExtraFeatures(vehicle.features ?? {});

				// Si description_marketing est déjà peuplée (backfill fait), on l'utilise.
				// Sinon on parse description brute pour extraire les options à la volée.
				let displayDescription: string;
				let mergedOptions: VehicleOptions;
				if (vehicle.description_marketing != null) {
					displayDescription = vehicle.description_marketing;
					mergedOptions = { ...(vehicle.options ?? {}) };
				} else {
					const { detectedOptions, remainingText } =
						parseDescriptionToOptions(vehicle.description ?? "");
					displayDescription = remainingText;
					mergedOptions = {
						...(vehicle.options ?? {}),
						...detectedOptions,
					};
				}

				setForm({
					brand: vehicle.brand,
					model: vehicle.model,
					finition:
						(Array.isArray(vehicle.features?.["Finition"])
							? String(vehicle.features!["Finition"][0])
							: String(vehicle.features?.["Finition"] ?? "")) ||
						"",
					year: vehicle.year.toString(),
					mileage: vehicle.mileage.toString(),
					fuel: vehicle.fuel,
					transmission: vehicle.transmission,
					power: vehicle.power.toString(),
					critAir: vehicle.critAir ?? "",
					price: vehicle.price.toString(),
					color: vehicle.color ?? "",
					doors: vehicle.doors.toString(),
					description: displayDescription,
					status: vehicle.status ?? "draft",
					published_at: vehicle.published_at ?? "",
					featured: vehicle.featured ?? false,
					garantie:
						(Array.isArray(vehicle.features?.["Garantie"])
							? String(vehicle.features!["Garantie"][0])
							: String(vehicle.features?.["Garantie"] ?? "")) ||
						"",
					scheduledLabel: (vehicle.features?.["ScheduledLabel"] as "en_preparation" | "en_arrivage" | "") ?? "",
					options: mergedOptions,
				});
				initialFeatured.current = vehicle.featured ?? false;
				setImages(getVehicleImages(vehicle));
				setLoadState("ready");
			})
			.catch(() => setLoadState("notfound"));
	}, [id]);

	// ── Guards ───────────────────────────────────────────────────────

	if (loadState === "loading") {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2
						size={32}
						className="animate-spin text-brand-400"
					/>
				</div>
			</AdminLayout>
		);
	}

	if (loadState === "notfound") {
		return (
			<AdminLayout>
				<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
					<AlertCircle size={48} className="text-red-400" />
					<h2 className={`font-heading font-medium ${t.txt} text-xl`}>
						Véhicule introuvable
					</h2>
					<p className={`${t.txtMuted} text-sm text-center`}>
						L&apos;identifiant{" "}
						<code className="text-brand-400">#{id}</code> ne
						correspond à aucun véhicule.
					</p>
					<Link
						href="/admin/vehicules"
						className="btn-primary text-sm"
					>
						<ArrowLeft size={15} />
						Retour aux annonces
					</Link>
				</div>
			</AdminLayout>
		);
	}

	// ── Helpers ──────────────────────────────────────────────────────

	const set = (name: keyof VehicleForm, value: unknown) =>
		setForm((p) => ({ ...p, [name]: value }));

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		set(name as keyof VehicleForm, type === "checkbox" ? checked : value);
		if (errors[name as keyof FormErrors]) {
			setErrors((p) => ({ ...p, [name]: undefined }));
		}
	};

	// ── Validation ───────────────────────────────────────────────────

	function validate(): FormErrors {
		const e: FormErrors = {};
		if (!form.brand.trim()) e.brand = "La marque est requise";
		if (!form.model.trim()) e.model = "Le modèle est requis";
		const yr = parseInt(form.year);
		if (!yr || yr < 1980 || yr > new Date().getFullYear() + 1)
			e.year = `Année invalide (1980–${new Date().getFullYear()})`;
		if (form.mileage === "" || parseInt(form.mileage) < 0)
			e.mileage = "Kilométrage invalide";
		if (
			form.power === "" ||
			isNaN(parseInt(form.power)) ||
			parseInt(form.power) < 0
		)
			e.power = "Puissance invalide";
		if (!form.price || parseInt(form.price) <= 0)
			e.price = "Prix requis et supérieur à 0";
		return e;
	}

	// ── Submit ───────────────────────────────────────────────────────

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			// Scroll vers le haut pour que les erreurs soient visibles
			const firstErrorKey = Object.keys(errs)[0];
			requestAnimationFrame(() => {
				const el = firstErrorKey
					? (document.getElementById(firstErrorKey) ??
						document.getElementById(`${firstErrorKey}-edit`))
					: null;
				if (el)
					el.scrollIntoView({ behavior: "smooth", block: "center" });
				else window.scrollTo({ top: 0, behavior: "smooth" });
			});
			return;
		}
		setSaveStatus("saving");
		try {
			const httpImages = images.filter((u) => u.startsWith("http"));
			await saveVehicle(id, {
				brand: form.brand,
				model: form.model,
				year: +form.year,
				mileage: +form.mileage,
				fuel: form.fuel as Vehicle["fuel"],
				transmission: form.transmission as Vehicle["transmission"],
				power: +form.power,
				price: +form.price,
				color: form.color,
				doors: +form.doors,
				description_marketing: form.description,
				images: httpImages,
				status: form.status as Vehicle["status"],
				published_at: form.published_at || undefined,
				featured: form.featured,
				critAir: form.critAir || undefined,
				options: form.options,
				features: {
					...extraFeatures,
					...(form.finition ? { Finition: form.finition } : { Finition: undefined }),
					...(form.garantie ? { Garantie: form.garantie } : { Garantie: undefined }),
					ScheduledLabel: form.scheduledLabel || undefined,
				},
			});
			await syncVehicleImages(
				id,
				ACTIVE_GARAGE_ID,
				httpImages,
				`${form.brand} ${form.model}`,
			);
			setSaveStatus("saved");
			setTimeout(() => router.push("/admin/vehicules"), 1200);
		} catch (err) {
			console.error("[handleSubmit] save error:", err);
			setSaveStatus("error");
			setTimeout(() => setSaveStatus("idle"), 4000);
		}
	};

	// ── Styles ───────────────────────────────────────────────────────

	const inputClass = t.inputClass;

	/** Selects : même base + couleur des <option> forcée pour iOS/dark */
	const selectClass = [
		t.inputClass,
		"cursor-pointer [&>option]:bg-white [&>option]:text-black",
	].join(" ");

	const labelClass = t.labelClass;
	const sectionClass = t.sectionCard;
	const modelSuggestions = BRANDS_MODELS[form.brand] ?? [];

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link
						href="/admin/vehicules"
						className={`${t.txtMuted} ${t.hoverTxt} transition-colors p-2 rounded-xl ${t.hoverBg}`}
					>
						<ArrowLeft size={20} />
					</Link>
					<div className="min-w-0 flex-1">
						<h2
							className={`font-heading font-medium ${t.txt} text-xl`}
						>
							Modifier le véhicule
						</h2>
						<p
							className={`${t.txtMuted} text-xl font-medium mt-1 truncate`}
						>
							{vehicleLabel}
						</p>
					</div>
					<Link
						href={`/vehicules/${id}`}
						target="_blank"
						className={`ml-auto flex items-center gap-2 text-sm ${t.txtMuted} ${t.hoverTxt} transition-colors px-3 py-2 rounded-xl ${t.hoverBg}`}
					>
						<Eye size={16} />
						<span className="hidden sm:inline">Prévisualiser</span>
					</Link>
				</div>

				<form onSubmit={handleSubmit} noValidate className="space-y-6">
					{/* ── Statut + mise en avant ─────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-4 tracking-widest`}
						>
							Statut &amp; publication
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div>
								<label className={labelClass}>
									Disponibilité
								</label>
								<select
									name="status"
									value={form.status}
									onChange={handleChange}
									className={selectClass}
								>
									{statusOptions.map(({ value, label }) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
								<p
									className={`text-xs mt-1.5 ${statusOptions.find((s) => s.value === form.status)?.color}`}
								>
									{
										statusOptions.find(
											(s) => s.value === form.status,
										)?.label
									}
								</p>
							</div>
							<div>
								<label className={labelClass}>Garantie</label>
								<select
									name="garantie"
									value={form.garantie}
									onChange={handleChange}
									className={selectClass}
								>
									<option value="">Sans garantie</option>
									<option value="6 mois">6 mois</option>
									<option value="12 mois">12 mois</option>
								</select>
							</div>
							{form.status === "scheduled" && (
								<div className="flex-1">
									<label className={labelClass}>
										Date de publication{" "}
										<span className="text-brand-500">
											*
										</span>
									</label>
									<input
										name="published_at"
										type="datetime-local"
										value={form.published_at}
										onChange={handleChange}
										required
										className={inputClass}
									/>
								</div>
							)}
							{(form.status === "scheduled" || form.status === "published") && (
								<div className="flex-1">
									<label className={labelClass}>
										Badge affiché sur la carte
									</label>
									<div className="flex gap-3 mt-1">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="scheduledLabel"
												value=""
												checked={form.scheduledLabel === ""}
												onChange={handleChange}
												className="accent-brand-600"
											/>
											<span className="text-sm">Aucun</span>
										</label>
										{[
											{ value: "en_preparation", label: "En préparation" },
											{ value: "en_arrivage", label: "En cours d'arrivage" },
										].map((opt) => (
											<label
												key={opt.value}
												className="flex items-center gap-2 cursor-pointer"
											>
												<input
													type="radio"
													name="scheduledLabel"
													value={opt.value}
													checked={form.scheduledLabel === opt.value}
													onChange={handleChange}
													className="accent-brand-600"
												/>
												<span className="text-sm">{opt.label}</span>
											</label>
										))}
									</div>
								</div>
							)}
						</div>
						{/* ── Mise en avant ───────────────────────────────── */}
						<div
							className={`mt-5 pt-5 border-t ${t.border} space-y-4`}
						>
							{/* Mise en avant (max 4) */}
							{(() => {
								const effectiveCount =
									featuredCount -
									(initialFeatured.current ? 1 : 0);
								const atMax =
									effectiveCount >= MAX_FEATURED &&
									!form.featured;
								return (
									<div>
										<div className="flex items-center gap-3">
											<input
												id="featured-edit"
												name="featured"
												type="checkbox"
												checked={form.featured}
												onChange={handleChange}
												disabled={atMax}
												className="w-4 h-4 accent-brand-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
											/>
											<label
												htmlFor="featured-edit"
												className={`text-sm cursor-pointer select-none flex items-center gap-1.5 ${atMax ? "opacity-40 cursor-not-allowed" : t.txtMuted}`}
											>
												<Star
													size={13}
													className="text-amber-400"
												/>
												Mettre en avant sur la page
												d&apos;accueil
												<span
													className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${featuredCount >= MAX_FEATURED ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}
												>
													{featuredCount}/
													{MAX_FEATURED}
												</span>
											</label>
										</div>
										{atMax && (
											<p className="mt-2 ml-7 text-xs text-amber-600 flex items-center gap-1.5">
												<Star
													size={11}
													className="flex-shrink-0"
												/>
												Maximum atteint — retirez une
												annonce mise en avant pour en
												ajouter une autre.
											</p>
										)}
									</div>
								);
							})()}
						</div>
					</div>

					{/* ── Informations générales ─────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-4 tracking-widest`}
						>
							Informations générales
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div>
								<label className={labelClass}>
									Marque{" "}
									<span className="text-brand-500">*</span>
								</label>
								<Combobox
									value={form.brand}
									onChange={(v) => {
										set("brand", v);
										set("model", "");
										setErrors((p) => ({
											...p,
											brand: undefined,
										}));
									}}
									suggestions={ALL_BRANDS}
									placeholder="Peugeot, Renault…"
									inputClass={inputClass}
									error={errors.brand}
									required
									id="brand-edit"
									logoMap={BRAND_LOGO_MAP}
								/>
							</div>
							<div>
								<label className={labelClass}>
									Modèle{" "}
									<span className="text-brand-500">*</span>
								</label>
								<Combobox
									value={form.model}
									onChange={(v) => {
										set("model", v);
										setErrors((p) => ({
											...p,
											model: undefined,
										}));
									}}
									suggestions={modelSuggestions}
									placeholder={
										form.brand
											? "Choisir un modèle…"
											: "Sélectionnez d'abord une marque"
									}
									inputClass={inputClass}
									error={errors.model}
									required
									id="model-edit"
									freeInput
								/>
							</div>
							<div>
								<label className={labelClass}>Finition</label>
								<input
									name="finition"
									type="text"
									placeholder="Comfort+, Sport, Titanium…"
									value={form.finition}
									onChange={handleChange}
									className={inputClass}
								/>
							</div>
							<div>
								<label className={labelClass}>
									Année{" "}
									<span className="text-brand-500">*</span>
								</label>
								<input
									name="year"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									required
									placeholder={String(new Date().getFullYear())}
									value={form.year}
									onChange={handleChange}
									className={
										inputClass +
										(errors.year ? " border-red-500" : "")
									}
								/>
								{errors.year && (
									<p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
										<AlertCircle size={11} />
										{errors.year}
									</p>
								)}
							</div>
							<div>
								<label className={labelClass}>
									Kilométrage{" "}
									<span className="text-brand-500">*</span>
								</label>
								<input
									name="mileage"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									required
									placeholder="45000"
									value={form.mileage}
									onChange={handleChange}
									className={
										inputClass +
										(errors.mileage
											? " border-red-500"
											: "")
									}
								/>
								{errors.mileage && (
									<p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
										<AlertCircle size={11} />
										{errors.mileage}
									</p>
								)}
							</div>
							<div>
								<label className={labelClass}>
									Couleur{" "}
									<span className="text-brand-500">*</span>
								</label>
								<Combobox
									value={form.color}
									onChange={(v) => {
										set("color", v);
										setErrors((p) => ({
											...p,
											color: undefined,
										}));
									}}
									suggestions={COLORS}
									placeholder="Blanc, Gris Anthracite…"
									inputClass={inputClass}
									error={errors.color}
									required
									id="color-edit"
								/>
							</div>
							<div>
								<label className={labelClass}>
									Nombre de portes
								</label>
								<select
									name="doors"
									value={form.doors}
									onChange={handleChange}
									className={selectClass}
								>
									{["2", "3", "4", "5"].map((d) => (
										<option key={d} value={d}>
											{d} portes
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* ── Motorisation ───────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-4 tracking-widest`}
						>
							Motorisation
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
							<div>
								<label className={labelClass}>
									Carburant{" "}
									<span className="text-brand-500">*</span>
								</label>
								<select
									name="fuel"
									value={form.fuel}
									onChange={handleChange}
									className={selectClass}
								>
									{fuelOptions.map((f) => (
										<option key={f} value={f}>
											{f}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className={labelClass}>
									Transmission{" "}
									<span className="text-brand-500">*</span>
								</label>
								<select
									name="transmission"
									value={form.transmission}
									onChange={handleChange}
									className={selectClass}
								>
									{transmissionOptions.map((t_) => (
										<option key={t_} value={t_}>
											{t_}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className={labelClass}>
									Puissance (ch){" "}
									<span className="text-brand-500">*</span>
								</label>
								<input
									name="power"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									placeholder="130"
									value={form.power}
									onChange={handleChange}
									className={
										inputClass +
										(errors.power ? " border-red-500" : "")
									}
								/>
								{errors.power && (
									<p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
										<AlertCircle size={11} />
										{errors.power}
									</p>
								)}
							</div>
							<div>
								<label className={labelClass}>
									Crit&apos;Air
								</label>
								<select
									name="critAir"
									value={form.critAir}
									onChange={handleChange}
									className={selectClass}
								>
									<option value="">— Non renseigné</option>
									{["0", "1", "2", "3", "4", "5"].map((c) => (
										<option key={c} value={c}>
											Classe {c}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* ── Prix ───────────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-4 tracking-widest`}
						>
							Prix de vente
						</h3>
						<div className="max-w-xs">
							<label className={labelClass}>
								Prix (€){" "}
								<span className="text-brand-500">*</span>
							</label>
							<div className="relative">
								<input
									name="price"
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									required
									placeholder="18900"
									value={form.price}
									onChange={handleChange}
									className={
										inputClass +
										" pr-10" +
										(errors.price ? " border-red-500" : "")
									}
								/>
								<span
									className={`absolute right-4 top-1/2 -translate-y-1/2 ${t.txtMuted}`}
								>
									€
								</span>
							</div>
							{errors.price && (
								<p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
									<AlertCircle size={11} />
									{errors.price}
								</p>
							)}
						</div>
					</div>

					{/* ── Description ────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-4 tracking-widest`}
						>
							Description
						</h3>
						<DescriptionEditor
							id="description"
							name="description"
							value={form.description}
							onChange={(v) => set("description", v)}
							minRows={14}
						/>
						<p className={`${t.txtSubtle} text-xs mt-2`}>
							Pour le carnet d&apos;entretien, utiliser le format{" "}
							<code className="bg-slate-700/40 px-1 rounded text-[11px]">
								JJ/MM/AAAA : XX XXX km
							</code>{" "}
							par ligne.
						</p>
					</div>

					{/* ── Photos ─────────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-1 tracking-widest`}
						>
							Photos
						</h3>
						<p className={`${t.txtSubtle} text-xs mb-4`}>
							La première photo est l&apos;image principale · max
							10 · WebP automatique
						</p>
						<ImageUploadZone
							entityId={id}
							type="vehicle"
							onUploaded={(url) => setImages((p) => [...p, url])}
							maxFiles={10}
							currentCount={images.length}
						/>
						{images.length > 0 && (
							<div className="mt-4">
								<SortablePhotoGrid
									images={images}
									onChange={setImages}
								/>
							</div>
						)}
					</div>

					{/* ── Options & Équipements ───────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-4 tracking-widest`}
						>
							Options &amp; Équipements
						</h3>
						<VehicleOptionsForm
							value={form.options}
							onChange={(opts) => set("options", opts)}
						/>
					</div>

					{/* ── Submit ─────────────────────────────────────────── */}
					<div className="flex flex-col gap-3 pt-2 pb-8">
						{saveStatus === "error" && (
							<p className="text-sm text-red-400 flex items-center gap-1.5">
								<AlertCircle size={14} />
								Erreur lors de la sauvegarde — vérifiez votre
								connexion et réessayez.
							</p>
						)}
						<div className="flex items-center justify-between gap-4">
							<Link
								href="/admin/vehicules"
								className="btn-secondary text-sm"
							>
								Annuler
							</Link>
							<button
								type="submit"
								disabled={
									saveStatus === "saving" ||
									saveStatus === "saved"
								}
								aria-busy={saveStatus === "saving"}
								className={`btn-primary text-sm py-3 px-6 sm:px-8 ${saveStatus === "error" ? "!bg-red-600 hover:!bg-red-700" : ""}`}
							>
								{saveStatus === "saving" ? (
									<>
										<Loader2
											size={16}
											className="animate-spin"
										/>
										Enregistrement…
									</>
								) : saveStatus === "saved" ? (
									<>
										<CheckCircle2 size={16} />
										Enregistré !
									</>
								) : saveStatus === "error" ? (
									<>
										<AlertCircle size={16} />
										Réessayer
									</>
								) : (
									<>
										<Save size={16} />
										Enregistrer les modifications
									</>
								)}
							</button>
						</div>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
}
