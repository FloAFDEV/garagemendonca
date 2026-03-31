"use client";

import { useState, useEffect, useCallback } from "react";

export type AdminTheme = "dark" | "light";

const STORAGE_KEY = "admin-theme";
const DEFAULT_THEME: AdminTheme = "dark";

function readStored(): AdminTheme {
	if (typeof window === "undefined") return DEFAULT_THEME;
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		if (v === "dark" || v === "light") return v;
	} catch {
		// localStorage inaccessible (SSR / incognito strict)
	}
	return DEFAULT_THEME;
}

function applyTheme(theme: AdminTheme) {
	document.documentElement.classList.toggle("dark", theme === "dark");
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// ignore
	}
}

export function useAdminTheme() {
	// Initialise synchronously from localStorage → pas de FOUC post-hydration
	const [theme, setThemeState] = useState<AdminTheme>(readStored);
	const [mounted, setMounted] = useState(false);

	// Applique immédiatement au DOM + sauvegarde
	const setTheme = useCallback((next: AdminTheme) => {
		setThemeState(next);
		applyTheme(next);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	useEffect(() => {
		setMounted(true);
		// Applique le thème initial au DOM (au cas où le script anti-FOUC aurait raté)
		applyTheme(theme);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Synchronisation cross-onglets via l'événement "storage"
	useEffect(() => {
		const handler = (e: StorageEvent) => {
			if (e.key !== STORAGE_KEY) return;
			const next = e.newValue;
			if (next === "dark" || next === "light") {
				setThemeState(next);
				document.documentElement.classList.toggle("dark", next === "dark");
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, []);

	return { theme, setTheme, toggleTheme, mounted };
}
