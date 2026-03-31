/**
 * adminUI — Source de vérité unique pour le design system admin.
 *
 * Utilise les préfixes `dark:` de Tailwind (html.dark géré par useAdminTheme).
 * Compatible avec le système de tokens AdminThemeContext — les deux coexistent :
 *   - adminUI : classes composées (badges, toggles, boutons action, focus rings)
 *   - t.*     : backgrounds / borders / text layout-level (AdminThemeContext)
 *
 * Ratios de contraste WCAG AA garantis en mode clair :
 *   - text-emerald-800 / bg-emerald-100 → 5.2:1 ✅
 *   - text-blue-800    / bg-blue-100    → 5.9:1 ✅
 *   - text-red-800     / bg-red-100     → 5.4:1 ✅
 *   - text-slate-700   / bg-slate-100   → 6.4:1 ✅
 *   - text-amber-800   / bg-amber-100   → 5.1:1 ✅
 */

export const adminUI = {
	// ── Focus rings ─────────────────────────────────────────────────────────
	/** Focus primaire — pour boutons d'action principaux */
	focusPrimary:
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-dark-900",

	/** Focus neutre — pour boutons icônes, liens nav, toggles secondaires */
	focusGhost:
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",

	/** Focus danger — pour boutons de suppression */
	focusDanger:
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",

	// ── Badges statut véhicule (WCAG AA en light + dark) ───────────────────
	badgePublished:
		"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border " +
		"bg-emerald-100 text-emerald-800 border-emerald-300 " +
		"dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",

	badgeDraft:
		"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border " +
		"bg-slate-100 text-slate-700 border-slate-300 " +
		"dark:bg-dark-700 dark:text-dark-400 dark:border-dark-600",

	badgeScheduled:
		"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border " +
		"bg-blue-100 text-blue-800 border-blue-300 " +
		"dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",

	badgeSold:
		"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border " +
		"bg-red-100 text-red-800 border-red-300 " +
		"dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",

	badgeFeatured:
		"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border " +
		"bg-amber-100 text-amber-800 border-amber-300 " +
		"dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",

	// ── Toggle actif / inactif (service, bannière) ─────────────────────────
	/** Bouton toggle état ON — bg vert lisible en light ET dark */
	toggleOn:
		"inline-flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg border transition-all " +
		"bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 " +
		"dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/25 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",

	/** Bouton toggle état OFF — bg slate lisible en light ET dark */
	toggleOff:
		"inline-flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-lg border transition-all " +
		"bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 " +
		"dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-700/60 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",

	// ── Couleurs de statut (span inline dans un titre) ─────────────────────
	statusActive:    "text-emerald-700 dark:text-emerald-400",
	statusInactive:  "text-slate-600  dark:text-slate-400",
	statusExpired:   "text-red-700    dark:text-red-400",
	statusScheduled: "text-blue-700   dark:text-blue-400",

	// ── Boutons d'action petite taille ─────────────────────────────────────
	/** Bouton de suppression/confirmation danger */
	btnDangerSm:
		"px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors " +
		"bg-red-600 text-[#ffffff] hover:bg-red-700 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",

	/** Bouton fantôme neutre petite taille (ex: Annuler dans confirm delete) */
	btnGhostSm:
		"px-2.5 py-1.5 text-xs rounded-lg transition-colors " +
		"text-slate-700 dark:text-slate-400 " +
		"hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-slate-900 dark:hover:text-slate-100 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",

	/** Bouton icône action (Voir, Modifier, Supprimer dans les listes) */
	iconBtn:
		"p-2 rounded-lg transition-colors " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",

	/** Bouton "Ajouter un item" dans les formulaires (petite taille, accent brand) */
	btnAddItem:
		"inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors " +
		"bg-brand-500/10 text-brand-600 hover:bg-brand-500/20 " +
		"dark:text-brand-400 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",

	// ── Navigation sidebar ─────────────────────────────────────────────────
	navLink:
		"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",

	navLinkActive:
		"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 " +
		"bg-brand-600 text-[#ffffff] shadow-lg " +
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",

	// ── Couleurs de texte corrigées (contraste AA) ─────────────────────────
	/** Texte secondaire — minimum 4.5:1 en light (#475569 sur blanc = 5.9:1) */
	txtSecondary: "text-slate-600 dark:text-dark-400",

	/** Texte tertiaire — hints, compteurs — (#64748b sur blanc = 4.4:1, borderline) */
	txtTertiary:  "text-slate-500 dark:text-dark-500",
} as const;

export type AdminUIKey = keyof typeof adminUI;
