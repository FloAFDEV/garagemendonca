"use client";

import { useForm } from "react-hook-form";
import { buildZodResolver } from "@/lib/ui/formErrorMapper";
import { garageCreateSchema, type GarageCreateInput } from "@/lib/validation/garage.schema";
import type { UIGarage } from "@/types/ui";

const PLAN_OPTIONS = [
  { value: "isolated", label: "Isolé" },
  { value: "shared",   label: "Mutualisé" },
] as const;

interface GarageFormProps {
  garage?:    UIGarage;
  onSubmit:   (data: GarageCreateInput) => void;
  isPending?: boolean;
  error?:     string | null;
}

export function GarageForm({ garage, onSubmit, isPending = false, error }: GarageFormProps) {
  const isEdit = !!garage;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GarageCreateInput>({
    resolver: buildZodResolver(garageCreateSchema),
    defaultValues: garage
      ? {
          name:         garage.name,
          slug:         garage.slug,
          address:      garage.address,
          city:         garage.city,
          postal_code:  garage.postalCode,
          phone:        garage.phone,
          email:        garage.email,
          description:  garage.description,
          is_active:    garage.isActive,
          plan:         garage.plan,
          lat:          garage.lat,
          lng:          garage.lng,
          google_maps_url: garage.googleMapsUrl,
        }
      : { is_active: true, plan: "isolated" },
  });

  const err = (name: keyof GarageCreateInput) =>
    errors[name]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Identité ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom du garage *" error={err("name")}>
          <input {...register("name")} placeholder="Garage Mendonca" className={inputCls(err("name"))} />
        </Field>
        <Field label="Slug *" error={err("slug")}>
          <input {...register("slug")} placeholder="garage-mendonca" className={inputCls(err("slug"))} />
        </Field>
      </section>

      {/* ── Contact ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Téléphone" error={err("phone")}>
          <input {...register("phone")} placeholder="05 32 00 20 38" className={inputCls(err("phone"))} />
        </Field>
        <Field label="Email" error={err("email")}>
          <input {...register("email")} type="email" placeholder="contact@garage.fr" className={inputCls(err("email"))} />
        </Field>
      </section>

      {/* ── Adresse ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Adresse" error={err("address")}>
          <input {...register("address")} placeholder="6 Avenue de la Mouyssaguese" className={inputCls(err("address"))} />
        </Field>
        <Field label="Ville" error={err("city")}>
          <input {...register("city")} placeholder="Drémil-Lafage" className={inputCls(err("city"))} />
        </Field>
        <Field label="Code postal" error={err("postal_code")}>
          <input {...register("postal_code")} placeholder="31280" className={inputCls(err("postal_code"))} />
        </Field>
      </section>

      {/* ── Géolocalisation ──────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Latitude" error={err("lat")}>
          <input {...register("lat", { valueAsNumber: true })} type="number" step="any" placeholder="43.6039" className={inputCls(err("lat"))} />
        </Field>
        <Field label="Longitude" error={err("lng")}>
          <input {...register("lng", { valueAsNumber: true })} type="number" step="any" placeholder="1.5842" className={inputCls(err("lng"))} />
        </Field>
        <Field label="URL Google Maps" error={err("google_maps_url")}>
          <input {...register("google_maps_url")} placeholder="https://maps.google.com/…" className={inputCls(err("google_maps_url"))} />
        </Field>
      </section>

      {/* ── Description ──────────────────────────────────────── */}
      <Field label="Description" error={err("description")}>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Présentation du garage…"
          className={inputCls(err("description"))}
        />
      </Field>

      {/* ── Config ───────────────────────────────────────────── */}
      <section className="flex flex-wrap items-center gap-6">
        <Field label="Plan" error={err("plan")}>
          <select {...register("plan")} className={inputCls(err("plan"))}>
            {PLAN_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-5">
          <input type="checkbox" {...register("is_active")} className="h-4 w-4 rounded border-gray-300" />
          Garage actif
        </label>
      </section>

      {/* ── Submit ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer le garage"}
        </button>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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
