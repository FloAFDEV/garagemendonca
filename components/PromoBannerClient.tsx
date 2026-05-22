"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Banner } from "@/types";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import clsx from "clsx";

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
	// ── Hooks TOUJOURS appelés en premier — Rules of Hooks ─────────────────
	// Ne jamais placer de return conditionnel avant useState/useEffect.
	// L'ancien `if (!banner) return null` placé ici causait l'erreur React :
	// "The children should not have changed if we pass in the same set"
	// car le nombre de hooks appelés variait entre les renders.
	const [visible, setVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		// Guard : banner peut être null (type défensif) — ne rien faire
		if (!banner) return;

		setMounted(true);

		// ── Vérification dates côté client (toujours fraîche, pas de cache) ──
		const now = new Date();
		if (banner.scheduled_start && new Date(banner.scheduled_start) > now) return;
		if (banner.scheduled_end   && new Date(banner.scheduled_end)   < now) return;

		// ── Vérification pages d'affichage ──
		if (banner.display_pages === "home_only" && pathname !== "/") return;

		// Le dismiss est volontairement en mémoire uniquement (pas de sessionStorage) :
		// la bannière réapparaît à chaque refresh et à chaque changement de page.
		// L'utilisateur doit la fermer explicitement sur chaque chargement.

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (prefersReduced) {
			setVisible(true);
		} else {
			const t = setTimeout(() => setVisible(true), 60);
			return () => clearTimeout(t);
		}
	}, [
		banner?.id,
		banner?.is_dismissible,
		banner?.scheduled_start,
		banner?.scheduled_end,
		banner?.display_pages,
		pathname,
	]);

	const dismiss = () => {
		setVisible(false);
		// Pas de persistance — le dismiss est in-memory uniquement.
		// Refresh ou navigation → la bannière réapparaît.
	};

	// Rendu null si aucune bannière ou avant montage client
	if (!banner || !mounted) return null;

	return (
		<div
			role="banner"
			aria-live="polite"
			style={{
				maxHeight: visible ? "180px" : "0px",
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
				<div className={clsx(
					"relative max-w-5xl mx-auto py-2.5 sm:py-3 flex items-center justify-center gap-2.5 sm:gap-5",
					/* Réserve de l'espace à droite pour le bouton × dismissible */
					banner.is_dismissible ? "pl-3 pr-10 sm:pl-8 sm:pr-14 md:pl-12" : "px-3 sm:px-8 md:px-12",
				)}>

					{/* Image — icône illustration, masquée sur mobile si message long */}
					{signedImageUrl && (
						<div className="hidden sm:block flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden ring-2 ring-white/25 shadow-lg">
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
					<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 min-w-0 justify-center">
						<div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 min-w-0">
							<p className="text-sm sm:text-base font-bold leading-snug text-white tracking-tight">
								{banner.message}
							</p>
							{banner.sub_message && (
								<span className="text-white/70 text-xs font-normal leading-tight hidden sm:inline line-clamp-1">
									—&nbsp;{banner.sub_message}
								</span>
							)}
						</div>

						{/* CTA */}
						{banner.cta_label && banner.cta_url && (
							<Link
								href={banner.cta_url}
								className="flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 border border-white/40 hover:border-white hover:bg-white/10 active:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
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
