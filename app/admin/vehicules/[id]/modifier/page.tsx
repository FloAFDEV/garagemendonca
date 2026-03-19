"use client";

import { useState, use } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import { vehicles } from "@/lib/data";
import { VehicleStatus } from "@/types";
import {
  ImagePlus,
  X,
  Save,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const fuelOptions = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"] as const;
const transmissionOptions = ["Manuelle", "Automatique"] as const;
const statusOptions: { value: VehicleStatus; label: string; color: string }[] = [
  { value: "published",  label: "Publié",      color: "text-emerald-400" },
  { value: "draft",      label: "Brouillon",   color: "text-dark-400" },
  { value: "scheduled",  label: "Programmé",   color: "text-blue-400" },
  { value: "sold",       label: "Vendu",       color: "text-red-400" },
];

interface VehicleForm {
  brand:        string;
  model:        string;
  year:         string;
  mileage:      string;
  fuel:         string;
  transmission: string;
  power:        string;
  price:        string;
  color:        string;
  doors:        string;
  description:  string;
  images:       string[];
  status:       VehicleStatus;
  featured:     boolean;
}

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const vehicle = vehicles.find((v) => v.id === id);

  const [form, setForm] = useState<VehicleForm>(() => {
    if (!vehicle) return {
      brand: "", model: "", year: "", mileage: "", fuel: "Essence",
      transmission: "Manuelle", power: "", price: "", color: "",
      doors: "5", description: "", images: [], status: "draft", featured: false,
    };
    return {
      brand:        vehicle.brand,
      model:        vehicle.model,
      year:         vehicle.year.toString(),
      mileage:      vehicle.mileage.toString(),
      fuel:         vehicle.fuel,
      transmission: vehicle.transmission,
      power:        vehicle.power.toString(),
      price:        vehicle.price.toString(),
      color:        vehicle.color,
      doors:        vehicle.doors.toString(),
      description:  vehicle.description,
      images:       [...vehicle.images],
      status:       vehicle.status ?? "draft",
      featured:     vehicle.featured ?? false,
    };
  });

  const [imageUrl, setImageUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  if (!vehicle) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="font-heading font-bold text-white text-xl">
            Véhicule introuvable
          </h2>
          <p className="text-dark-400 text-sm">
            L&apos;identifiant <code className="text-brand-400">#{id}</code> ne correspond à aucun véhicule.
          </p>
          <Link href="/admin/vehicules" className="btn-primary text-sm">
            <ArrowLeft size={15} />
            Retour aux véhicules
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    /* TODO Supabase: await updateVehicle(id, { ...form, year: +form.year, … }) */
    await new Promise((r) => setTimeout(r, 1200));
    setSaveStatus("saved");
    setTimeout(() => router.push("/admin/vehicules"), 1500);
  };

  const inputClass =
    "w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-dark-300 mb-2";
  const sectionClass = "bg-dark-900 rounded-2xl border border-dark-800 p-6";

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
            <h2 className="font-heading font-bold text-white text-2xl">
              Modifier le véhicule
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              {vehicle.brand} {vehicle.model} · {vehicle.year} · #{vehicle.id}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Statut + mise en avant ── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-semibold text-white mb-6">Statut</h3>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1">
                <label className={labelClass}>Disponibilité</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {statusOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className={`text-xs mt-1.5 ${statusOptions.find(s => s.value === form.status)?.color}`}>
                  {statusOptions.find(s => s.value === form.status)?.label}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-brand-500 cursor-pointer"
                />
                <label htmlFor="featured" className="text-sm text-dark-300 cursor-pointer select-none">
                  Mettre en avant sur la page d&apos;accueil
                </label>
              </div>
            </div>
          </div>

          {/* ── Informations générales ── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-semibold text-white mb-6">Informations générales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Marque <span className="text-brand-500">*</span></label>
                <input name="brand" required placeholder="Peugeot, Renault…"
                  value={form.brand} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Modèle <span className="text-brand-500">*</span></label>
                <input name="model" required placeholder="308, Clio…"
                  value={form.model} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Année <span className="text-brand-500">*</span></label>
                <input name="year" type="number" required min="1990" max={new Date().getFullYear()}
                  value={form.year} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Kilométrage (km) <span className="text-brand-500">*</span></label>
                <input name="mileage" type="number" required min="0" placeholder="45000"
                  value={form.mileage} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Couleur <span className="text-brand-500">*</span></label>
                <input name="color" required placeholder="Gris Platinium"
                  value={form.color} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nombre de portes</label>
                <select name="doors" value={form.doors} onChange={handleChange} className={inputClass}>
                  {["2", "3", "4", "5"].map((d) => (
                    <option key={d} value={d}>{d} portes</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Motorisation ── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-semibold text-white mb-6">Motorisation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Carburant <span className="text-brand-500">*</span></label>
                <select name="fuel" value={form.fuel} onChange={handleChange} className={inputClass}>
                  {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Transmission <span className="text-brand-500">*</span></label>
                <select name="transmission" value={form.transmission} onChange={handleChange} className={inputClass}>
                  {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Puissance (ch)</label>
                <input name="power" type="number" min="0" placeholder="130"
                  value={form.power} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ── Prix ── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-semibold text-white mb-6">Prix de vente</h3>
            <div className="max-w-xs">
              <label className={labelClass}>Prix (€) <span className="text-brand-500">*</span></label>
              <div className="relative">
                <input name="price" type="number" required min="0" placeholder="18900"
                  value={form.price} onChange={handleChange} className={inputClass + " pr-10"} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 font-semibold">€</span>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-semibold text-white mb-6">Description</h3>
            <textarea name="description" rows={5}
              placeholder="Décrivez le véhicule : état, équipements, historique…"
              value={form.description} onChange={handleChange}
              className={inputClass + " resize-none"} />
          </div>

          {/* ── Photos ── */}
          <div className={sectionClass}>
            <h3 className="font-heading font-semibold text-white mb-6">Photos</h3>
            <div className="flex gap-3 mb-5">
              <input
                type="url"
                placeholder="URL de l'image (https://…)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                className={inputClass + " flex-1"}
              />
              <button
                type="button"
                onClick={addImage}
                className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium flex-shrink-0"
              >
                <ImagePlus size={16} />
                Ajouter
              </button>
            </div>

            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Principale
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-dark-700 rounded-xl py-12 text-center">
                <ImagePlus size={32} className="text-dark-600 mx-auto mb-3" />
                <p className="text-dark-500 text-sm">Aucune photo — ajoutez une URL</p>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/admin/vehicules" className="btn-secondary text-sm">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saveStatus !== "idle"}
              className="btn-primary text-sm py-3 px-8"
            >
              {saveStatus === "saving" ? (
                <><Loader2 size={16} className="animate-spin" />Enregistrement…</>
              ) : saveStatus === "saved" ? (
                <><CheckCircle2 size={16} />Enregistré !</>
              ) : (
                <><Save size={16} />Enregistrer les modifications</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
