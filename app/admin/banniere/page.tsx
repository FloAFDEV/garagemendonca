"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import Link from "next/link";
import {
  Save, Loader2, CheckCircle2, AlertCircle, Eye, ToggleLeft, ToggleRight,
  Megaphone, Calendar, Palette, ExternalLink
} from "lucide-react";
import clsx from "clsx";
import type { Banner } from "@/types";
import { upsertBannerAction } from "./actions";
import { adminUI } from "@/lib/admin-ui";

const PALETTE = [
  { label: "Rouge", value: "#DC2626" },
  { label: "Bordeaux", value: "#9B1C1C" },
  { label: "Noir", value: "#111827" },
  { label: "Vert", value: "#16A34A" },
  { label: "Bleu", value: "#1D4ED8" },
  { label: "Violet", value: "#7C3AED" },
];

function isBannerLive(banner: Partial<Banner>): boolean {
  if (!banner.is_active) return false;
  const now = new Date();
  if (banner.scheduled_start && new Date(banner.scheduled_start) > now) return false;
  if (banner.scheduled_end && new Date(banner.scheduled_end) < now) return false;
  return true;
}

function getBannerStatus(banner: Partial<Banner>): { label: string; color: string } {
  if (!banner.is_active) return { label: "Inactive", color: adminUI.statusInactive };
  const now = new Date();
  if (banner.scheduled_end && new Date(banner.scheduled_end) < now)
    return { label: "Expirée", color: adminUI.statusExpired };
  if (banner.scheduled_start && new Date(banner.scheduled_start) > now)
    return { label: "Programmée", color: adminUI.statusScheduled };
  return { label: "Active", color: adminUI.statusActive };
}

