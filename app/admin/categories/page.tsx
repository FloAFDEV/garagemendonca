"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { adminUI } from "@/lib/admin-ui";
import { Tag, Plus, Pencil, Check, X, Power, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import type { VehicleCategory } from "@/types";
import {
	getCategoriesAdminAction,
	createCategoryAction,
	updateCategoryAction,
} from "./actions";
import CategoryIconPicker from "@/components/admin/CategoryIconPicker";
import { getCategoryIcon } from "@/lib/data/categoryIcons";

// ── Slug helper ───────────────────────────────────────────────────────────────
function slugify(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

// ── Edit card (remplace la ligne d'édition inline en tableau) ─────────────────
function EditCard({
	cat,
	inputClass,
	labelClass,
	onSave,
	onCancel,
}: {
	cat: VehicleCategory;
	inputClass: string;
	labelClass: string;
	onSave: (id: string, input: { label: string; icon?: string; sort_order: number }) => Promise<void>;
	onCancel: () => void;
}) {
	const [label, setLabel]   = useState(cat.label);
	const [icon, setIcon]     = useState(cat.icon ?? "");
	const [order, setOrder]   = useState(String(cat.sort_order));
	const [saving, setSaving] = useState(false);

	async function handleSave() {
		if (!label.trim()) return;
		setSaving(true);
		try {
			await onSave(cat.id, {
				label: label.trim(),
				icon: icon.trim() || undefined,
				sort_order: parseInt(order, 10) || 0,
			});
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="space-y-3 p-1">
			<div>
				<label className={labelClass}>Icône</label>
				<CategoryIconPicker value={icon} onChange={setIcon} />
			</div>
			<div>
				<label className={labelClass} htmlFor={`edit-order-${cat.id}`}>Ordre d'affichage</label>
				<input
					id={`edit-order-${cat.id}`}
					value={order}
					onChange={(e) => setOrder(e.target.value)}
					type="number"
					className={inputClass}
					aria-label="Ordre"
				/>
			</div>
			<div>
				<label className={labelClass} htmlFor={`edit-label-${cat.id}`}>Nom *</label>
				<input
					id={`edit-label-${cat.id}`}
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					className={inputClass}
					aria-label="Label catégorie"
				/>
			</div>
			<div className="flex gap-2 pt-1">
				<button
					onClick={handleSave}
					disabled={saving || !label.trim()}
					className={clsx(adminUI.btnAddItem, "flex-1 justify-center gap-1.5 py-2.5")}
				>
					{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
					Enregistrer
				</button>
				<button
					onClick={onCancel}
					className={clsx(adminUI.btnGhostSm, "px-4 py-2.5")}
					aria-label="Annuler"
				>
					<X size={14} />
				</button>
			</div>
		</div>
	);
}

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({
	cat,
	editing,
	inputClass,
	labelClass,
	t,
	onEdit,
	onCancelEdit,
	onSave,
	onToggle,
}: {
	cat: VehicleCategory;
	editing: boolean;
	inputClass: string;
	labelClass: string;
	t: ReturnType<typeof useAdminTokens>;
	onEdit: () => void;
	onCancelEdit: () => void;
	onSave: (id: string, input: { label: string; icon?: string; sort_order: number }) => Promise<void>;
	onToggle: (cat: VehicleCategory) => void;
}) {
	return (
		<div className={clsx(
			"rounded-2xl border transition-colors",
			t.surface,
			t.isDark ? "border-dark-700" : "border-slate-200",
			editing && (t.isDark ? "border-brand-500/40 bg-dark-800" : "border-brand-200 bg-brand-50/30"),
		)}>
			{editing ? (
				<div className="p-4">
					<p className={clsx("text-xs font-medium mb-3", "text-brand-500")}>
						Modifier — {cat.label}
					</p>
					<EditCard
						cat={cat}
						inputClass={inputClass}
						labelClass={labelClass}
						onSave={onSave}
						onCancel={onCancelEdit}
					/>
				</div>
			) : (
				<div className="flex items-center gap-3 px-4 py-3.5">
					{/* Icône */}
					<div className={clsx(
						"w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl",
						t.isDark ? "bg-dark-700" : "bg-slate-100",
					)}>
						{(() => {
							const Icon = getCategoryIcon(cat.icon);
							return Icon
								? <Icon size={18} className="text-brand-500" aria-hidden="true" />
								: <Tag size={18} className={t.txtFaint} aria-hidden="true" />;
						})()}
					</div>

					{/* Infos */}
					<div className="flex-1 min-w-0">
						<p className={clsx("font-medium text-sm truncate", t.txt)}>
							{cat.label}
						</p>
						<p className={clsx("text-xs truncate mt-0.5", t.txtSubtle)}>
							/occasions/
							<span className="font-mono">{cat.slug}</span>
							<span className={clsx("ml-2", t.txtFaint)}>· ordre {cat.sort_order}</span>
						</p>
					</div>

					{/* Statut + actions */}
					<div className="flex items-center gap-2 flex-shrink-0">
						<span className={cat.is_active ? adminUI.badgePublished : adminUI.badgeDraft}>
							{cat.is_active ? "Actif" : "Inactif"}
						</span>
						<button
							onClick={onEdit}
							className={clsx(
								"w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
								t.txtSubtle, t.hoverBgStrong, t.hoverTxt,
							)}
							aria-label={`Modifier ${cat.label}`}
						>
							<Pencil size={15} />
						</button>
						<button
							onClick={() => onToggle(cat)}
							className={clsx(
								"w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
								cat.is_active
									? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
									: clsx(t.txtSubtle, t.hoverBgStrong),
							)}
							aria-label={cat.is_active ? `Désactiver ${cat.label}` : `Activer ${cat.label}`}
							title={cat.is_active ? "Désactiver" : "Activer"}
						>
							<Power size={15} />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
	const t = useAdminTokens();

	const [categories, setCategories] = useState<VehicleCategory[]>([]);
	const [loading,    setLoading]    = useState(true);
	const [editingId,  setEditingId]  = useState<string | null>(null);
	const [showCreate, setShowCreate] = useState(false);

	// Create form state
	const [newLabel,     setNewLabel]     = useState("");
	const [newSlug,      setNewSlug]      = useState("");
	const [newIcon,      setNewIcon]      = useState("");
	const [newOrder,     setNewOrder]     = useState("0");
	const [creating,     setCreating]     = useState(false);
	const [slugTouched,  setSlugTouched]  = useState(false);

	useEffect(() => {
		getCategoriesAdminAction()
			.then(setCategories)
			.catch(() => toast.error("Impossible de charger les catégories"))
			.finally(() => setLoading(false));
	}, []);

	const handleSaveEdit = useCallback(async (
		id: string,
		input: { label: string; icon?: string; sort_order: number },
	) => {
		const updated = await updateCategoryAction(id, input);
		setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
		setEditingId(null);
		toast.success("Catégorie mise à jour");
	}, []);

	const handleToggle = useCallback(async (cat: VehicleCategory) => {
		try {
			const updated = await updateCategoryAction(cat.id, { is_active: !cat.is_active });
			setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
			toast.success(updated.is_active ? "Catégorie activée" : "Catégorie désactivée");
		} catch {
			toast.error("Erreur lors de la mise à jour");
		}
	}, []);

	function resetCreate() {
		setNewLabel(""); setNewSlug(""); setNewIcon(""); setNewOrder("0");
		setSlugTouched(false); setShowCreate(false);
	}

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		if (!newLabel.trim() || !newSlug.trim()) return;
		setCreating(true);
		try {
			const cat = await createCategoryAction({
				slug: newSlug.trim(),
				label: newLabel.trim(),
				icon: newIcon.trim() || undefined,
				sort_order: parseInt(newOrder, 10) || 0,
			});
			setCategories((prev) =>
				[...prev, cat].sort((a, b) => a.sort_order - b.sort_order),
			);
			resetCreate();
			toast.success("Catégorie créée");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Erreur lors de la création";
			toast.error(msg.includes("duplicate") ? "Ce slug existe déjà" : msg);
		} finally {
			setCreating(false);
		}
	}

	const sectionClass = clsx(
		"rounded-2xl border p-4 sm:p-5",
		t.surface,
		t.isDark ? "border-dark-700" : "border-slate-200",
	);

	return (
		<AdminLayout>
			<div className="max-w-2xl mx-auto space-y-5">
				{/* ── Header ── */}
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className={clsx("text-xl font-heading font-semibold flex items-center gap-2", t.txt)}>
							<Tag size={18} className="text-brand-500" aria-hidden="true" />
							Catégories
						</h1>
						<p className={clsx("text-sm mt-0.5", t.txtSubtle)}>
							Définit les URLs <span className="font-mono">/occasions/[catégorie]</span>
						</p>
					</div>
					{!showCreate && (
						<button
							onClick={() => setShowCreate(true)}
							className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
						>
							<Plus size={16} />
							<span className="hidden xs:inline">Nouvelle</span>
							<span className="xs:hidden sr-only">Nouvelle catégorie</span>
						</button>
					)}
				</div>

				{/* ── Formulaire de création ── */}
				{showCreate && (
					<div className={sectionClass}>
						<h2 className={clsx("font-heading font-medium mb-4", t.txt)}>
							Nouvelle catégorie
						</h2>
						<form onSubmit={handleCreate} className="space-y-4">
							<div>
								<label className={t.labelClass} htmlFor="cat-label">Nom *</label>
								<input
									id="cat-label"
									required
									value={newLabel}
									onChange={(e) => {
										setNewLabel(e.target.value);
										if (!slugTouched) setNewSlug(slugify(e.target.value));
									}}
									placeholder="Voitures"
									className={t.inputClass}
								/>
							</div>
							<div>
								<label className={t.labelClass}>Icône</label>
								<CategoryIconPicker value={newIcon} onChange={setNewIcon} />
							</div>
							<div>
								<label className={t.labelClass} htmlFor="cat-slug">Slug URL *</label>
								<input
									id="cat-slug"
									required
									value={newSlug}
									onChange={(e) => {
										setNewSlug(slugify(e.target.value));
										setSlugTouched(true);
									}}
									placeholder="voitures"
									className={clsx(t.inputClass, "font-mono text-sm")}
								/>
								{newSlug && (
									<p className={clsx("text-xs mt-1", t.txtSubtle)}>
										/occasions/{newSlug}
									</p>
								)}
							</div>
							<div>
								<label className={t.labelClass} htmlFor="cat-order">Ordre d'affichage</label>
								<input
									id="cat-order"
									type="number"
									value={newOrder}
									onChange={(e) => setNewOrder(e.target.value)}
									className={t.inputClass}
								/>
							</div>
							<div className="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={creating || !newLabel.trim() || !newSlug.trim()}
									className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
								>
									{creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
									Créer
								</button>
								<button
									type="button"
									onClick={resetCreate}
									className={clsx(adminUI.btnGhostSm, "px-4 py-3")}
								>
									Annuler
								</button>
							</div>
						</form>
					</div>
				)}

				{/* ── Liste ── */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 size={22} className="animate-spin text-brand-500" />
					</div>
				) : categories.length === 0 ? (
					<div className={clsx(sectionClass, "text-center py-12")}>
						<AlertCircle size={32} className={clsx("mx-auto mb-3", t.txtFaint)} />
						<p className={t.txtSubtle}>Aucune catégorie — créez-en une ci-dessus.</p>
					</div>
				) : (
					<div className="space-y-2">
						{categories.map((cat) => (
							<CategoryCard
								key={cat.id}
								cat={cat}
								editing={editingId === cat.id}
								inputClass={t.inputClass}
								labelClass={t.labelClass}
								t={t}
								onEdit={() => setEditingId(cat.id)}
								onCancelEdit={() => setEditingId(null)}
								onSave={handleSaveEdit}
								onToggle={handleToggle}
							/>
						))}
					</div>
				)}

				<p className={clsx("text-xs pb-4", t.txtFaint)}>
					Les catégories actives sont visibles sur le catalogue public et dans le formulaire de publication des véhicules.
				</p>
			</div>
		</AdminLayout>
	);
}
