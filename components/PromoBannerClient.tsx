"use client";

import { useState, useEffect } from "react";
import type { Banner } from "@/types";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

const DISMISS_KEY = "promo_banner_dismissed";

/*
  ─── Centered Spotlight ──────────────────────────────────────
  Layout :
    [image de fond pleine largeur, assombrie]
    [overlay couleur bg_color semi-transparent]
    [centré : TITRE FORT · description grisée · [CTA outline]]
    [X en position absolue, coin droit, centré verticalement]

  UX :
  - Titre en `text-brand-400` : accroche immédiate
  - Description atténuée (white/65) : hiérarchie claire sans bruit
  - CTA outline blanc : lisible sur n'importe quelle couleur de fond
  - X isolé en `absolute` hors du flux → ne décale jamais le texte
  - Animation entrée douce (max-height + opacity)
  - Responsive : description masquée sur mobile, tout reste lisible
  ─────────────────────────────────────────────────────────────
*/

export default function PromoBannerClient({
	banner,
	signedImageUrl,
}: {
	banner?: Banner | null;
	signedImageUrl?: string;
}) {
	if (!banner) return null;

	const [visible, setVisible] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);

		if (banner.is_dismissible) {
			try {
				if (sessionStorage.getItem(DISMISS_KEY) === banner.id) return;
			} catch { /* ignore */ }
		}

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (prefersReduced) {
			setVisible(true);
		} else {
			const t = setTimeout(() => setVisible(true), 60);
			return () => clearTimeout(t);
		}
	}, [banner.id, banner.is_dismissible]);

	const dismiss = () => {
		setVisible(false);
		try {
			if (banner.is_dismissible) sessionStorage.setItem(DISMISS_KEY, banner.id);
		} catch { /* ignore */ }
	};

	if (!mounted) return null;

	return (
		<div
			role="banner"
			aria-live="polite"
			style={{
				maxHeight: visible ? "80px" : "0px",
				opacity: visible ? 1 : 0,
				overflow: "hidden",
				transition: "max-height 0.35s ease-out, opacity 0.3s ease-out",
			}}
			className="relative w-full motion-reduce:transition-none"
		>
			{/* ── Fond : image + overlay couleur ───────────────────── */}
			<div
				className="relative w-full overflow-hidden"
				style={{ backgroundColor: banner.bg_color || "#111827" }}
			>
				{/* Image en fond, très atténuée — la vraie image est dans l'icône */}
				{signedImageUrl && (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={signedImageUrl}
							alt=""
							aria-hidden="true"
							className="absolute inset-0 w-full h-full object-cover object-center"
							style={{ opacity: 0.35 }}
							loading="eager"
							decoding="sync"
						/>
						<div
							aria-hidden="true"
							className="absolute inset-0"
							style={{ backgroundColor: `${banner.bg_color || "#111827"}88` }}
						/>
					</>
				)}

				{/* ── Bouton fermeture — position absolue, hors flux ── */}
				{banner.is_dismissible && (
					<button
						type="button"
						onClick={dismiss}
						aria-label="Fermer la bannière"
						className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 active:scale-95 transition-all text-white"
					>
						<X size={13} />
					</button>
				)}

				{/* ── Contenu centré ───────────────────────────────── */}
				<div className="relative max-w-5xl mx-auto px-4 sm:px-12 py-3 flex items-center justify-center gap-4 sm:gap-5 min-h-[68px]">

					{/* Image — icône illustration à gauche, carrée arrondie */}
					{signedImageUrl && (
						<div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={signedImageUrl}
								alt=""
								aria-hidden="true"
								className="w-full h-full object-cover object-center"
								loading="eager"
								decoding="sync"
							/>
						</div>
					)}

					{/* Textes + CTA groupés */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 flex-1 min-w-0 justify-center">
						<div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 min-w-0">
							<p className="text-sm sm:text-base font-bold leading-tight text-white tracking-tight whitespace-nowrap">
								{banner.message}
							</p>
							{banner.sub_message && (
								<span className="hidden sm:inline text-white/70 text-xs sm:text-sm font-normal leading-tight">
									—&nbsp;{banner.sub_message}
								</span>
							)}
						</div>

						{/* CTA */}
						{banner.cta_label && banner.cta_url && (
							<Link
								href={banner.cta_url}
								className="flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 border border-white/40 hover:border-white hover:bg-white/10 active:bg-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
							>
								{banner.cta_label}
								<ArrowRight size={11} aria-hidden="true" />
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