export default function AdminBannierePage() {
  const t = useAdminTokens();

  const [form, setForm] = useState<Partial<Banner>>({
    is_active: false,
    message: "",
    sub_message: "",
    image_url: "",
    cta_label: "",
    cta_url: "",
    bg_color: "#DC2626",
    scheduled_start: "",
    scheduled_end: "",
    display_pages: "all",
    is_dismissible: true,
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const set = <K extends keyof Banner>(key: K, value: Banner[K]) =>
    setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    // Auto-désactiver si scheduled_end est dans le passé
    const shouldDeactivate = form.scheduled_end && new Date(form.scheduled_end) < new Date();
    const result = await upsertBannerAction({
      ...form,
      is_active: shouldDeactivate ? false : form.is_active,
      message: form.message ?? "",
      bg_color: form.bg_color ?? "#DC2626",
      display_pages: form.display_pages ?? "all",
      is_dismissible: form.is_dismissible ?? true,
    });
    setSaveStatus(result.ok ? "saved" : "error");
    if (result.ok) setTimeout(() => setSaveStatus("idle"), 2500);
  };

  const inputClass = t.inputClass;
  const labelClass = t.labelClass;
  const sectionClass = t.sectionCard;

  const status = getBannerStatus(form);
  const isLive = isBannerLive(form);

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>
              Bannière promotionnelle
            </h2>
            <p className={clsx("text-sm mt-1", t.txtMuted)}>
              Une seule bannière active à la fois, affichée sous le header.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className={clsx(
              "flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors",
              t.txtMuted,
              t.hoverTxt,
              t.hoverBg,
            )}
          >
            <Eye size={16} />
            <span className="hidden sm:inline">Prévisualiser</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Toggle actif + statut */}
          <div className={clsx(sectionClass, "flex items-center justify-between gap-4")}>
            <div>
              <h3 className={clsx("font-heading font-normal tracking-widest", t.txt)}>
                Statut :{" "}
                <span className={clsx("text-sm font-medium", status.color)}>{status.label}</span>
              </h3>
              <p className={clsx("text-xs mt-1", t.txtSubtle)}>
                {isLive
                  ? "La bannière est visible en ce moment."
                  : "La bannière n'est pas affichée."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={clsx(
                "text-sm px-5 py-2.5",
                form.is_active ? adminUI.toggleOn : adminUI.toggleOff,
              )}
            >
              {form.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              {form.is_active ? "Activée" : "Désactivée"}
            </button>
          </div>

          {/* Message */}
          <div className={sectionClass}>
            <h3
              className={clsx(
                "font-heading font-normal mb-6 tracking-widest flex items-center gap-2",
                t.txt,
              )}
            >
              <Megaphone size={16} />
              Message
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass.replace(" mb-2", "")}>
                    Message principal <span className="text-brand-500">*</span>
                  </label>
                  <span
                    className={clsx(
                      "text-xs",
                      (form.message?.length ?? 0) > 80 ? "text-red-400" : t.txtSubtle,
                    )}
                  >
                    {form.message?.length ?? 0}/80
                  </span>
                </div>
                <input
                  value={form.message ?? ""}
                  onChange={e => set("message", e.target.value)}
                  maxLength={100}
                  className={inputClass}
                  placeholder="🎉 Promotion été : -10% sur toutes les révisions"
                />
              </div>
              <div>
                <label className={labelClass}>Sous-message (optionnel)</label>
                <input
                  value={form.sub_message ?? ""}
                  onChange={e => set("sub_message", e.target.value)}
                  className={inputClass}
                  placeholder="Offre valable jusqu'au 31 août"
                />
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className={sectionClass}>
            <h3
              className={clsx(
                "font-heading font-normal mb-6 tracking-widest flex items-center gap-2",
                t.txt,
              )}
            >
              <Palette size={16} />
              Apparence
            </h3>
            <div className="space-y-5">
              {/* Palette couleurs */}
              <div>
                <label className={labelClass}>Couleur de fond</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PALETTE.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("bg_color", value)}
                      style={{ backgroundColor: value }}
                      title={label}
                      className={clsx(
                        "w-8 h-8 rounded-lg transition-all border-2",
                        form.bg_color === value
                          ? "border-white scale-110 shadow-lg"
                          : "border-transparent hover:scale-105",
                      )}
                    />
                  ))}
                  {/* Custom hex */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bg_color ?? "#DC2626"}
                      onChange={e => set("bg_color", e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                      title="Couleur personnalisée"
                    />
                    <span className={clsx("text-xs font-mono", t.txtSubtle)}>{form.bg_color}</span>
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className={labelClass}>Image de fond (optionnel, URL)</label>
                <input
                  value={form.image_url ?? ""}
                  onChange={e => set("image_url", e.target.value)}
                  className={inputClass}
                  placeholder="https://… ou /images/promo.webp"
                />
                {form.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-3 rounded-xl w-full max-h-32 object-cover opacity-80"
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className={sectionClass}>
            <h3
              className={clsx(
                "font-heading font-normal mb-6 tracking-widest flex items-center gap-2",
                t.txt,
              )}
            >
              <ExternalLink size={16} />
              Bouton d&apos;action (CTA, optionnel)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Texte du bouton</label>
                <input
                  value={form.cta_label ?? ""}
                  onChange={e => set("cta_label", e.target.value)}
                  className={inputClass}
                  placeholder="Profiter de l'offre"
                />
              </div>
              <div>
                <label className={labelClass}>URL du bouton</label>
                <input
                  value={form.cta_url ?? ""}
                  onChange={e => set("cta_url", e.target.value)}
                  className={inputClass}
                  placeholder="/services ou https://…"
                />
              </div>
            </div>
          </div>

          {/* Programmation */}
          <div className={sectionClass}>
            <h3
              className={clsx(
                "font-heading font-normal mb-6 tracking-widest flex items-center gap-2",
                t.txt,
              )}
            >
              <Calendar size={16} />
              Programmation (optionnel)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Date de début</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_start ?? ""}
                  onChange={e => set("scheduled_start", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date de fin</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_end ?? ""}
                  onChange={e => set("scheduled_end", e.target.value)}
                  className={inputClass}
                />
                {form.scheduled_end && new Date(form.scheduled_end) < new Date() && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />
                    Date passée — la bannière sera auto-désactivée.
                  </p>
                )}
              </div>
            </div>
            <p className={clsx("text-xs mt-4", t.txtSubtle)}>
              Si une date de fin est dans le passé, la bannière est automatiquement désactivée à
              l&apos;enregistrement.
            </p>
          </div>

          {/* Options */}
          <div className={sectionClass}>
            <h3 className={clsx("font-heading font-normal mb-6 tracking-widest", t.txt)}>
              Options
            </h3>
            <div className="space-y-5">
              {/* Pages d'affichage */}
              <div>
                <label className={labelClass}>Pages d&apos;affichage</label>
                <div className="flex items-center gap-4">
                  {(
                    [
                      ["all", "Toutes les pages"],
                      ["home_only", "Page d'accueil uniquement"],
                    ] as const
                  ).map(([val, label]) => (
                    <label
                      key={val}
                      className={clsx("flex items-center gap-2 text-sm cursor-pointer", t.txtMuted)}
                    >
                      <input
                        type="radio"
                        name="display_pages"
                        value={val}
                        checked={form.display_pages === val}
                        onChange={() => set("display_pages", val)}
                        className="accent-brand-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Dismissible */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={clsx("text-sm font-medium", t.txtMuted)}>
                    Peut être fermée par l&apos;utilisateur
                  </p>
                  <p className={clsx("text-xs", t.txtSubtle)}>
                    Affiche un bouton × pour masquer la bannière (session uniquement).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set("is_dismissible", !form.is_dismissible)}
                  className={form.is_dismissible ? adminUI.toggleOn : adminUI.toggleOff}
                >
                  {form.is_dismissible ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {form.is_dismissible ? "Oui" : "Non"}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 pt-2 pb-8">
            <div />
            <button
              type="submit"
              disabled={saveStatus !== "idle"}
              className="btn-primary text-sm py-3 px-8"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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
                  Erreur
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer la bannière
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
