"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Lightbox from "./Lightbox";
import type { VehicleImage } from "@/types";
import { resolveVehicleUrl } from "@/lib/utils/vehicle-images";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface VehicleGalleryProps {
	images: string[];
	vehicleName: string;
	vehicleImages?: VehicleImage[]; // alt SEO depuis vehicle_images table
}

/* ─────────────────────────────────────────────────────────────
   VehicleGallery
   – Scroll-snap slider (inertie + snap natifs CSS)
   – Images URLs déjà calculées côté serveur (bucket public) — pas de signed URLs
   – next/image pour optimisation AVIF/WebP + LCP priority sur la 1ère image
───────────────────────────────────────────────────────────── */
export default function VehicleGallery({
	images,
	vehicleName,
	vehicleImages,
}: VehicleGalleryProps) {
	const [activeIdx, setActiveIdx] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	// Slider: medium URLs pre-computed by vehicleFromDb (900×675)
	const displayUrls = images;
	// Lightbox: large URLs (1600×1200) — resolveVehicleUrl handles all formats,
	// no format knowledge required here. Legacy images gracefully fall back.
	const lightboxUrls = vehicleImages?.length
		? vehicleImages.map((img) => resolveVehicleUrl(img.storage_path ?? img.url, "large") ?? img.url)
		: images.map((url) => resolveVehicleUrl(url, "large") ?? url);

	const sliderRef = useRef<HTMLDivElement>(null);
	const thumbsRef = useRef<HTMLDivElement>(null);

	/* ── Sync activeIdx from scroll position ────────────────── */
	useEffect(() => {
		const slider = sliderRef.current;
		if (!slider) return;

		let rafId: number;
		const onScroll = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				const idx = Math.round(slider.scrollLeft / slider.clientWidth);
				setActiveIdx((prev) => (prev !== idx ? idx : prev));
			});
		};

		slider.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			slider.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(rafId);
		};
	}, []);

	/* ── Auto-scroll thumbnails into view ───────────────────── */
	useEffect(() => {
		const thumbs = thumbsRef.current;
		if (!thumbs) return;
		const active = thumbs.children[activeIdx] as HTMLElement | undefined;
		active?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "center",
		});
	}, [activeIdx]);

	/* ── Imperative scroll ──────────────────────────────────── */
	const scrollTo = useCallback((idx: number) => {
		const slider = sliderRef.current;
		if (!slider) return;
		slider.scrollTo({ left: idx * slider.clientWidth, behavior: "smooth" });
	}, []);

	const prev = useCallback(
		() => scrollTo(Math.max(0, activeIdx - 1)),
		[activeIdx, scrollTo],
	);
	const next = useCallback(
		() => scrollTo(Math.min(displayUrls.length - 1, activeIdx + 1)),
		[activeIdx, displayUrls.length, scrollTo],
	);

	/* ── Keyboard ───────────────────────────────────────────── */
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") prev();
		if (e.key === "ArrowRight") next();
		if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
	};

	if (displayUrls.length === 0) return null;

	/* ─────────────────────────────────────────────────────── */
	return (
		<>
			<div className="space-y-3 -mx-3 sm:mx-0">
				{/* ── SLIDER ─────────────────────────────────────── */}
				<div
					className={[
						"relative group bg-slate-100",
						// aspect-[4/3] = ratio exact des images traitées (900×675)
						// → object-cover ne croppe plus rien, véhicule visible en entier
						// Avant : h-[60dvh] mobile (portrait → crop 46% largeur)
						//         sm:aspect-[16/9] desktop (→ crop 25% hauteur)
						"aspect-[4/3] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.10)]",
						"sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
					].join(" ")}
					role="region"
					aria-label={`Galerie photo — ${vehicleName}`}
					tabIndex={0}
					onKeyDown={handleKeyDown}
				>
					{/* Scroll container
					    ⚠️ PAS de h-full : height:100% ne résout pas fiablement
					    la hauteur d'un parent aspect-ratio en contexte flex.
					    ⚠️ items-start OBLIGATOIRE : sans ça, align-items:stretch
					    (défaut flex) écrase aspect-[4/3] sur les slides.
					    La hauteur de chaque slide vient de son propre aspect-[4/3]. */}
					<div
						ref={sliderRef}
						className={[
							"flex items-start overflow-x-auto",
							"[scroll-snap-type:x_mandatory]",
							"[-webkit-overflow-scrolling:touch]",
							"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
						].join(" ")}
					>
						{displayUrls.map((src, idx) => (
							<div
								key={`slide-${idx}-${src}`}
								className="relative flex-shrink-0 w-full aspect-[4/3] [scroll-snap-align:center] [scroll-snap-stop:always]"
							>
										{idx === 0 ? (
									<Image
										src={src}
										alt={vehicleImages?.[idx]?.alt ?? `${vehicleName} — photo ${idx + 1} sur ${displayUrls.length}`}
										fill
										className="object-cover object-[center_60%]"
										priority
										quality={85}
										sizes="(max-width: 640px) 100vw, (max-width: 1280px) 75vw, 900px"
									/>
								) : (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={src}
										alt={vehicleImages?.[idx]?.alt ?? `${vehicleName} — photo ${idx + 1} sur ${displayUrls.length}`}
										className="absolute inset-0 w-full h-full object-cover object-[center_60%]"
										loading="lazy"
										decoding="async"
									/>
								)}
							</div>
						))}
					</div>

					{/* Gradient overlay */}
					<div
						className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
						aria-hidden="true"
					/>

					{/* Invisible zoom trigger */}
					<button
						type="button"
						onClick={() => setLightboxOpen(true)}
						aria-label="Agrandir la photo"
						className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none"
					/>

					{/* Compteur photo */}
					{displayUrls.length > 1 && (
						<div
							className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none tabular-nums"
							aria-live="polite"
							aria-atomic="true"
						>
							{activeIdx + 1} / {displayUrls.length}
						</div>
					)}

					{/* Swipe hint — mobile uniquement */}
					{displayUrls.length > 1 && (
						<div
							className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden pointer-events-none flex items-center gap-1.5 bg-black/45 backdrop-blur-sm rounded-full px-3 py-1"
							aria-hidden="true"
						>
							<span className="text-white/70 text-[10px] font-light tracking-wide">
								Plein écran
							</span>
						</div>
					)}

					{/* Badge zoom — desktop hover */}
					<div
						className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm rounded-lg px-2.5 py-1.5 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
						aria-hidden="true"
					>
						<ZoomIn size={13} className="text-white" />
						<span className="text-white text-[11px] tracking-wide">
							Agrandir
						</span>
					</div>

					{/* ── Navigation arrows ── */}
					{displayUrls.length > 1 && (
						<>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); prev(); }}
								className={[
									"absolute left-3 top-1/2 -translate-y-1/2 z-10",
									"flex items-center justify-center rounded-full transition-all active:scale-95",
									"w-11 h-11 bg-black/45 backdrop-blur-sm",
									"sm:w-9 sm:h-9 sm:bg-white/90 sm:hover:bg-white sm:shadow-md",
									"sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
								].join(" ")}
								aria-label="Photo précédente"
							>
								<ChevronLeft size={22} className="text-white sm:text-slate-900" aria-hidden="true" />
							</button>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); next(); }}
								className={[
									"absolute right-3 top-1/2 -translate-y-1/2 z-10",
									"flex items-center justify-center rounded-full transition-all active:scale-95",
									"w-11 h-11 bg-black/45 backdrop-blur-sm",
									"sm:w-9 sm:h-9 sm:bg-white/90 sm:hover:bg-white sm:shadow-md",
									"sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
								].join(" ")}
								aria-label="Photo suivante"
							>
								<ChevronRight size={22} className="text-white sm:text-slate-900" aria-hidden="true" />
							</button>
						</>
					)}
				</div>

				{/* ── THUMBNAILS ─────────────────────────────────── */}
				{displayUrls.length > 1 && (
					<>
						{/* Mobile */}
						<div
							ref={thumbsRef}
							className="flex sm:hidden gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							role="list"
							aria-label="Galerie miniatures"
						>
							{displayUrls.map((src, idx) => (
								<button
									key={`thumb-mobile-${idx}`}
									type="button"
									role="listitem"
									onClick={() => scrollTo(idx)}
									aria-label={`Photo ${idx + 1}`}
									aria-pressed={activeIdx === idx}
									className={[
										"relative flex-shrink-0 w-[22vw] aspect-[4/3] rounded-xl overflow-hidden bg-slate-100",
										"transition-all duration-200 border",
										activeIdx === idx
											? "border-brand-500 ring-2 ring-brand-500/30 opacity-100 scale-105"
											: "border-slate-200 opacity-50 hover:opacity-85 scale-100",
									].join(" ")}
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={src}
										alt=""
										className="absolute inset-0 w-full h-full object-cover object-[center_60%]"
										loading="lazy"
										decoding="async"
									/>
								</button>
							))}
						</div>

						{/* Desktop */}
						<div
							className="hidden sm:grid gap-2"
							style={{ gridTemplateColumns: `repeat(${Math.min(displayUrls.length, 6)}, 1fr)` }}
							role="list"
							aria-label="Galerie miniatures"
						>
							{displayUrls.map((src, idx) => (
								<button
									key={`thumb-desktop-${idx}`}
									type="button"
									role="listitem"
									onClick={() => scrollTo(idx)}
									aria-label={`Photo ${idx + 1}`}
									aria-pressed={activeIdx === idx}
									className={[
										"relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100",
										"transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 border",
										activeIdx === idx
											? "border-brand-500 ring-2 ring-brand-500/30 opacity-100 shadow-sm"
											: "border-slate-200 opacity-55 hover:opacity-100 hover:border-slate-300 hover:shadow-sm",
									].join(" ")}
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={src}
										alt=""
										className="absolute inset-0 w-full h-full object-cover object-[center_60%]"
										loading="lazy"
										decoding="async"
									/>
									{activeIdx !== idx && (
										<span className="absolute bottom-1 right-1 text-[9px] text-white bg-black/40 rounded px-1 pointer-events-none">
											{idx + 1}
										</span>
									)}
								</button>
							))}
						</div>
					</>
				)}
			</div>

			{/* ── Lightbox via portal ─────────────────────────── */}
			{lightboxOpen && (
				<Lightbox
					images={lightboxUrls}
					initialIndex={Math.max(0, Math.min(activeIdx, lightboxUrls.length - 1))}
					vehicleName={vehicleName}
					onClose={() => setLightboxOpen(false)}
				/>
			)}
		</>
	);
}
