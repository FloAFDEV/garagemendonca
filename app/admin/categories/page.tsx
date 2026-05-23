"use client";

import { useState, useEffect } from "react";
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

// ── Slug helper ──────────────────────────────────────────────────────────────

function slugify(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

// ── Edit row ─────────────────────────────────────────────────────────────────

function EditRow({
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
	const [label, setLabel]       = useState(cat.label);
	const [icon, setIcon]         = useState(cat.icon ?? "");
	const [order, setOrder]       = useState(String(cat.sort_order));
	const [saving, setSaving]     = useState(false);

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
		<tr>
			<td className="px-4 py-3">
				<input
					value={icon}
					onChange={(e) => setIcon(e.target.value)}
					placeholder="🚗"
					className={clsx(inputClass, "w-16 text-center text-xl")}
					aria-label="Icône emoji"
				/>
			</td>
			<td className="px-4 py-3">
				<input
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					className={inputClass}
					aria-label="Label catégorie"
				/>
			</td>
			<td className="px-4 py-3 font-mono text-xs opacity-50">{cat.slug}</td>
			<td className="px-4 py-3">
				<input
					value={order}
					onChange={(e) => setOrder(e.target.value)}
					type="number"
					className={clsx(inputClass, "w-16")}
					aria-label="Ordre"
				/>
			</td>
			<td className="px-4 py-3" />
			<td className="px-4 py-3">
				<div className="flex items-center gap-2">
					<button
						onClick={handleSave}
						disabled={saving || !label.trim()}
						className={clsx(adminUI.btnAddItem, "gap-1.5")}
						aria-label="Enregistrer"
					>
						{saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
						Enregistrer
					</button>
					<button onClick={onCancel} className={adminUI.btnGhostSm} aria-label="Annuler">
						<X size={13} />
					</button>
				</div>
			</td>
		</tr>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
	const t = useAdminTokens();

	const [categories, setCategories] = useState<VehicleCategory[]>([]);
	const [loading,    setLoading]    = useState(true);
	const [editingId,  setEditingId]  = useState<string | null>(null);
	const [showCreate, setShowCreate] = useState(false);

	// Create form state
	const [newLabel, setNewLabel] = useState("");
	const [newSlug,  setNewSlug]  = useState("");
	const [newIcon,  setNewIcon]  = useState("");
	const [newOrder, setNewOrder] = useState("0");
	const [creating, setCreating] = useState(false);
	const [slugTouched, setSlugTouched] = useState(false);

	useEffect(() => {
		getCategoriesAdminAction()
			.then(setCategories)
			.catch(() => toast.error("Impossible de charger les catégories"))
			.finally(() => setLoading(false));
	}, []);

	async function handleSaveEdit(
		id: string,
		input: { label: string; icon?: string; sort_order: number },
	) {
		try {
			const updated = await updateCategoryAction(id, input);
			setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
			setEditingId(null);
			toast.success("Catégorie mise à jour");
		} catch {
			toast.error("Erreur lors de la mise à jour");
		}
	}

	async function handleToggle(cat: VehicleCategory) {
		try {
			const updated = await updateCategoryAction(cat.id, { is_active: !cat.is_active });
			setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
			toast.success(updated.is_active ? "Catégorie activée" : "Catégorie désactivée");
		} catch {
			toast.error("Erreur lors de la mise à jour");
		}
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
			setCategories((prev) => [...prev, cat].sort((a, b) => a.sort_order - b.sort_order));
			setNewLabel(""); setNewSlug(""); setNewIcon(""); setNewOrder("0");
			setSlugTouched(false);
			setShowCreate(false);
			toast.success("Catégorie créée");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Erreur lors de la création";
			toast.error(msg.includes("duplicate") ? "Ce slug existe déjà" : msg);
		} finally {
			setCreating(false);
		}
	}

	const sectionClass = `rounded-2xl border p-4 sm:p-5 ${t.surface} ${t.isDark ? "border-dark-700" : "border-slate-200"}`;

	return (
		<AdminLayout>
			<div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className={`text-2xl font-heading font-semibold ${t.txt}`}>
							<Tag size={20} className="inline-block mr-2 text-brand-500" aria-hidden="true" />
							Catégories
						</h1>
						<p className={`text-sm mt-1 ${t.txtSubtle}`}>
							Gestion des catégories de véhicules — définit les URLs /occasions/[catégorie]
						</p>
					</div>
					{!showCreate && (
						<button
							onClick={() => setShowCreate(true)}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
						>
							<Plus size={16} />
							Nouvelle
						</button>
					)}
				</div>

				{/* Create form */}
				{showCreate && (
					<div className={sectionClass}>
						<h2 className={`font-heading font-medium ${t.txt} mb-4`}>Nouvelle catégorie</h2>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
									<label className={t.labelClass} htmlFor="cat-slug">
										Slug URL *
									</label>
									<input
										id="cat-slug"
										required
										value={newSlug}
										onChange={(e) => { setNewSlug(slugify(e.target.value)); setSlugTouched(true); }}
										placeholder="voitures"
										className={`${t.inputClass} font-mono text-sm`}
									/>
									{newSlug && (
										<p className={`text-xs mt-1 ${t.txtSubtle}`}>/occasions/{newSlug}</p>
									)}
								</div>
								<div>
									<label className={t.labelClass} htmlFor="cat-icon">Icône emoji</label>
									<input
										id="cat-icon"
										value={newIcon}
										onChange={(e) => setNewIcon(e.target.value)}
										placeholder="🚗"
										className={`${t.inputClass} text-xl`}
									/>
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
							</div>
							<div className="flex gap-3">
								<button
									type="submit"
									disabled={creating || !newLabel.trim() || !newSlug.trim()}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
								>
									{creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
									Créer
								</button>
								<button
									type="button"
									onClick={() => { setShowCreate(false); setNewLabel(""); setNewSlug(""); setNewIcon(""); setNewOrder("0"); setSlugTouched(false); }}
									className={adminUI.btnGhostSm + " px-4 py-2 text-sm"}
								>
									Annuler
								</button>
							</div>
						</form>
					</div>
				)}

				{/* List */}
				<div className={sectionClass}>
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 size={22} className="animate-spin text-brand-500" />
						</div>
					) : categories.length === 0 ? (
						<div className="text-center py-12">
							<AlertCircle size={32} className={`mx-auto mb-3 ${t.txtFaint}`} />
							<p className={t.txtSubtle}>Aucune catégorie — créez-en une ci-dessus.</p>
						</div>
					) : (
						<div className="overflow-x-auto -mx-1">
							<table className="w-full text-sm">
								<thead>
									<tr className={`text-left text-xs uppercase tracking-wider ${t.txtSubtle} border-b ${t.border}`}>
										<th className="px-4 pb-3 font-medium">Icône</th>
										<th className="px-4 pb-3 font-medium">Nom</th>
										<th className="px-4 pb-3 font-medium">Slug</th>
										<th className="px-4 pb-3 font-medium">Ordre</th>
										<th className="px-4 pb-3 font-medium">Statut</th>
										<th className="px-4 pb-3 font-medium" />
									</tr>
								</thead>
								<tbody className={`divide-y ${t.border}`}>
									{categories.map((cat) =>
										editingId === cat.id ? (
											<EditRow
												key={cat.id}
												cat={cat}
												inputClass={t.inputClass}
												labelClass={t.labelClass}
												onSave={handleSaveEdit}
												onCancel={() => setEditingId(null)}
											/>
										) : (
											<tr key={cat.id} className={t.tableRowHover}>
												<td className="px-4 py-3 text-xl text-center">
													{cat.icon || <span className={t.txtFaint}>—</span>}
												</td>
												<td className={`px-4 py-3 font-medium ${t.txt}`}>
													{cat.label}
												</td>
												<td className={`px-4 py-3 font-mono text-xs ${t.txtSubtle}`}>
													{cat.slug}
												</td>
												<td className={`px-4 py-3 ${t.txtSubtle}`}>
													{cat.sort_order}
												</td>
												<td className="px-4 py-3">
													<span className={cat.is_active ? adminUI.badgePublished : adminUI.badgeDraft}>
														{cat.is_active ? "Actif" : "Inactif"}
													</span>
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2 justify-end">
														<button
															onClick={() => setEditingId(cat.id)}
															className={clsx(adminUI.iconBtn, t.txtSubtle, t.hoverBgStrong, t.hoverTxt)}
															title="Modifier"
															aria-label="Modifier"
														>
															<Pencil size={14} />
														</button>
														<button
															onClick={() => handleToggle(cat)}
															className={cat.is_active ? adminUI.toggleOn : adminUI.toggleOff}
															title={cat.is_active ? "Désactiver" : "Activer"}
															aria-label={cat.is_active ? "Désactiver" : "Activer"}
														>
															<Power size={13} />
														</button>
													</div>
												</td>
											</tr>
										),
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<p className={`text-xs ${t.txtFaint}`}>
					Les catégories actives sont visibles sur le catalogue public et dans le formulaire de publication des véhicules.
				</p>
			</div>
		</AdminLayout>
	);
}
