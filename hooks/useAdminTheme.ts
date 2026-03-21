"use client";

import { useState, useEffect } from "react";

export type AdminTheme = "dark" | "light";

const STORAGE_KEY = "admin-theme";

export function useAdminTheme() {
	const [theme, setTheme] = useState<AdminTheme>("dark");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
		if (stored === "light" || stored === "dark") {
			setTheme(stored);
		} else {
			setTheme("dark"); // 🔥 force défaut
		}
		setMounted(true);
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return { theme, toggleTheme, mounted };
}
