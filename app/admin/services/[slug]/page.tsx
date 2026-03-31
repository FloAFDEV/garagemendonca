"use client";

import { useState, use } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  CheckCircle2, Loader2, Eye, AlertCircle,
  ToggleLeft, ToggleRight, ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { services as seedServices } from "@/lib/data";
import { updateServiceAction } from "../actions";
import type {
  ServiceStep, ServicePricing, ServiceFAQItem,
  ServiceTestimonial, ServiceImage,
} from "@/types";

// ── Types état local ──────────────────────────────────────────────────────────
type StepDraft = ServiceStep;
type PricingDraft = ServicePricing;
type FAQDraft = ServiceFAQItem;
type TestimonialDraft = ServiceTestimonial;
type ImageDraft = ServiceImage;

// ── Composant section collapsible (admin) ─────────────────────────────────────
function AdminSection({
  title, subtitle, children, defaultOpen = true,
}: { title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const t = useAdminTokens();
  return (
    <div className={clsx(t.surface, "rounded-2xl border", t.border, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left",
          "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
        )}
      >
        <div>
          <span className={clsx("font-heading font-normal tracking-widest text-sm", t.txt)}>{title}</span>
          {subtitle && <p className={clsx("text-xs mt-0.5", t.txtSubtle)}>{subtitle}</p>}
        </div>
        <ChevronDown size={16} className={clsx("transition-transform duration-200", t.txtMuted, open && "rotate-180")} />
      </button>
      {open && <div className={clsx("px-5 sm:px-6 pb-6 pt-2 border-t", t.border)}>{children}</div>}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function EditServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = useAdminTokens();
  const router = useRouter();
  const { slug } = use(params);

  const seed = seedServices.find(s => s.slug === slug);

  // ── État contenu ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(seed?.title ?? "");
  const [shortDesc, setShortDesc] = useState(seed?.short_description ?? "");
  const [longDesc, setLongDesc] = useState(seed?.long_description ?? "");
  const [isActive, setIsActive] = useState(seed?.is_active ?? true);

  // ── Prestations ─────────────────────────────────────────────────────────────
  const [features, setFeatures] = useState<string[]>(seed?.features ?? []);
  const [featDragIdx, setFeatDragIdx] = useState<number | null>(null);

  // ── Étapes ──────────────────────────────────────────────────────────────────
  const [steps, setSteps] = useState<StepDraft[]>(seed?.steps ?? []);

  // ── Tarifs ──────────────────────────────────────────────────────────────────
  const [pricing, setPricing] = useState<PricingDraft[]>(seed?.pricing ?? []);

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  const [faq, setFaq] = useState<FAQDraft[]>(seed?.faq ?? []);

  // ── Témoignages ─────────────────────────────────────────────────────────────
  const [testimonials, setTestimonials] = useState<TestimonialDraft[]>(seed?.testimonials ?? []);

  // ── Images ──────────────────────────────────────────────────────────────────
  const [images, setImages] = useState<ImageDraft[]>(seed?.images ?? []);

  // ── Save status ─────────────────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Guard : service introuvable ─────────────────────────────────────────────
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

  // ── Helpers classes ─────────────────────────────────────────────────────────
  const inputClass = [
    "w-full", t.inputBg, "border", t.inputBorder,
    "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
    "rounded-xl px-4 py-3", t.inputText, t.inputPlaceholder,
    "outline-none transition-all text-sm",
  ].join(" ");
  const labelClass = `block text-sm font-medium ${t.txtMuted} mb-2`;
  const addBtnClass = "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-brand-500/10 text-brand-400 hover:bg-brand-500/20";

  // ── Features drag & drop ────────────────────────────────────────────────────
  const handleFeatDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (featDragIdx === null || featDragIdx === idx) return;
    const next = [...features];
    const [moved] = next.splice(featDragIdx, 1);
    next.splice(idx, 0, moved);
    setFeatures(next);
    setFeatDragIdx(idx);
  };

  // ── Steps helpers ───────────────────────────────────────────────────────────
  const addStep = () => setSteps(p => [...p, { order: p.length + 1, title: "", description: "" }]);
  const removeStep = (i: number) => setSteps(p => p.filter((_, j) => j !== i).map((s, j) => ({ ...s, order: j + 1 })));
  const updateStep = (i: number, field: keyof StepDraft, value: string | number) =>
    setSteps(p => p.map((s, j) => j === i ? { ...s, [field]: value } : s));

  // ── Pricing helpers ─────────────────────────────────────────────────────────
  const addPricing = () => setPricing(p => [...p, { label: "", price: "" }]);
  const removePricing = (i: number) => setPricing(p => p.filter((_, j) => j !== i));
  const updatePricing = (i: number, field: keyof PricingDraft, value: string) =>
    setPricing(p => p.map((s, j) => j === i ? { ...s, [field]: value } : s));

  // ── FAQ helpers ─────────────────────────────────────────────────────────────
  const addFaq = () => setFaq(p => [...p, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaq(p => p.filter((_, j) => j !== i));
  const updateFaq = (i: number, field: keyof FAQDraft, value: string) =>
    setFaq(p => p.map((s, j) => j === i ? { ...s, [field]: value } : s));

  // ── Testimonials helpers ────────────────────────────────────────────────────
  const addTestimonial = () => setTestimonials(p => [
    ...p,
    { author: "", location: "", date: "", rating: 5, content: "" },
  ]);
  const removeTestimonial = (i: number) => setTestimonials(p => p.filter((_, j) => j !== i));
  const updateTestimonial = (i: number, field: keyof TestimonialDraft, value: string | number) =>
    setTestimonials(p => p.map((s, j) => j === i ? { ...s, [field]: value } : s));

  // ── Images helpers ──────────────────────────────────────────────────────────
  const updateImageUrl = (i: number, url: string) =>
    setImages(p => p.map((img, j) => j === i ? { ...img, url } : img));
  const updateImageAlt = (i: number, alt: string) =>
    setImages(p => p.map((img, j) => j === i ? { ...img, alt } : img));
  const setPrimary = (i: number) =>
    setImages(p => p.map((img, j) => ({ ...img, is_primary: j === i })));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    const result = await updateServiceAction(slug, {
      title,
      short_description: shortDesc,
      long_description: longDesc,
      features: features.filter(f => f.trim()),
      is_active: isActive,
      steps: steps.filter(s => s.title.trim()),
      pricing: pricing.filter(p => p.label.trim() && p.price.trim()),
      faq: faq.filter(f => f.question.trim() && f.answer.trim()),
      testimonials: testimonials.filter(t => t.author.trim() && t.content.trim()),
      images,
    });
    if (result.ok) {
      setSaveStatus("saved");
      setTimeout(() => router.push("/admin/services"), 1200);
    } else {
      setSaveStatus("error");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Header ── */}
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

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* ── Visibilité ── */}
          <div className={clsx(t.surface, "rounded-2xl border", t.border, "p-5")}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={clsx("font-heading font-normal mb-1 tracking-widest text-sm", t.txt)}>Visibilité</h3>
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

          {/* ── Contenu ── */}
          <AdminSection title="Contenu">
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Titre <span className="text-brand-500">*</span></label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Entretien & Révision" />
              </div>
              <div>
                <label className={labelClass}>Description courte — home <span className="text-brand-500">*</span></label>
                <textarea required rows={3} value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={inputClass + " resize-none"} placeholder="Résumé affiché sur la home et dans les listes…" />
              </div>
              <div>
                <label className={labelClass}>Description complète — page services <span className="text-brand-500">*</span></label>
                <textarea required rows={6} value={longDesc} onChange={e => setLongDesc(e.target.value)} className={inputClass + " resize-none"} placeholder="Description affichée sur la page /services…" />
              </div>
            </div>
          </AdminSection>

          {/* ── Prestations ── */}
          <AdminSection title="Prestations" subtitle={`${features.length} ligne${features.length > 1 ? "s" : ""}`}>
            <div className="space-y-2 mb-3">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setFeatDragIdx(idx)}
                  onDragOver={e => handleFeatDragOver(e, idx)}
                  onDragEnd={() => setFeatDragIdx(null)}
                  className={clsx("flex items-center gap-2 group", featDragIdx === idx && "opacity-50")}
                >
                  <div className={clsx("cursor-grab p-1.5 rounded opacity-40 group-hover:opacity-70 transition-opacity", t.txtMuted)}>
                    <GripVertical size={14} />
                  </div>
                  <input value={feat} onChange={e => setFeatures(p => p.map((f, i) => i === idx ? e.target.value : f))} className={inputClass + " flex-1"} placeholder={`Prestation ${idx + 1}`} />
                  <button type="button" onClick={() => setFeatures(p => p.filter((_, i) => i !== idx))} className="p-1.5 rounded-lg hover:text-red-400 transition-colors opacity-40 group-hover:opacity-70">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {features.length === 0 && <p className={clsx("text-sm text-center py-3", t.txtSubtle)}>Aucune prestation.</p>}
            </div>
            <button type="button" onClick={() => setFeatures(p => [...p, ""])} className={addBtnClass}><Plus size={13} />Ajouter</button>
          </AdminSection>

          {/* ── Processus (étapes) ── */}
          <AdminSection title="Processus" subtitle="Comment ça se passe ?" defaultOpen={false}>
            <div className="space-y-4 mb-3">
              {steps.map((step, i) => (
                <div key={i} className={clsx("rounded-xl border p-4 space-y-3", t.border, t.surface2)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("text-xs font-medium", t.txtMuted)}>Étape {step.order}</span>
                    <button type="button" onClick={() => removeStep(i)} className="p-1 rounded hover:text-red-400 transition-colors opacity-50 hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Titre</label>
                    <input value={step.title} onChange={e => updateStep(i, "title", e.target.value)} className={inputClass} placeholder="Prise en charge" />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows={2} value={step.description} onChange={e => updateStep(i, "description", e.target.value)} className={inputClass + " resize-none"} placeholder="Accueil en atelier, diagnostic offert…" />
                  </div>
                </div>
              ))}
              {steps.length === 0 && <p className={clsx("text-sm text-center py-3", t.txtSubtle)}>Aucune étape.</p>}
            </div>
            <button type="button" onClick={addStep} className={addBtnClass}><Plus size={13} />Ajouter une étape</button>
          </AdminSection>

          {/* ── Tarifs ── */}
          <AdminSection title="Tarifs indicatifs" defaultOpen={false}>
            <div className="space-y-3 mb-3">
              {pricing.map((item, i) => (
                <div key={i} className={clsx("rounded-xl border p-4 space-y-3", t.border, t.surface2)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("text-xs font-medium", t.txtMuted)}>Tarif {i + 1}</span>
                    <button type="button" onClick={() => removePricing(i)} className="p-1 rounded hover:text-red-400 transition-colors opacity-50 hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Libellé</label>
                      <input value={item.label} onChange={e => updatePricing(i, "label", e.target.value)} className={inputClass} placeholder="Vidange + filtre" />
                    </div>
                    <div>
                      <label className={labelClass}>Prix</label>
                      <input value={item.price} onChange={e => updatePricing(i, "price", e.target.value)} className={inputClass} placeholder="à partir de 79 € TTC" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Note (optionnel)</label>
                    <input value={item.note ?? ""} onChange={e => updatePricing(i, "note", e.target.value)} className={inputClass} placeholder="Toutes marques…" />
                  </div>
                </div>
              ))}
              {pricing.length === 0 && <p className={clsx("text-sm text-center py-3", t.txtSubtle)}>Aucun tarif.</p>}
            </div>
            <button type="button" onClick={addPricing} className={addBtnClass}><Plus size={13} />Ajouter un tarif</button>
          </AdminSection>

          {/* ── FAQ ── */}
          <AdminSection title="FAQ" subtitle="Questions fréquentes" defaultOpen={false}>
            <div className="space-y-3 mb-3">
              {faq.map((item, i) => (
                <div key={i} className={clsx("rounded-xl border p-4 space-y-3", t.border, t.surface2)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("text-xs font-medium", t.txtMuted)}>Question {i + 1}</span>
                    <button type="button" onClick={() => removeFaq(i)} className="p-1 rounded hover:text-red-400 transition-colors opacity-50 hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Question</label>
                    <input value={item.question} onChange={e => updateFaq(i, "question", e.target.value)} className={inputClass} placeholder="Peut-on venir sans rendez-vous ?" />
                  </div>
                  <div>
                    <label className={labelClass}>Réponse</label>
                    <textarea rows={3} value={item.answer} onChange={e => updateFaq(i, "answer", e.target.value)} className={inputClass + " resize-none"} placeholder="Oui, vous pouvez…" />
                  </div>
                </div>
              ))}
              {faq.length === 0 && <p className={clsx("text-sm text-center py-3", t.txtSubtle)}>Aucune question.</p>}
            </div>
            <button type="button" onClick={addFaq} className={addBtnClass}><Plus size={13} />Ajouter une question</button>
          </AdminSection>

          {/* ── Témoignages ── */}
          <AdminSection title="Témoignages" defaultOpen={false}>
            <div className="space-y-3 mb-3">
              {testimonials.map((item, i) => (
                <div key={i} className={clsx("rounded-xl border p-4 space-y-3", t.border, t.surface2)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("text-xs font-medium", t.txtMuted)}>Témoignage {i + 1}</span>
                    <button type="button" onClick={() => removeTestimonial(i)} className="p-1 rounded hover:text-red-400 transition-colors opacity-50 hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Auteur</label>
                      <input value={item.author} onChange={e => updateTestimonial(i, "author", e.target.value)} className={inputClass} placeholder="Jean D." />
                    </div>
                    <div>
                      <label className={labelClass}>Lieu</label>
                      <input value={item.location} onChange={e => updateTestimonial(i, "location", e.target.value)} className={inputClass} placeholder="Toulouse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Date</label>
                      <input value={item.date} onChange={e => updateTestimonial(i, "date", e.target.value)} className={inputClass} placeholder="mars 2025" />
                    </div>
                    <div>
                      <label className={labelClass}>Note (1–5)</label>
                      <input
                        type="number" min={1} max={5}
                        value={item.rating}
                        onChange={e => updateTestimonial(i, "rating", Math.max(1, Math.min(5, Number(e.target.value))))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Contenu</label>
                    <textarea rows={3} value={item.content} onChange={e => updateTestimonial(i, "content", e.target.value)} className={inputClass + " resize-none"} placeholder="Très bon accueil, travail rapide…" />
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && <p className={clsx("text-sm text-center py-3", t.txtSubtle)}>Aucun témoignage.</p>}
            </div>
            <button type="button" onClick={addTestimonial} className={addBtnClass}><Plus size={13} />Ajouter un témoignage</button>
          </AdminSection>

          {/* ── Images ── */}
          <AdminSection title="Images" subtitle="Upload Supabase Storage disponible après migration" defaultOpen={false}>
            <p className={clsx("text-xs mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600")}>
              Note : les uploads vers Supabase Storage seront disponibles après migration. Saisir les URLs directement ci-dessous.
            </p>
            <div className="space-y-3">
              {images.map((img, i) => (
                <div key={img.id} className={clsx("rounded-xl border p-4 space-y-3", t.border, t.surface2)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimary(i)}
                        className={clsx(
                          "text-xs px-2 py-1 rounded-lg border transition-colors",
                          img.is_primary
                            ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                            : "border-slate-300/30 opacity-50 hover:opacity-80",
                          t.txtMuted,
                        )}
                      >
                        {img.is_primary ? "★ Principale" : "Rendre principale"}
                      </button>
                    </div>
                    <span className={clsx("text-xs", t.txtSubtle)}>Image {i + 1}</span>
                  </div>
                  <div>
                    <label className={labelClass}>URL</label>
                    <input value={img.url} onChange={e => updateImageUrl(i, e.target.value)} className={inputClass} placeholder="/images/entretien.webp ou https://…" />
                  </div>
                  <div>
                    <label className={labelClass}>Texte alternatif</label>
                    <input value={img.alt ?? ""} onChange={e => updateImageAlt(i, e.target.value)} className={inputClass} placeholder="Description de l'image pour l'accessibilité" />
                  </div>
                  {img.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt={img.alt ?? "Preview"} className="rounded-xl w-full max-h-36 object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                  )}
                </div>
              ))}
            </div>
          </AdminSection>

          {/* ── Submit ── */}
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
