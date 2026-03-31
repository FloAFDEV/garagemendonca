"use client";

import { useState, use } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, CheckCircle2, Loader2, Eye, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import clsx from "clsx";
import { services as seedServices } from "@/lib/data";
import { updateServiceAction } from "../actions";

export default function EditServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = useAdminTokens();
  const router = useRouter();
  const { slug } = use(params);

  const seed = seedServices.find(s => s.slug === slug);

  const [title, setTitle] = useState(seed?.title ?? "");
  const [shortDesc, setShortDesc] = useState(seed?.short_description ?? "");
  const [longDesc, setLongDesc] = useState(seed?.long_description ?? "");
  const [features, setFeatures] = useState<string[]>(seed?.features ?? []);
  const primaryImage = seed?.images.find((i) => i.is_primary) ?? seed?.images[0];
  const [photoUrl, setPhotoUrl] = useState(primaryImage?.url ?? "");
  const [isActive, setIsActive] = useState(seed?.is_active ?? true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  if (!seed) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className={clsx("font-heading font-medium text-xl", t.txt)}>Service introuvable</h2>
          <Link href="/admin/services" className="btn-primary text-sm"><ArrowLeft size={15} />Retour</Link>
        </div>
      </AdminLayout>
    );
  }

  const addFeature = () => setFeatures(p => [...p, ""]);
  const removeFeature = (idx: number) => setFeatures(p => p.filter((_, i) => i !== idx));
  const updateFeature = (idx: number, val: string) => setFeatures(p => p.map((f, i) => i === idx ? val : f));

  // Simple drag reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...features];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setFeatures(next);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    const primaryImg = seed.images.find((i) => i.is_primary) ?? seed.images[0];
    const result = await updateServiceAction(slug, {
      title,
      short_description: shortDesc,
      long_description: longDesc,
      features: features.filter(f => f.trim()),
      is_active: isActive,
      images: primaryImg
        ? [{ ...primaryImg, url: photoUrl }]
        : [],
    });
    if (result.ok) {
      setSaveStatus("saved");
      setTimeout(() => router.push("/admin/services"), 1200);
    } else {
      setSaveStatus("error");
    }
  };

  const inputClass = ["w-full", t.inputBg, "border", t.inputBorder, "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20", "rounded-xl px-4 py-3", t.inputText, t.inputPlaceholder, "outline-none transition-all text-sm"].join(" ");
  const labelClass = `block text-sm font-medium ${t.txtMuted} mb-2`;
  const sectionClass = `${t.surface} rounded-2xl border ${t.border} p-5 sm:p-6`;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/services" className={clsx("p-2 rounded-xl transition-colors", t.txtMuted, t.hoverTxt, t.hoverBg)}>
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>Modifier le service</h2>
            <p className={clsx("text-sm mt-1", t.txtMuted)}>{seed.title}</p>
          </div>
          <Link href={`/services#${slug}`} target="_blank" className={clsx("flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors", t.txtMuted, t.hoverTxt, t.hoverBg)}>
            <Eye size={16} /><span className="hidden sm:inline">Prévisualiser</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Statut */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={clsx("font-heading font-normal mb-1 tracking-widest", t.txt)}>Visibilité</h3>
                <p className={clsx("text-xs", t.txtSubtle)}>Active ou désactive ce service sur la page publique.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(v => !v)}
                className={clsx(
                  "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all border",
                  isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-slate-500/10 text-slate-400 border-slate-500/20",
                )}
              >
                {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {isActive ? "Actif" : "Inactif"}
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className={sectionClass}>
            <h3 className={clsx("font-heading font-normal mb-6 tracking-widest", t.txt)}>Contenu</h3>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Titre <span className="text-brand-500">*</span></label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Entretien & Révision" />
              </div>
              <div>
                <label className={labelClass}>Description courte <span className="text-brand-500">*</span></label>
                <textarea required rows={3} value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={inputClass + " resize-none"} placeholder="Résumé affiché dans les cartes et listes…" />
              </div>
              <div>
                <label className={labelClass}>Description longue <span className="text-brand-500">*</span></label>
                <textarea required rows={6} value={longDesc} onChange={e => setLongDesc(e.target.value)} className={inputClass + " resize-none"} placeholder="Description complète affichée sur la page /services…" />
              </div>
            </div>
          </div>

          {/* Prestations */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={clsx("font-heading font-normal tracking-widest", t.txt)}>Prestations</h3>
              <button type="button" onClick={addFeature} className={clsx("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-brand-500/10 text-brand-400 hover:bg-brand-500/20")}>
                <Plus size={13} />Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={clsx("flex items-center gap-2 group", dragIdx === idx && "opacity-50")}
                >
                  <div className={clsx("cursor-grab p-1.5 rounded opacity-40 group-hover:opacity-70 transition-opacity", t.txtMuted)}>
                    <GripVertical size={14} />
                  </div>
                  <input
                    value={feat}
                    onChange={e => updateFeature(idx, e.target.value)}
                    className={inputClass + " flex-1"}
                    placeholder={`Prestation ${idx + 1}`}
                  />
                  <button type="button" onClick={() => removeFeature(idx)} className="p-1.5 rounded-lg hover:text-red-400 transition-colors opacity-40 group-hover:opacity-70">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {features.length === 0 && (
                <p className={clsx("text-sm text-center py-4", t.txtSubtle)}>Aucune prestation — cliquez sur Ajouter.</p>
              )}
            </div>
          </div>

          {/* Photo */}
          <div className={sectionClass}>
            <h3 className={clsx("font-heading font-normal mb-6 tracking-widest", t.txt)}>Photo</h3>
            <div>
              <label className={labelClass}>URL de l&apos;image</label>
              <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className={inputClass} placeholder="/images/entretien.webp ou https://…" />
            </div>
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Preview" className="mt-4 rounded-xl w-full max-h-48 object-cover" onError={e => (e.currentTarget.style.display = "none")} />
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 pt-2 pb-8">
            <Link href="/admin/services" className="btn-secondary text-sm">Annuler</Link>
            <button type="submit" disabled={saveStatus !== "idle"} className="btn-primary text-sm py-3 px-6 sm:px-8">
              {saveStatus === "saving" ? (<><Loader2 size={16} className="animate-spin" />Enregistrement…</>)
              : saveStatus === "saved" ? (<><CheckCircle2 size={16} />Enregistré !</>)
              : saveStatus === "error" ? (<><AlertCircle size={16} />Erreur</>)
              : (<><Save size={16} />Enregistrer</>)}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
