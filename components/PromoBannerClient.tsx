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
	const [visible, setVisible] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		if (!banner) return;

		setMounted(true);

		const now = new Date();
		if (banner.scheduled_start && new Date(banner.scheduled_start) > now) return;
		if (banner.scheduled_end   && new Date(banner.scheduled_end)   < now) return;

		if (banner.display_pages === "home_only" && pathname !== "/") return;

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
		setTimeout(() => setDismissed(true), 380);
	};

	if (!banner || !mounted || dismissed) return null;

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
			<div
				className="relative w-full overflow-hidden"
				style={{ backgroundColor: banner.bg_color || "#111827" }}
			>
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

				<div className={clsx(
					"relative max-w-5xl mx-auto py-1.5 sm:py-3 flex items-center justify-center gap-2.5 sm:gap-5",
					banner.is_dismissible ? "pl-3 pr-10 sm:pl-8 sm:pr-14 md:pl-12" : "px-3 sm:px-8 md:px-12",
				)}>

					{/* Image — desktop uniquement */}
					{signedImageUrl && (
						<div className="hidden sm:block flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg">
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

					<div className="flex items-center gap-2 sm:gap-4 justify-center min-w-0">
						{/* Message de bienvenue — masqué sur mobile */}
						<div className="hidden sm:flex sm:items-center gap-2.5 min-w-0">
							<p className="text-sm sm:text-[15px] font-medium leading-snug text-white sm:tracking-[0.015em]">
								{banner.message}
							</p>
							{banner.sub_message && (
								<span className="text-white/70 text-xs font-normal leading-tight line-clamp-1">
									—&nbsp;{banner.sub_message}
								</span>
							)}
						</div>

						{banner.cta_label && banner.cta_url && (
							<Link
								href={banner.cta_url}
								className={clsx(
									"inline-flex items-center gap-1 whitespace-nowrap transition-all text-white",
									// Mobile : texte flottant sans bordure, discret
									"text-xs font-medium opacity-90 hover:opacity-100",
									// Desktop : bouton outline standard
									"sm:font-semibold sm:border sm:border-white/40 sm:hover:border-white sm:hover:bg-white/10 sm:px-3 sm:py-1 sm:rounded-lg",
								)}
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
