"use client";

import { useState, useRef, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/demoStore";
import VehicleOptionsForm from "@/components/admin/VehicleOptionsForm";
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
  Star,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ── Static data ────────────────────────────────────────────────────

const BRANDS_MODELS: Record<string, string[]> = {
  Peugeot: ["108", "208", "308", "408", "508", "2008", "3008", "5008", "Rifter", "Partner"],
  Renault: ["Twingo", "Clio", "Mégane", "Captur", "Kadjar", "Scénic", "Talisman", "Zoé", "Kangoo"],
  Citroën: ["C1", "C3", "C4", "C5 X", "Berlingo", "C3 Aircross", "C5 Aircross"],
  Volkswagen: ["Polo", "Golf", "ID.3", "T-Cross", "T-Roc", "Tiguan", "Passat"],
  Toyota: ["Aygo X", "Yaris", "Yaris Cross", "Corolla", "C-HR", "RAV4"],
  BMW: ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "X1", "X2", "X3", "X5"],
  Mercedes: ["Classe A", "Classe B", "Classe C", "Classe E", "GLA", "GLB", "GLC"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7"],
  Ford: ["Fiesta", "Focus", "Puma", "Kuga", "Mustang Mach-E"],
  Opel: ["Corsa", "Astra", "Crossland", "Grandland", "Mokka"],
  Dacia: ["Sandero", "Duster", "Logan", "Spring", "Jogger"],
  Nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf"],
  Hyundai: ["i10", "i20", "i30", "Tucson", "Kona"],
  Kia: ["Picanto", "Ceed", "Stonic", "Sportage", "EV6"],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  Skoda: ["Fabia", "Octavia", "Karoq", "Kodiaq", "Superb"],
  Fiat: ["500", "Panda", "Tipo", "500X"],
  Volvo: ["V60", "V90", "XC40", "XC60", "XC90"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Suzuki: ["Swift", "Vitara", "SX4 S-Cross", "Jimny"],
  Mini: ["Mini One", "Mini Cooper", "Countryman", "Clubman"],
  Autre: [],
};

const ALL_BRANDS = Object.keys(BRANDS_MODELS).sort();

const COLORS = [
  "Blanc", "Noir", "Gris", "Gris Anthracite", "Argent", "Rouge", "Bleu",
  "Bleu Marine", "Vert", "Bordeaux", "Beige", "Marron", "Orange", "Jaune",
];

const fuelOptions = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"] as const;
const transmissionOptions = ["Manuelle", "Automatique"] as const;
const statusOptions = [
  { value: "draft",     label: "Brouillon",   desc: "Non visible côté public" },
  { value: "published", label: "Publié",       desc: "Visible immédiatement" },
  { value: "scheduled", label: "Programmé",    desc: "Visible à la date choisie" },
  { value: "sold",      label: "Vendu",        desc: "Visible avec badge « Vendu »" },
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
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder?: string;
  inputClass: string;
  error?: string;
  required?: boolean;
  id?: string;
}) {
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
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 160)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={inputClass + (error ? " border-red-500 focus:border-red-500" : "")}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full z-50 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-dark-700 ${
                s === value ? "text-white bg-brand-500/10 font-medium" : "text-dark-200"
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

export default function NewVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useDemoStore();

  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Field helpers ────────────────────────────────────────────────

  const set = (name: keyof VehicleForm, value: unknown) =>
    setForm((p) => ({ ...p, [name]: value }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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

  const removeImage = (idx: number) => {
    setImages((p) => {
      const next = [...p];
      const removed = next.splice(idx, 1)[0];
      if (removed.startsWith("blob:")) URL.revokeObjectURL(removed);
      return next;
    });
  };

  const setMainImage = (idx: number) => {
    if (idx === 0) return;
    setImages((p) => {
      const next = [...p];
      const [chosen] = next.splice(idx, 1);
      return [chosen, ...next];
    });
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
    await new Promise((r) => setTimeout(r, 900));
    addVehicle({
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
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"],
      status: form.vehicleStatus as Vehicle["status"],
      published_at: form.published_at || undefined,
      featured: form.featured,
      options: form.options,
    });
    setSaveStatus("saved");
    setTimeout(() => router.push("/admin/vehicules"), 1200);
  };

  // ── Styles ───────────────────────────────────────────────────────

  const inputClass =
    "w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-dark-300 mb-2";
  const sectionClass = "bg-dark-900 rounded-2xl border border-dark-800 p-5 sm:p-6";

  const modelSuggestions = BRANDS_MODELS[form.brand] ?? [];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/vehicules"
            className="text-dark-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-dark-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="font-heading font-medium text-white text-2xl">
              Ajouter un véhicule
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              Remplissez les informations du véhicule
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* ── Informations générales ─────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-6 tracking-widest">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div data-error={errors.brand}>
                <label className={labelClass}>
                  Marque <span className="text-brand-500">*</span>
                </label>
                <Combobox
                  value={form.brand}
                  onChange={(v) => {
                    set("brand", v);
                    set("model", "");
                    setErrors((p) => ({ ...p, brand: undefined }));
                  }}
                  suggestions={ALL_BRANDS}
                  placeholder="Peugeot, Renault…"
                  inputClass={inputClass}
                  error={errors.brand}
                  required
                  id="brand"
                />
              </div>
              <div data-error={errors.model}>
                <label className={labelClass}>
                  Modèle <span className="text-brand-500">*</span>
                </label>
                <Combobox
                  value={form.model}
                  onChange={(v) => {
                    set("model", v);
                    setErrors((p) => ({ ...p, model: undefined }));
                  }}
                  suggestions={modelSuggestions}
                  placeholder={form.brand ? "Choisir un modèle…" : "Sélectionnez d'abord une marque"}
                  inputClass={inputClass}
                  error={errors.model}
                  required
                  id="model"
                />
              </div>
              <div data-error={errors.year}>
                <label className={labelClass}>
                  Année <span className="text-brand-500">*</span>
                </label>
                <input
                  name="year"
                  type="number"
                  required
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={handleChange}
                  className={inputClass + (errors.year ? " border-red-500" : "")}
                />
                {errors.year && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={11} />{errors.year}
                  </p>
                )}
              </div>
              <div data-error={errors.mileage}>
                <label className={labelClass}>
                  Kilométrage <span className="text-brand-500">*</span>
                </label>
                <input
                  name="mileage"
                  type="number"
                  required
                  min="0"
                  placeholder="45000"
                  value={form.mileage}
                  onChange={handleChange}
                  className={inputClass + (errors.mileage ? " border-red-500" : "")}
                />
                {errors.mileage && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={11} />{errors.mileage}
                  </p>
                )}
              </div>
              <div data-error={errors.color}>
                <label className={labelClass}>
                  Couleur <span className="text-brand-500">*</span>
                </label>
                <Combobox
                  value={form.color}
                  onChange={(v) => {
                    set("color", v);
                    setErrors((p) => ({ ...p, color: undefined }));
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
                <label className={labelClass}>Nombre de portes</label>
                <select
                  name="doors"
                  value={form.doors}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {["2", "3", "4", "5"].map((d) => (
                    <option key={d} value={d}>{d} portes</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Motorisation ───────────────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-6 tracking-widest">
              Motorisation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>
                  Carburant <span className="text-brand-500">*</span>
                </label>
                <select name="fuel" value={form.fuel} onChange={handleChange} className={inputClass}>
                  {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Transmission <span className="text-brand-500">*</span>
                </label>
                <select name="transmission" value={form.transmission} onChange={handleChange} className={inputClass}>
                  {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div data-error={errors.power}>
                <label className={labelClass}>
                  Puissance (ch) <span className="text-brand-500">*</span>
                </label>
                <input
                  name="power"
                  type="number"
                  min="0"
                  placeholder="130"
                  value={form.power}
                  onChange={handleChange}
                  className={inputClass + (errors.power ? " border-red-500" : "")}
                />
                {errors.power && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={11} />{errors.power}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Prix ───────────────────────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-6 tracking-widest">Prix de vente</h3>
            <div className="max-w-xs" data-error={errors.price}>
              <label className={labelClass}>
                Prix (€) <span className="text-brand-500">*</span>
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
                  className={inputClass + " pr-10" + (errors.price ? " border-red-500" : "")}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">€</span>
              </div>
              {errors.price && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={11} />{errors.price}
                </p>
              )}
            </div>
          </div>

          {/* ── Description ────────────────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-6 tracking-widest">Description</h3>
            <textarea
              name="description"
              rows={5}
              placeholder="Décrivez le véhicule : état, équipements, historique…"
              value={form.description}
              onChange={handleChange}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* ── Publication ────────────────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-6 tracking-widest">Publication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Statut <span className="text-brand-500">*</span></label>
                <select name="vehicleStatus" value={form.vehicleStatus} onChange={handleChange} className={inputClass}>
                  {statusOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-dark-500 text-xs mt-1.5">
                  {statusOptions.find((o) => o.value === form.vehicleStatus)?.desc}
                </p>
              </div>
              {form.vehicleStatus === "scheduled" && (
                <div>
                  <label className={labelClass}>Date de publication <span className="text-brand-500">*</span></label>
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
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-dark-800">
              <input
                id="featured-new"
                name="featured"
                type="checkbox"
                checked={form.featured}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
              />
              <label htmlFor="featured-new" className="text-sm text-dark-300 cursor-pointer select-none flex items-center gap-1.5">
                <Star size={13} className="text-amber-400" />
                Mettre en avant sur la page d&apos;accueil
              </label>
            </div>
          </div>

          {/* ── Photos ─────────────────────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-2 tracking-widest">Photos</h3>
            <p className="text-dark-500 text-xs mb-5">
              Ajoutez des photos depuis votre galerie ou prenez une photo directement.
            </p>

            {/* Upload buttons */}
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
                className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 active:scale-95 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
              >
                <Images size={16} />
                Choisir depuis la galerie
              </button>

              {/* Hidden inputs */}
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

            {/* Preview grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-video bg-dark-800 rounded-xl overflow-hidden group ${idx === 0 ? "ring-2 ring-brand-500" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity z-10"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    {/* Always visible X on mobile */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center sm:hidden z-10"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    {idx === 0 ? (
                      <div className="absolute bottom-2 left-2 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        ★ Principale
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMainImage(idx)}
                        className="absolute bottom-2 left-2 bg-dark-900/80 hover:bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Définir principale
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-dark-700 hover:border-brand-500/50 rounded-xl py-12 text-center transition-colors group"
              >
                <Images size={32} className="text-dark-600 group-hover:text-brand-500/50 mx-auto mb-3 transition-colors" />
                <p className="text-dark-500 text-sm">
                  Glissez des photos ou cliquez pour en ajouter
                </p>
                <p className="text-dark-600 text-xs mt-1">
                  Un placeholder sera utilisé si aucune photo n&apos;est ajoutée
                </p>
              </button>
            )}
          </div>

          {/* ── Options & Équipements ───────────────────────────── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-normal text-white mb-6 tracking-widest">
              Options &amp; Équipements
            </h3>
            <VehicleOptionsForm
              value={form.options}
              onChange={(opts) => set("options", opts)}
            />
          </div>

          {/* ── Submit ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 pt-2 pb-8">
            <Link href="/admin/vehicules" className="btn-secondary text-sm">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saveStatus !== "idle"}
              className="btn-primary text-sm py-3 px-6 sm:px-8"
            >
              {saveStatus === "saving" ? (
                <><Loader2 size={16} className="animate-spin" />Enregistrement…</>
              ) : saveStatus === "saved" ? (
                <><CheckCircle2 size={16} />Enregistré !</>
              ) : (
                <><Save size={16} />Enregistrer le véhicule</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
