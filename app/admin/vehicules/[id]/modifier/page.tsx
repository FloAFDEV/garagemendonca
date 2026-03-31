"use client";

import { useState, use, useRef, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demoStore";
import VehicleOptionsForm from "@/components/admin/VehicleOptionsForm";
import SortablePhotoGrid from "@/components/admin/SortablePhotoGrid";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import type { VehicleOptions } from "@/types";
import type { Vehicle } from "@/types";
import {
	Camera,
	Images,
	X,
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
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";

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
	description: string;
	status: string;
	published_at: string;
	featured: boolean;
	garantie: string;
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
}: {
	value: string;
	onChange: (v: string) => void;
	suggestions: string[];
	placeholder?: string;
	inputClass: string;
	error?: string;
	required?: boolean;
	id?: string;
	/** Si fourni, affiche le logo de marque dans la liste et dans l'input */
	logoMap?: Record<string, string>;
}) {
	const t = useAdminTokens();
	const [open, setOpen] = useState(false);
	const filtered = value
		? suggestions.filter((s) =>
				s.toLowerCase().includes(value.toLowerCase()),
			)
		: suggestions;

	return (
		<div className="relative">
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
					(error ? " border-red-500 focus:border-red-500" : "")
				}
			/>
			{open && filtered.length > 0 && (
				<div
					className={`absolute left-0 top-full mt-1 w-full z-50 ${t.dropdownBg} border ${t.dropdownBorder} rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto`}
				>
					{filtered.slice(0, 10).map((s) => (
						<button
							key={s}
							type="button"
							onMouseDown={() => {
								onChange(s);
								setOpen(false);
							}}
							className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${t.dropdownItemHover} ${
								s === value
									? `${t.txt} bg-brand-500/10 font-medium`
									: t.dropdownItemTxt
							}`}
						>
							{s}
						</button>
					))}
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
	const { getVehicle, updateVehicle } = useDemoStore();

	const vehicle = getVehicle(id);

	const [form, setForm] = useState<VehicleForm>(() => {
		if (!vehicle)
			return {
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
				options: {},
			};
		return {
			brand: vehicle.brand,
			model: vehicle.model,
			finition: (Array.isArray(vehicle.features?.["Finition"]) ? vehicle.features!["Finition"][0] : vehicle.features?.["Finition"]) ?? "",
			year: vehicle.year.toString(),
			mileage: vehicle.mileage.toString(),
			fuel: vehicle.fuel,
			transmission: vehicle.transmission,
			power: vehicle.power.toString(),
			critAir: vehicle.critAir ?? "",
			price: vehicle.price.toString(),
			color: vehicle.color,
			doors: vehicle.doors.toString(),
			description: vehicle.description,
			status: vehicle.status ?? "draft",
			published_at: vehicle.published_at ?? "",
			featured: vehicle.featured ?? false,
			garantie: (Array.isArray(vehicle.features?.["Garantie"]) ? vehicle.features!["Garantie"][0] : vehicle.features?.["Garantie"]) ?? "",
			options: vehicle.options ?? {},
		};
	});

	const [images, setImages] = useState<string[]>(vehicle?.images ?? []);
	const [errors, setErrors] = useState<FormErrors>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	// ── Not found ────────────────────────────────────────────────────

	if (!vehicle) {
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

	// ── Image upload ─────────────────────────────────────────────────

	const handleFiles = useCallback((files: FileList | null) => {
		if (!files || files.length === 0) return;
		Array.from(files).forEach((file) => {
			const url = URL.createObjectURL(file);
			setImages((p) => [...p, url]);
		});
	}, []);


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
			return;
		}
		setSaveStatus("saving");
		await new Promise((r) => setTimeout(r, 900));
		updateVehicle(id, {
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
			description: form.description,
			images,
			status: form.status as Vehicle["status"],
			published_at: form.published_at || undefined,
			featured: form.featured,
			critAir: form.critAir || undefined,
			options: form.options,
			features: {
				...(vehicle.features ?? {}),
				...(form.finition ? { Finition: form.finition } : {}),
				...(form.garantie ? { Garantie: form.garantie } : {}),
			},
		});
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
					<div className="min-w-0 flex-1">
						<h2
							className={`font-heading font-medium ${t.txt} text-2xl`}
						>
							Modifier le véhicule
						</h2>
						<p className={`${t.txtMuted} text-sm mt-1 truncate`}>
							{vehicle.brand} {vehicle.model} · {vehicle.year} · #
							{vehicle.id}
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
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
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
						</div>
						<div
							className={`flex items-center gap-3 mt-5 pt-5 border-t ${t.border}`}
						>
							<input
								id="featured-edit"
								name="featured"
								type="checkbox"
								checked={form.featured}
								onChange={handleChange}
								className="w-4 h-4 accent-brand-500 cursor-pointer"
							/>
							<label
								htmlFor="featured-edit"
								className={`text-sm ${t.txtMuted} cursor-pointer select-none flex items-center gap-1.5`}
							>
								<Star size={13} className="text-amber-400" />
								Mettre en avant sur la page d&apos;accueil
							</label>
						</div>
					</div>

					{/* ── Informations générales ─────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-6 tracking-widest`}
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
									type="number"
									required
									min="1980"
									max={new Date().getFullYear() + 1}
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
									type="number"
									required
									min="0"
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
							<div>
								<label className={labelClass}>
									Puissance (ch){" "}
									<span className="text-brand-500">*</span>
								</label>
								<input
									name="power"
									type="number"
									min="0"
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
								<label className={labelClass}>Crit&apos;Air</label>
								<select
									name="critAir"
									value={form.critAir}
									onChange={handleChange}
									className={selectClass}
								>
									<option value="">— Non renseigné</option>
									{["0","1","2","3","4","5"].map((c) => (
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
						<div className="max-w-xs">
							<label className={labelClass}>
								Prix (€){" "}
								<span className="text-brand-500">*</span>
							</label>
							<div className="relative">
								<input
									name="price"
									type="number"
									required
									min="1"
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

					{/* ── Photos ─────────────────────────────────────────── */}
					<div className={sectionClass}>
						<h3
							className={`font-heading font-normal ${t.txt} mb-2 tracking-widest`}
						>
							Photos
						</h3>
						<p className={`${t.txtSubtle} text-xs mb-5`}>
							La première photo est l&apos;image principale.
							Cliquez pour définir une autre photo comme
							principale.
						</p>
						<div className="flex flex-wrap gap-3 mb-5">
							<button
								type="button"
								onClick={() => cameraInputRef.current?.click()}
								className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
							>
								<Camera size={16} />
								Prendre une photo
							</button>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className={`flex items-center gap-2 ${t.surface3} ${t.hoverBgStrong} active:scale-95 ${t.txt} px-4 py-2.5 rounded-xl transition-all text-sm font-medium`}
							>
								<Images size={16} />
								Choisir depuis la galerie
							</button>
							<input
								ref={cameraInputRef}
								type="file"
								accept="image/*"
								capture="environment"
								className="hidden"
								onChange={(e) => handleFiles(e.target.files)}
							/>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={(e) => handleFiles(e.target.files)}
							/>
						</div>
						{images.length > 0 ? (
							<SortablePhotoGrid
								images={images}
								onChange={setImages}
							/>
						) : (
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className={`w-full border-2 border-dashed ${t.borderMuted} hover:border-brand-500/50 rounded-xl py-12 text-center transition-colors group`}
							>
								<Images
									size={32}
									className={`${t.txtFaint} group-hover:text-brand-500/50 mx-auto mb-3 transition-colors`}
								/>
								<p className={`${t.txtSubtle} text-sm`}>
									Cliquez pour ajouter des photos
								</p>
							</button>
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
									Enregistrer les modifications
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
}
