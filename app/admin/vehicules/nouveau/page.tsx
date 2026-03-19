"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  X,
  Save,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const fuelOptions = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];
const transmissionOptions = ["Manuelle", "Automatique"];
const statusOptions: { value: string; label: string; desc: string }[] = [
  { value: "draft",     label: "Brouillon",   desc: "Non visible côté public" },
  { value: "published", label: "Publié",       desc: "Visible immédiatement" },
  { value: "scheduled", label: "Programmé",    desc: "Visible à la date choisie" },
  { value: "sold",      label: "Vendu",        desc: "Visible avec badge « Vendu »" },
];

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
  images: string[];
  vehicleStatus: string;
  published_at: string;
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
  images: [],
  vehicleStatus: "draft",
  published_at: "",
};

export default function NewVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("saved");
    setTimeout(() => router.push("/admin/vehicules"), 1500);
  };

  const inputClass =
    "w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm";

  const labelClass = "block text-sm font-medium text-dark-300 mb-2";

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
              Ajouter un véhicule
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              Remplissez les informations du véhicule
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Informations générales */}
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-heading font-semibold text-white mb-6">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  Marque <span className="text-brand-500">*</span>
                </label>
                <input
                  name="brand"
                  required
                  placeholder="Peugeot, Renault…"
                  value={form.brand}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Modèle <span className="text-brand-500">*</span>
                </label>
                <input
                  name="model"
                  required
                  placeholder="308, Clio…"
                  value={form.model}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Année <span className="text-brand-500">*</span>
                </label>
                <input
                  name="year"
                  type="number"
                  required
                  min="1990"
                  max={new Date().getFullYear()}
                  value={form.year}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Kilométrage (km) <span className="text-brand-500">*</span>
                </label>
                <input
                  name="mileage"
                  type="number"
                  required
                  min="0"
                  placeholder="45000"
                  value={form.mileage}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Couleur <span className="text-brand-500">*</span>
                </label>
                <input
                  name="color"
                  required
                  placeholder="Gris Platinium"
                  value={form.color}
                  onChange={handleChange}
                  className={inputClass}
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
                    <option key={d} value={d}>
                      {d} portes
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Motorisation */}
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-heading font-semibold text-white mb-6">
              Motorisation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>
                  Carburant <span className="text-brand-500">*</span>
                </label>
                <select
                  name="fuel"
                  value={form.fuel}
                  onChange={handleChange}
                  className={inputClass}
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
                  Transmission <span className="text-brand-500">*</span>
                </label>
                <select
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {transmissionOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Puissance (ch)</label>
                <input
                  name="power"
                  type="number"
                  min="0"
                  placeholder="130"
                  value={form.power}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Section: Prix */}
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-heading font-semibold text-white mb-6">
              Prix de vente
            </h3>
            <div className="max-w-xs">
              <label className={labelClass}>
                Prix (€) <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="price"
                  type="number"
                  required
                  min="0"
                  placeholder="18900"
                  value={form.price}
                  onChange={handleChange}
                  className={inputClass + " pr-10"}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 font-semibold">
                  €
                </span>
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-heading font-semibold text-white mb-6">
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
          </div>

          {/* Section: Publication */}
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-heading font-semibold text-white mb-6">
              Publication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Statut <span className="text-brand-500">*</span></label>
                <select
                  name="vehicleStatus"
                  value={form.vehicleStatus}
                  onChange={handleChange}
                  className={inputClass}
                >
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
                  <label className={labelClass}>
                    Date de publication <span className="text-brand-500">*</span>
                  </label>
                  <input
                    name="published_at"
                    type="datetime-local"
                    value={form.published_at}
                    onChange={handleChange}
                    required={form.vehicleStatus === "scheduled"}
                    className={inputClass}
                  />
                  <p className="text-dark-500 text-xs mt-1.5">
                    L&apos;annonce sera automatiquement publiée à cette date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Photos */}
          <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-heading font-semibold text-white mb-6">
              Photos
            </h3>

            {/* Add URL */}
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

            {/* Images preview */}
            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
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
                <p className="text-dark-500 text-sm">
                  Ajoutez des photos via une URL
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/admin/vehicules"
              className="btn-secondary text-sm"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={status !== "idle"}
              className="btn-primary text-sm py-3 px-8"
            >
              {status === "saving" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement…
                </>
              ) : status === "saved" ? (
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
