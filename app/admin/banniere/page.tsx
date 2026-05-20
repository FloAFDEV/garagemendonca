"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import Link from "next/link";
import {
  Save, Loader2, CheckCircle2, AlertCircle, Eye, ToggleLeft, ToggleRight,
  Megaphone, Calendar, Palette, ExternalLink, ImagePlus, Camera, X, ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import type { Banner } from "@/types";
import { upsertBannerAction, getBannerAction } from "./actions";
import { getStoragePublicUrl } from "@/lib/utils/storage";
import { adminUI } from "@/lib/admin-ui";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

function BannerImageUpload({
  onUploaded,
  onBlobPreview,
}: {
  onUploaded: (url: string, storagePath: string) => void;
  onBlobPreview: (blobUrl: string | null) => void;
}) {
  const t = useAdminTokens();
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    // Preview immédiat via blob URL — visible avant que Supabase réponde
    const blobUrl = URL.createObjectURL(file);
    onBlobPreview(blobUrl);

    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "banner");
      fd.append("entityId", "banner");
      fd.append("garageId", ACTIVE_GARAGE_ID);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Échec de l'upload");
      const { url, storagePath } = await res.json();
      onUploaded(url, storagePath ?? "");
    } catch (err) {
      setUploadError((err as Error).message ?? "Erreur inconnue");
      onBlobPreview(null); // annuler le preview si erreur
    } finally {
      URL.revokeObjectURL(blobUrl);
      setUploading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-2 mt-1">
      {/* Inputs cachés — hors de tout bouton (HTML valide) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleChange}
      />

      <div className="flex items-center gap-2 flex-wrap">
        {/* Galerie / fichier — desktop + galerie mobile */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm transition-colors hover:border-brand-500 hover:text-brand-400 disabled:opacity-50 disabled:pointer-events-none", t.txtMuted, t.borderMuted)}
        >
          {uploading ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus size={15} aria-hidden="true" />
          )}
          {uploading ? "Téléchargement…" : "Galerie / fichier"}
        </button>

        {/* Caméra — ouvre directement la caméra arrière sur mobile */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => cameraInputRef.current?.click()}
          className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm transition-colors hover:border-brand-500 hover:text-brand-400 disabled:opacity-50 disabled:pointer-events-none", t.txtMuted, t.borderMuted)}
        >
          <Camera size={15} aria-hidden="true" />
          Prendre une photo
        </button>
      </div>

      {uploadError && (
        <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={12} aria-hidden="true" />
          {uploadError}
        </p>
      )}
    </div>
  );
}

