"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { createServiceAction } from "../actions";
import { adminUI } from "@/lib/admin-ui";

const ICON_OPTIONS = ["wrench", "settings", "paintbrush", "car", "shield", "tool"];

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NouveauServicePage() {
  const t = useAdminTokens();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [icon, setIcon] = useState("wrench");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const handleSlugChange = (v: string) => {
    setSlugManual(true);
    setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    setSaveStatus("saving");
    setErrorMsg("");
    const result = await createServiceAction({
      title: title.trim(),
      slug: slug.trim(),
      short_description: shortDesc.trim(),
      long_description: longDesc.trim(),
      features: [],
      icon,
    });
    if (result.ok && result.slug) {
      setSaveStatus("saved");
      setTimeout(() => router.push(`/admin/services/${result.slug}`), 900);
    } else {
      setSaveStatus("error");
      setErrorMsg(result.error ?? "Erreur inconnue");
    }
  };

  const inputClass = t.inputClass;
  const labelClass = t.labelClass;

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/services"
            className={clsx("p-2 rounded-xl transition-colors", t.txtMuted, t.hoverTxt, t.hoverBg, adminUI.focusGhost)}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>Nouveau service</h2>
            <p className={clsx("text-sm mt-1", t.txtMuted)}>Créez un service, puis ajoutez les détails.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className={clsx("rounded-2xl border p-5 space-y-5", t.surface, t.border)}>
            {/* Titre */}
            <div>
              <label className={labelClass}>
                Titre <span className="text-brand-500">*</span>
              </label>
              <input
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputClass}
                placeholder="Entretien & Révision"
                autoFocus
              />
            </div>

            {/* Slug */}
            <div>
              <label className={labelClass}>
                Slug (URL) <span className="text-brand-500">*</span>
              </label>
              <input
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={inputClass}
                placeholder="entretien-revision"
              />
              <p className={clsx("text-xs mt-1", t.txtSubtle)}>/services#{slug || "…"}</p>
            </div>

            {/* Icône */}
            <div>
              <label className={labelClass}>Icône</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                      icon === ic
                        ? "bg-brand-500/20 text-brand-400 border-brand-500/40"
                        : clsx("border-slate-300/30 opacity-60 hover:opacity-90", t.txtMuted),
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Description courte */}
            <div>
              <label className={labelClass}>Description courte</label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className={inputClass + " resize-none"}
                placeholder="Résumé affiché sur la home…"
              />
            </div>

            {/* Description longue */}
            <div>
              <label className={labelClass}>Description complète</label>
              <textarea
                rows={4}
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                className={inputClass + " resize-none"}
                placeholder="Description affichée sur /services…"
              />
            </div>
          </div>

          {/* Error */}
          {saveStatus === "error" && errorMsg && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pb-8">
            <Link href="/admin/services" className="btn-secondary text-sm">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saveStatus !== "idle" || !title.trim() || !slug.trim()}
              aria-busy={saveStatus === "saving"}
              className="btn-primary text-sm py-3 px-6"
            >
              {saveStatus === "saving" ? (
                <><Loader2 size={16} className="animate-spin" /> Création…</>
              ) : saveStatus === "saved" ? (
                <><CheckCircle2 size={16} /> Créé !</>
              ) : (
                <><Save size={16} /> Créer le service</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
