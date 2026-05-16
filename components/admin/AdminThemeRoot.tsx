"use client";

/**
 * AdminThemeRoot — à placer UNE SEULE FOIS dans app/admin/layout.tsx.
 *
 * Fournit à tout l'arbre admin :
 *  - AdminThemeProvider   : tokens de thème (t.txt, t.surface…)
 *  - AdminThemeActionsProvider : toggleTheme
 *
 * AdminLayout lit ces deux contextes au lieu d'appeler useAdminTheme()
 * directement, ce qui évite d'avoir deux instances d'état séparées.
 */

import { useMemo } from "react";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import {
	buildTokens,
	AdminThemeProvider,
	AdminThemeActionsProvider,
} from "@/contexts/AdminThemeContext";

export default function AdminThemeRoot({
	children,
}: {
	children: React.ReactNode;
}) {
	const { theme, toggleTheme, mounted } = useAdminTheme();
	const isDark = !mounted || theme === "dark";
	const tokens = useMemo(() => buildTokens(isDark), [isDark]);

	return (
		<AdminThemeActionsProvider value={{ toggleTheme }}>
			<AdminThemeProvider value={tokens}>
				{children}
			</AdminThemeProvider>
		</AdminThemeActionsProvider>
	);
}
