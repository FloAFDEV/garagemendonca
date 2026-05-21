"use client";

import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import { createVehicleAction, getFeaturedCount } from "@/app/admin/vehicules/actions";
import { MAX_FEATURED_VEHICLES as MAX_FEATURED } from "@/lib/config/vehicles";
import VehicleOptionsForm from "@/components/admin/VehicleOptionsForm";
import SortablePhotoGrid from "@/components/admin/SortablePhotoGrid";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import type { VehicleOptions } from "@/types";
import type { Vehicle } from "@/types";
import { Save, ArrowLeft, CheckCircle2, Loader2, Star, AlertCircle } from "lucide-react";
import Link from "next/link";
import ImageUploadZone from "@/components/admin/ImageUploadZone";
import { syncVehicleImages } from "@/lib/safe-actions/image.actions";
import { BRANDS_MODELS, ALL_BRANDS } from "@/lib/brandsModels";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";
import { BRAND_LOGO_MAP, getLogoSrc } from "@/lib/brandLogos";

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
	{ value: "draft", label: "Brouillon", desc: "Non visible côté public" },
	{ value: "published", label: "Publié", desc: "Visible immédiatement" },
	{
		value: "scheduled",
		label: "Programmé",
		desc: "Visible à la date choisie",
	},
	{ value: "sold", label: "Vendue", desc: "Visible avec badge « Vendue »" },
] as const;

// ── Form types ─────────────────────────────────────────────────────

interface VehicleForm {
	brand: string;
	model: string;
	year: string;
	mileage: string;
	fuel: string;
	transmission: string;
	power: string;
	price: string;
	color: string;
	doors: string;
	description: string;
	vehicleStatus: string;
	published_at: string;
	featured: boolean;
	options: VehicleOptions;
	finition: string;
	critAir: string;
	garantie: string;
}

interface FormErrors {
	brand?: string;
	model?: string;
	year?: string;
	mileage?: string;
	power?: string;
	price?: string;
	color?: string;
	description?: string;
}

