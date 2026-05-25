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

/**
 * Lit la préférence depuis le DOM plutôt que depuis localStorage.
 *
 * Le script bloquant dans app/layout.tsx applique la classe "dark" sur <html>
 * AVANT tout paint, de façon synchrone. En lisant depuis le DOM au moment
 * où useState s'initialise (côté client, pendant l'hydratation), on obtient
 * la valeur correcte dès le premier rendu client — sans useEffect, sans flash.
 *
 * Côté serveur (window absent) : retourne "dark" comme valeur de sécurité
 * pour correspondre au rendu SSR (évite les avertissements d'hydratation).
 */
function readFromDOM(): AdminTheme {
	if (typeof window === "undefined") return DEFAULT_THEME;
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
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
	// Initialise depuis le DOM (valeur déjà correcte grâce au script bloquant)
	// → évite le flash post-useEffect qui causait le « layout casse en 2 temps »
	const [theme, setThemeState] = useState<AdminTheme>(readFromDOM);

	// Applique immédiatement au DOM + sauvegarde
	const setTheme = useCallback((next: AdminTheme) => {
		setThemeState(next);
		applyTheme(next);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [theme, setTheme]);

	useEffect(() => {
		// Cas limite : si le script bloquant n'a pas pu s'exécuter (rare),
		// réconcilie avec la valeur réelle de localStorage.
		const stored = readStored();
		if (stored !== theme) {
			setThemeState(stored);
			applyTheme(stored);
		}
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

	return { theme, setTheme, toggleTheme };
}
