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
	txtMuted: string;           // secondaire  (dark-400 | slate-500)
	txtSubtle: string;          // tertiaire   (dark-500 | slate-400)
	txtFaint: string;           // très discret(dark-600 | slate-300)
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
	return {
		isDark,
		/* Backgrounds */
		surface:               isDark ? "bg-dark-900"             : "bg-white",
		surface2:              isDark ? "bg-dark-800"             : "bg-slate-50",
		surface3:              isDark ? "bg-dark-700"             : "bg-slate-100",
		/* Borders */
		border:                isDark ? "border-dark-800"         : "border-slate-200",
		borderMuted:           isDark ? "border-dark-700"         : "border-slate-300",
		/* Text */
		txt:                   isDark ? "text-white"              : "text-slate-900",
		txtMuted:              isDark ? "text-dark-400"           : "text-slate-500",
		txtSubtle:             isDark ? "text-dark-500"           : "text-slate-400",
		txtFaint:              isDark ? "text-dark-600"           : "text-slate-300",
		/* Hover backgrounds */
		hoverBg:               isDark ? "hover:bg-dark-800"       : "hover:bg-slate-100",
		hoverBgStrong:         isDark ? "hover:bg-dark-700"       : "hover:bg-slate-200",
		/* Hover text ← LA CORRECTION CLÉ */
		hoverTxt:              isDark ? "hover:text-white"        : "hover:text-slate-900",
		/* Inputs */
		inputBg:               isDark ? "bg-dark-800"             : "bg-white",
		inputBorder:           isDark ? "border-dark-700"         : "border-slate-300",
		inputText:             isDark ? "text-white"              : "text-slate-900",
		inputPlaceholder:      isDark ? "placeholder-dark-500"    : "placeholder-slate-400",
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
