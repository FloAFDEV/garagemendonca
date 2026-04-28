"use client";

/**
 * VehicleForm — formulaire création / édition véhicule.
 *
 * - react-hook-form + résolveur Zod personnalisé (compatible Zod v4)
 * - Submit → useCreateVehicle / useUpdateVehicle (jamais de fetch direct)
 * - Validation identique backend (vehicleCreateSchema réutilisé)
 * - Aucun mapping, aucun appel Supabase
 */

import { useForm } from "react-hook-form";
import { buildZodResolver } from "@/lib/ui/formErrorMapper";
import { vehicleCreateSchema, type VehicleCreateInput } from "@/lib/validation/vehicle.schema";
import { useCreateVehicle } from "@/lib/mutations/useCreateVehicle";
import { useUpdateVehicle } from "@/lib/mutations/useUpdateVehicle";
import type { UIVehicle } from "@/types/ui";

const FUEL_OPTIONS    = ["Essence", "Diesel", "Hybride", "Électrique", "GPL", "Hydrogène"] as const;
const TRANS_OPTIONS   = ["Manuelle", "Automatique"] as const;
const STATUS_OPTIONS  = [
  { value: "draft",     label: "Brouillon" },
  { value: "published", label: "Publié" },
  { value: "scheduled", label: "Planifié" },
  { value: "sold",      label: "Vendu" },
] as const;

interface VehicleFormProps {
  garageId:   string;
  vehicle?:   UIVehicle;        // présent en mode édition
  onSuccess?: (v: UIVehicle) => void;
}

export function VehicleForm({ garageId, vehicle, onSuccess }: VehicleFormProps) {
  const isEdit  = !!vehicle;
  const create  = useCreateVehicle();
  const update  = useUpdateVehicle();
  const isPending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<VehicleCreateInput>({
    resolver: buildZodResolver(vehicleCreateSchema),
    defaultValues: vehicle
      ? {
          garage_id:    garageId,
          brand:        vehicle.brand,
          model:        vehicle.model,
          year:         vehicle.year,
          mileage:      vehicle.mileage,
          fuel:         vehicle.fuel,
          transmission: vehicle.transmission,
          power:        vehicle.power,
          price:        vehicle.price,
          color:        vehicle.color,
          doors:        vehicle.doors,
          description:  vehicle.description,
          status:       vehicle.status,
          featured:     vehicle.featured,
          slug:         vehicle.slug,
          meta_description: vehicle.meta_description,
        }
      : { garage_id: garageId, status: "draft", featured: false },
  });

  async function onSubmit(data: VehicleCreateInput) {
    if (isEdit && vehicle) {
      update.mutate(
        { id: vehicle.id, garageId, input: data },
        { onSuccess: (v) => onSuccess?.(v) },
      );
    } else {
      create.mutate(data, { onSuccess: (v) => onSuccess?.(v) });
    }
  }

  const field = (name: keyof VehicleCreateInput) =>
    errors[name]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("garage_id")} />

      {/* ── Identité ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Marque *" error={field("brand")}>
          <input {...register("brand")} placeholder="Peugeot" className={inputCls(field("brand"))} />
        </Field>
        <Field label="Modèle *" error={field("model")}>
          <input {...register("model")} placeholder="208" className={inputCls(field("model"))} />
        </Field>
        <Field label="Année *" error={field("year")}>
          <input {...register("year", { valueAsNumber: true })} type="number" min={1900} max={2100} className={inputCls(field("year"))} />
        </Field>
      </section>

      {/* ── Motorisation ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Carburant *" error={field("fuel")}>
          <select {...register("fuel")} className={inputCls(field("fuel"))}>
            <option value="">—</option>
            {FUEL_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Transmission *" error={field("transmission")}>
          <select {...register("transmission")} className={inputCls(field("transmission"))}>
            <option value="">—</option>
            {TRANS_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Puissance (ch)" error={field("power")}>
          <input {...register("power", { valueAsNumber: true })} type="number" min={0} className={inputCls(field("power"))} />
        </Field>
        <Field label="Portes" error={field("doors")}>
          <input {...register("doors", { valueAsNumber: true })} type="number" min={2} max={7} className={inputCls(field("doors"))} />
        </Field>
      </section>

      {/* ── Prix & kilométrage ────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <Field label="Prix (€) *" error={field("price")}>
          <input {...register("price", { valueAsNumber: true })} type="number" min={0} className={inputCls(field("price"))} />
        </Field>
        <Field label="Kilométrage *" error={field("mileage")}>
          <input {...register("mileage", { valueAsNumber: true })} type="number" min={0} className={inputCls(field("mileage"))} />
        </Field>
      </section>

      {/* ── Apparence ────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <Field label="Couleur *" error={field("color")}>
          <input {...register("color")} placeholder="Blanc nacré" className={inputCls(field("color"))} />
        </Field>
        <Field label="Crit'Air" error={field("crit_air")}>
          <select {...register("crit_air")} className={inputCls(field("crit_air"))}>
            <option value="">—</option>
            {["0","1","2","3","4","5"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </section>

      {/* ── Description ──────────────────────────────────────── */}
      <Field label="Description" error={field("description")}>
        <textarea
          {...register("description")}
          rows={4}
          className={inputCls(field("description"))}
          placeholder="Description du véhicule…"
        />
      </Field>

      {/* ── SEO ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <Field label="Slug SEO" error={field("slug")}>
          <input {...register("slug")} placeholder="peugeot-208-2021" className={inputCls(field("slug"))} />
        </Field>
        <Field label="Meta description (160 car.)" error={field("meta_description")}>
          <input {...register("meta_description")} maxLength={160} className={inputCls(field("meta_description"))} />
        </Field>
      </section>

      {/* ── Publication ──────────────────────────────────────── */}
      <section className="flex flex-wrap items-center gap-6">
        <Field label="Statut" error={field("status")}>
          <select {...register("status")} className={inputCls(field("status"))}>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" {...register("featured")} className="h-4 w-4 rounded border-gray-300" />
          Mise en avant (home)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input type="checkbox" {...register("export_leboncoin")} className="h-4 w-4 rounded border-gray-300" />
          Export LeBonCoin
        </label>
      </section>

      {/* ── Submit ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer le véhicule"}
        </button>

        {(create.isError || update.isError) && (
          <p className="text-sm text-red-600">
            Une erreur est survenue. Vérifiez les champs ci-dessus.
          </p>
        )}
      </div>
    </form>
  );
}

// ─── Composants internes ──────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return [
    "rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
    error
      ? "border-red-400 focus:ring-red-400"
      : "border-gray-300 focus:ring-blue-500",
  ].join(" ");
}
