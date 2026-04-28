import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx}",
		"./hooks/**/*.{js,ts,jsx,tsx}",
		"./contexts/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					50: "#fff1f2",
					100: "#ffe0e4",
					200: "#ffc2cb",
					300: "#ff94a3",
					400: "#f95c72",
					500: "#c8102e" /* Rouge logo Garage Mendonca */,
					600: "#a50e25",
					700: "#880c1e",
					800: "#6e0a18",
					900: "#5c0815",
					950: "#330509",
				},
				dark: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b",
					600: "#475569",
					700: "#334155",
					750: "#2a3a50",
					800: "#1e293b",
					850: "#111827",
					900: "#0f172a",
					950: "#020617",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				heading: ["Manrope", "system-ui", "sans-serif"],
			},
			/**
			 * Échelle typographique — Garage Mendonca
			 *
			 * Règle d'or :
			 *   80% → normal (400) | 15% → light (300) | 5% → medium (500)
			 *   font-semibold/bold/black → supprimé du code public
			 *
			 * Classes sémantiques (globals.css) :
			 *   .ty-display    h1 hero     font-light  tracking-tight
			 *   .ty-heading    h2 section  font-normal tracking-tight
			 *   .ty-subheading h3 carte    font-normal tracking-tight
			 *   .ty-body       paragraphe  font-normal text-slate-600
			 *   .ty-caption    secondaire  font-light  text-slate-500
			 *   .ty-label      metadata    font-light  tracking-caps
			 *   .ty-value      prix/chiffre font-medium text-[#0f172a]
			 *   .ty-stat       compteur    font-normal tracking-tight
			 */
			letterSpacing: {
				tightest: "-0.04em",
				tighter: "-0.02em",
				tight: "-0.01em",
				normal: "0em",
				wide: "0.04em",
				wider: "0.08em",
				widest: "0.16em",
				caps: "0.22em",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"hero-pattern":
					"linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.80) 60%, rgba(15,23,42,0.45) 100%)",
			},
			boxShadow: {
				premium: "0 4px 24px -4px rgba(0,0,0,0.35)",
				"premium-lg": "0 12px 48px -8px rgba(0,0,0,0.50)",
				brand: "0 4px 20px -4px rgba(200,16,46,0.35)",
				"brand-lg": "0 8px 32px -4px rgba(200,16,46,0.40)",
				card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
				"card-hover":
					"0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)",
			},
			scale: {
				"107": "1.07",
			},
			transitionDuration: {
				"400": "400ms",
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-out both",
				"slide-up": "slideUp 0.55s ease-out both",
				"slide-in-right": "slideInRight 0.5s ease-out both",
				marquee: "marquee 40s linear infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(22px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				slideInRight: {
					"0%": { opacity: "0", transform: "translateX(22px)" },
					"100%": { opacity: "1", transform: "translateX(0)" },
				},
				marquee: {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(-50%)" },
				},
			},
		},
	},
	plugins: [],
};

export default config;