function BannerPreview({
  form,
  imageUrl,
}: {
  form: Partial<Banner>;
  imageUrl?: string | null;
}) {
  const t = useAdminTokens();
  const hasContent = !!(form.message || form.sub_message || form.cta_label);

  return (
    <div className={t.sectionCard}>
      <h3 className={clsx("font-heading font-normal mb-4 tracking-widest text-sm flex items-center gap-2", t.txt)}>
        <Eye size={14} className="text-brand-400" />
        Aperçu
        {!form.is_active && (
          <span className={clsx("text-xs font-normal ml-1", t.txtSubtle)}>(bannière désactivée)</span>
        )}
      </h3>

      {/* Rendu fidèle de la bannière (taille réelle) */}
      <p className={clsx("text-[10px] uppercase tracking-widest mb-2", t.txtSubtle)}>
        Rendu réel sur le site
      </p>
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ backgroundColor: form.bg_color || "#111827" }}
      >
        {/* Fond image atténué */}
        {imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              style={{ opacity: 0.35 }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ backgroundColor: `${form.bg_color || "#111827"}88` }}
            />
          </>
        )}

        {/* Bouton × simulé */}
        {form.is_dismissible && (
          <div
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X size={11} />
          </div>
        )}

        {/* Contenu centré */}
        <div className="relative px-10 py-3 flex items-center justify-center gap-3 min-h-[56px]">
          {/* Icône image */}
          {imageUrl && (
            <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden ring-1 ring-white/20 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" aria-hidden="true" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Textes */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
            <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">
              {form.message || <span className="opacity-30 italic font-normal">Message principal…</span>}
            </p>
            {form.sub_message && (
              <span className="text-white/70 text-xs hidden sm:inline">—&nbsp;{form.sub_message}</span>
            )}
          </div>

          {/* CTA */}
          {form.cta_label && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 border border-white/40 text-white text-xs font-semibold px-3 py-1 rounded-lg whitespace-nowrap">
              {form.cta_label}
              <ArrowRight size={10} aria-hidden="true" />
            </span>
          )}

          {/* Placeholder si vide */}
          {!hasContent && !imageUrl && (
            <p className="text-white/30 text-xs italic">Remplissez les champs ci-dessous pour voir l&apos;aperçu</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminBannierePage() {
  const t = useAdminTokens();

  const [form, setForm] = useState<Partial<Banner>>({
    is_active: false,
    message: "",
    sub_message: "",
    image_url: "",
    image_storage_path: "",
    cta_label: "",
    cta_url: "",
    bg_color: "#DC2626",
    scheduled_start: "",
    scheduled_end: "",
    display_pages: "all",
    is_dismissible: true,
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  // blob URL temporaire : preview immédiat avant que Supabase ait répondu
  const [blobPreview, setBlobPreview] = useState<string | null>(null);

  useEffect(() => {
    getBannerAction().then((banner) => {
      if (!banner) return;
      setForm({
        id: banner.id,
        is_active: banner.is_active,
        message: banner.message ?? "",
        sub_message: banner.sub_message ?? "",
        image_url: banner.image_url ?? "",
        image_storage_path: banner.image_storage_path ?? "",
        cta_label: banner.cta_label ?? "",
        cta_url: banner.cta_url ?? "",
        bg_color: banner.bg_color ?? "#DC2626",
        scheduled_start: toDatetimeLocal(banner.scheduled_start),
        scheduled_end: toDatetimeLocal(banner.scheduled_end),
        display_pages: banner.display_pages ?? "all",
        is_dismissible: banner.is_dismissible ?? true,
      });
    });
  }, []);

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

  // URL publique calculée depuis image_storage_path (bucket public)
  const persistedImageUrl = form.image_storage_path
    ? getStoragePublicUrl("banner-images", form.image_storage_path)
    : form.image_url || undefined;

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

        {/* ── Aperçu en direct ──────────────────────────────────── */}
        <BannerPreview form={form} imageUrl={blobPreview ?? persistedImageUrl} />

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
              <Megaphone size={16} className="text-brand-400" />
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
              <Palette size={16} className="text-brand-400" />
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

              {/* Image de fond */}
              <div>
                <label className={labelClass}>Image de fond (optionnel)</label>
                {/* Affichage : blobUrl (preview immédiat) ?? URL publique (existant) ?? rien */}
                {(blobPreview ?? persistedImageUrl) ? (
                  <div className="relative mt-1 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blobPreview ?? persistedImageUrl!}
                      alt="Preview bannière"
                      className="w-full max-h-40 object-cover"
                      onError={e => (e.currentTarget.style.display = "none")}
                    />
                    {/* Spinner upload par-dessus le blob preview */}
                    {blobPreview && !form.image_storage_path && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                        <Loader2 size={24} className="animate-spin text-white" />
                      </div>
                    )}
                    {/* Bouton supprimer — seulement si upload terminé */}
                    {!blobPreview && (
                      <button
                        type="button"
                        onClick={() => { set("image_url", ""); set("image_storage_path", ""); setBlobPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Supprimer l'image"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  <BannerImageUpload
                    onUploaded={(url, storagePath) => {
                      set("image_url", url);
                      set("image_storage_path", storagePath);
                      setBlobPreview(null);
                    }}
                    onBlobPreview={setBlobPreview}
                  />
                )}
                {/* Bouton "Remplacer" visible quand une image est déjà chargée */}
                {(form.image_storage_path || form.image_url) && !blobPreview && (
                  <div className="mt-2">
                    <BannerImageUpload
                      onUploaded={(url, storagePath) => {
                        set("image_url", url);
                        set("image_storage_path", storagePath);
                        setBlobPreview(null);
                      }}
                      onBlobPreview={setBlobPreview}
                    />
                  </div>
                )}
                <p className={clsx("text-xs mt-1.5", t.txtSubtle)}>
                  Recommandé : 1920 × 900 px — sera converti en WebP automatiquement.
                </p>
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
              <ExternalLink size={16} className="text-brand-400" />
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
              <Calendar size={16} className="text-brand-400" />
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
              aria-busy={saveStatus === "saving"}
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
