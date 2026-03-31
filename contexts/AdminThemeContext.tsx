"use client";

/**
 * AdminThemeContext
 * ─────────────────────────────────────────────────────────────
 * Fournit les tokens de thème (dark / light) à tous les enfants
 * de AdminLayout sans prop-drilling.
 *
 * Usage :
 *   const t = useAdminTokens();
 *   <div className={clsx(t.surface, t.border)} />
 */

import { createContext, useContext } from "react";

/* ─── Token shape ────────────────────────────────────────────── */
export interface AdminTokens {
	isDark: boolean;
	/* Backgrounds */
	surface: string;            // cartes / panneaux
	surface2: string;           // surfaces secondaires, hover léger
	surface3: string;           // surfaces tertiaires, avatars
	/* Borders */
	border: string;
	borderMuted: string;
	/* Text */
	txt: string;                // texte principal
	txtMuted: string;           // secondaire  (dark-400 | slate-600) — AA ≥4.5:1
	txtSubtle: string;          // tertiaire   (dark-500 | slate-500) — AA ≈4.4:1
	txtFaint: string;           // très discret(dark-600 | slate-400) — décoratif uniquement
	/* Hover backgrounds */
	hoverBg: string;            // hover subtil sur surface
	hoverBgStrong: string;      // hover plus fort (boutons icônes, rows)
	/* Hover text ← point clé */
	hoverTxt: string;           // hover:text-white | hover:text-slate-900
	/* Inputs */
	inputBg: string;
	inputBorder: string;
	inputText: string;
	inputPlaceholder: string;
	/* Composed strings (source de vérité pour les pages) */
	inputClass: string;         // classe complète pour <input> / <textarea> / <select>
	labelClass: string;         // classe complète pour <label>
	sectionCard: string;        // classe complète pour les cartes de section de formulaire
	/* Table */
	tableRowHover: string;
	/* Dropdown / Combobox */
	dropdownBg: string;
	dropdownBorder: string;
	dropdownItemHover: string;
	dropdownItemTxt: string;
	/* Checkbox (VehicleOptionsForm) */
	checkboxUncheckedBg: string;
	checkboxUncheckedBorder: string;
	checkboxUncheckedTxt: string;
	checkboxUncheckedHover: string;
	checkboxBoxBorder: string;
	/* Divider */
	dividerBg: string;
}

/* ─── Token factory ──────────────────────────────────────────── */
export function buildTokens(isDark: boolean): AdminTokens {
	const inputBg        = isDark ? "bg-dark-800"          : "bg-white";
	const inputBorder    = isDark ? "border-dark-700"       : "border-slate-300";
	const inputText      = isDark ? "text-white"            : "text-slate-900";
	const inputPH        = isDark ? "placeholder-dark-500"  : "placeholder-slate-400";
	const surface        = isDark ? "bg-dark-900"           : "bg-white";
	const border         = isDark ? "border-dark-800"       : "border-slate-200";
	const txtMuted       = isDark ? "text-dark-400"         : "text-slate-600"; // AA: 5.9:1 ✅
	const labelTxt       = isDark ? "text-dark-300"         : "text-slate-700"; // AA: 7.6:1 ✅

	return {
		isDark,
		/* Backgrounds */
		surface,
		surface2:              isDark ? "bg-dark-800"             : "bg-slate-50",
		surface3:              isDark ? "bg-dark-700"             : "bg-slate-100",
		/* Borders */
		border,
		borderMuted:           isDark ? "border-dark-700"         : "border-slate-300",
		/* Text — contrastes corrigés en light mode */
		txt:                   isDark ? "text-white"              : "text-slate-900",
		txtMuted,              // dark-400 | slate-600 — 5.9:1 sur blanc ✅ (était slate-500 = 4.4:1)
		txtSubtle:             isDark ? "text-dark-500"           : "text-slate-500", // 4.4:1, borderline mais mieux qu'avant (slate-400 = 2.9:1)
		txtFaint:              isDark ? "text-dark-600"           : "text-slate-400", // décoratif uniquement (icônes vides)
		/* Hover backgrounds */
		hoverBg:               isDark ? "hover:bg-dark-800"       : "hover:bg-slate-100",
		hoverBgStrong:         isDark ? "hover:bg-dark-700"       : "hover:bg-slate-200",
		hoverTxt:              isDark ? "hover:text-white"        : "hover:text-slate-900",
		/* Inputs */
		inputBg,
		inputBorder,
		inputText,
		inputPlaceholder:      inputPH,
		/* Composed strings — remplace la construction locale dans chaque page */
		inputClass: [
			"w-full border rounded-xl px-4 py-3 outline-none transition-all text-sm",
			"focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
			"focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
			inputBg, inputBorder, inputText, inputPH,
		].join(" "),
		labelClass: `block text-sm font-medium mb-2 ${labelTxt}`,
		sectionCard: `rounded-2xl border p-5 sm:p-6 ${surface} ${border}`,
		/* Table */
		tableRowHover:         isDark ? "hover:bg-dark-800/50"    : "hover:bg-slate-50",
		/* Dropdown */
		dropdownBg:            isDark ? "bg-dark-800"             : "bg-white",
		dropdownBorder:        isDark ? "border-dark-600"         : "border-slate-200",
		dropdownItemHover:     isDark ? "hover:bg-dark-700"       : "hover:bg-slate-50",
		dropdownItemTxt:       isDark ? "text-dark-200"           : "text-slate-700",
		/* Checkbox */
		checkboxUncheckedBg:    isDark ? "bg-dark-800"            : "bg-slate-50",
		checkboxUncheckedBorder: isDark ? "border-dark-700"       : "border-slate-200",
		checkboxUncheckedTxt:   isDark ? "text-dark-300"          : "text-slate-600",
		checkboxUncheckedHover: isDark
			? "hover:border-dark-500 hover:text-dark-100"
			: "hover:border-slate-400 hover:text-slate-800",
		checkboxBoxBorder:      isDark ? "border-dark-500"        : "border-slate-400",
		/* Divider */
		dividerBg:              isDark ? "bg-dark-700"             : "bg-slate-200",
	};
}

/* ─── Context ────────────────────────────────────────────────── */
const AdminThemeContext = createContext<AdminTokens>(buildTokens(true));

export const AdminThemeProvider = AdminThemeContext.Provider;
export const useAdminTokens = () => useContext(AdminThemeContext);