const emptyForm: VehicleForm = {
	brand: "",
	model: "",
	year: new Date().getFullYear().toString(),
	mileage: "",
	fuel: "Essence",
	transmission: "Manuelle",
	power: "",
	price: "",
	color: "",
	doors: "5",
	description: "",
	vehicleStatus: "draft",
	published_at: "",
	featured: false,
	options: {},
	finition: "",
	critAir: "",
	garantie: "",
};

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
	/** Affiche le logo de marque (fallback default.svg) */
	logoMap?: Record<string, string>;
	/** Autorise la saisie d'un modèle absent de la liste */
	freeInput?: boolean;
}) {
	const t = useAdminTokens();
	const [open, setOpen] = useState(false);
	const filtered = value
		? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
		: suggestions;

	const exactMatch = suggestions.some(
		(s) => s.toLowerCase() === value.toLowerCase(),
	);
	const showFreeOption = freeInput && value.trim() && !exactMatch;
	const hasLogo = !!logoMap && !!value;

	return (
		<div className="relative">
			{/* Logo dans l'input (réel ou default) */}
			{hasLogo && (
				<span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10 flex items-center justify-center">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={getLogoSrc(value)} alt="" aria-hidden className="max-w-full max-h-full object-contain" />
				</span>
			)}
			<input
				id={id}
				value={value}
				onChange={(e) => { onChange(e.target.value); setOpen(true); }}
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
				<div className={`absolute left-0 top-full mt-1 w-full z-50 ${t.dropdownBg} border ${t.dropdownBorder} rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto`}>
					{filtered.slice(0, 14).map((s) => (
						<button
							key={s}
							type="button"
							onMouseDown={() => { onChange(s); setOpen(false); }}
							className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${t.dropdownItemHover} ${
								s === value ? `${t.txt} bg-brand-500/10 font-medium` : t.dropdownItemTxt
							}`}
						>
							{logoMap ? (
								<span className="w-6 h-5 flex-shrink-0 flex items-center justify-center">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={getLogoSrc(s)} alt="" aria-hidden className="max-w-full max-h-full object-contain" />
								</span>
							) : null}
							{s}
						</button>
					))}
					{showFreeOption && (
						<button
							type="button"
							onMouseDown={() => { onChange(value.trim()); setOpen(false); }}
							className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-1.5 border-t ${t.dropdownBorder} ${t.dropdownItemHover} text-brand-400`}
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

export default function NewVehiclePage() {
	const t = useAdminTokens();
	const router = useRouter();

	const [form, setForm] = useState<VehicleForm>(emptyForm);
	const [images, setImages] = useState<string[]>([]);
	const [errors, setErrors] = useState<FormErrors>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);
	const [featuredCount, setFeaturedCount] = useState<number>(0);

	useEffect(() => {
		getFeaturedCount().then(setFeaturedCount).catch(() => {});
	}, []);

	// ID stable pour le nouveau véhicule — utilisé pour le chemin storage avant création DB
	const vehicleIdRef = useRef(crypto.randomUUID());

	// ── Field helpers ────────────────────────────────────────────────

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
		if (!form.power || parseInt(form.power) <= 0)
			e.power = "Puissance requise";
		if (!form.price || parseInt(form.price) <= 0)
			e.price = "Prix requis et supérieur à 0";
		if (!form.color.trim()) e.color = "La couleur est requise";
		return e;
	}

	// ── Submit ───────────────────────────────────────────────────────

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errs = validate();
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			const first = document.querySelector("[data-error]");
			first?.scrollIntoView({ behavior: "smooth", block: "center" });
			return;
		}
		setSaveStatus("saving");
		const httpImages = images.filter((u) => u.startsWith("http"));
		await createVehicleAction({
			id: vehicleIdRef.current,
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
			status: form.vehicleStatus as Vehicle["status"],
			published_at: form.published_at || undefined,
			featured: form.featured,
			options: form.options,
			critAir: form.critAir || undefined,
			features: {
				...(form.finition ? { Finition: form.finition } : {}),
				...(form.garantie ? { Garantie: form.garantie } : {}),
			},
		});
		// Sync vehicle_images table avec les URLs réelles
		if (httpImages.length > 0) {
			await syncVehicleImages(
				vehicleIdRef.current,
				ACTIVE_GARAGE_ID,
				httpImages,
				`${form.brand} ${form.model}`,
			);
		}
		setSaveStatus("saved");
		setTimeout(() => router.push("/admin/vehicules"), 1200);
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
					<div>
						<h2
							className={`font-heading font-medium ${t.txt} text-2xl`}
						>
							Ajouter un véhicule
						</h2>
						<p className={`${t.txtMuted} text-sm mt-1`}>
							Remplissez les informations du véhicule
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} noValidate className="space-y-6">
					{/* ── Informations générales ─────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
						>
							Informations générales
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div data-error={errors.brand}>
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
									id="brand"
									logoMap={BRAND_LOGO_MAP}
								/>
							</div>
							<div data-error={errors.model}>
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
									id="model"
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
							<div data-error={errors.year}>
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
							<div data-error={errors.mileage}>
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
							<div data-error={errors.color}>
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
									id="color"
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
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
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
							<div data-error={errors.power}>
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
								<label className={labelClass}>Crit’Air</label>
								<select
									name="critAir"
									value={form.critAir}
									onChange={handleChange}
									className={selectClass}
								>
									<option value="">— Non renseigné</option>
									{["0", "1", "2", "3", "4", "5"].map((c) => (
										<option key={c} value={c}>Classe {c}</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* ── Prix ───────────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
						>
							Prix de vente
						</h3>
						<div className="max-w-xs" data-error={errors.price}>
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
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
						>
							Description
						</h3>
						<textarea
							name="description"
							rows={5}
							placeholder="Décrivez le véhicule : état, équipements, historique…"
							value={form.description}
							onChange={handleChange}
							className={inputClass + " resize-none"}
						/>
						<p className={`${t.txtSubtle} text-xs mt-2`}>
							Pour le carnet d&apos;entretien, utiliser le format{" "}
							<code className="bg-slate-700/40 px-1 rounded text-[11px]">JJ/MM/AAAA : XX XXX km</code>{" "}
							par ligne.
						</p>
					</div>

					{/* ── Publication ────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
						>
							Publication
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div>
								<label className={labelClass}>
									Statut{" "}
									<span className="text-brand-500">*</span>
								</label>
								<select
									name="vehicleStatus"
									value={form.vehicleStatus}
									onChange={handleChange}
									className={selectClass}
								>
									{statusOptions.map(({ value, label }) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
								<p className={`${t.txtSubtle} text-xs mt-1.5`}>
									{
										statusOptions.find(
											(o) =>
												o.value === form.vehicleStatus,
										)?.desc
									}
								</p>
							</div>
							{form.vehicleStatus === "scheduled" && (
								<div>
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
						</div>
						{/* ── Mise en avant ───────────────────────────────── */}
						<div className={`mt-5 pt-5 border-t ${t.border} space-y-4`}>
							{/* Mise en avant (max 4) */}
							{(() => {
								const atMax = featuredCount >= MAX_FEATURED && !form.featured;
								return (
									<div>
										<div className="flex items-center gap-3">
											<input
												id="featured-new"
												name="featured"
												type="checkbox"
												checked={form.featured}
												onChange={handleChange}
												disabled={atMax}
												className="w-4 h-4 accent-brand-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
											/>
											<label
												htmlFor="featured-new"
												className={`text-sm cursor-pointer select-none flex items-center gap-1.5 ${atMax ? "opacity-40 cursor-not-allowed" : t.txtMuted}`}
											>
												<Star size={13} className="text-amber-400" />
												Mettre en avant sur la page d&apos;accueil
												<span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${featuredCount >= MAX_FEATURED ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
													{featuredCount}/{MAX_FEATURED}
												</span>
											</label>
										</div>
										{atMax && (
											<p className="mt-2 ml-7 text-xs text-amber-600 flex items-center gap-1.5">
												<Star size={11} className="flex-shrink-0" />
												Maximum atteint — retirez une annonce mise en avant pour en ajouter une autre.
											</p>
										)}
									</div>
								);
							})()}
						</div>
					</div>

					{/* ── Photos ─────────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3 className={`font-heading font-normal ${t.txt} mb-1 tracking-widest`}>
							Photos
						</h3>
						<p className={`${t.txtSubtle} text-xs mb-5`}>
							Max 10 photos · WebP automatique · compression intelligente
						</p>
						<ImageUploadZone
							entityId={vehicleIdRef.current}
							type="vehicle"
							onUploaded={(url) => setImages((p) => [...p, url])}
							maxFiles={10}
							currentCount={images.length}
						/>
						{images.length > 0 && (
							<div className="mt-4">
								<SortablePhotoGrid images={images} onChange={setImages} />
							</div>
						)}
					</div>

					{/* ── Options & Équipements ───────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
						>
							Options &amp; Équipements
						</h3>
						<VehicleOptionsForm
							value={form.options}
							onChange={(opts) => set("options", opts)}
						/>
					</div>

					{/* ── Submit ─────────────────────────────────────────── */}
					<div className="flex items-center justify-between gap-4 pt-2 pb-8">
						<Link
							href="/admin/vehicules"
							className="btn-secondary text-sm"
						>
							Annuler
						</Link>
						<button
							type="submit"
							disabled={saveStatus !== "idle"}
							aria-busy={saveStatus === "saving"}
							className="btn-primary text-sm py-3 px-6 sm:px-8"
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
							) : (
								<>
									<Save size={16} />
									Enregistrer le véhicule
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
}
