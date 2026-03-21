"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Lightbox from "./Lightbox";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface VehicleGalleryProps {
	images: string[];
	vehicleName: string;
}

/* ─────────────────────────────────────────────────────────────
   VehicleGallery
   – Scroll-snap slider (inertie + snap natifs CSS)
   – activeIdx synchronisé sur scrollLeft via rAF
   – Flèches : toujours visibles mobile / hover desktop
   – Thumbnails : scroll horizontal mobile / grid desktop
   – Lightbox via portal (Lightbox.tsx)
───────────────────────────────────────────────────────────── */
export default function VehicleGallery({ images, vehicleName }: VehicleGalleryProps) {
	const [activeIdx, setActiveIdx] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);

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
		active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
		() => scrollTo(Math.min(images.length - 1, activeIdx + 1)),
		[activeIdx, images.length, scrollTo],
	);

	/* ── Keyboard (when gallery is focused) ─────────────────── */
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") prev();
		if (e.key === "ArrowRight") next();
		if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
	};

	/* ─────────────────────────────────────────────────────── */
	return (
		<>
			<div className="space-y-3 -mx-4 sm:mx-0">

				{/* ── SLIDER ─────────────────────────────────────── */}
				{/*
				  Outer div : sizing + overflow:hidden (clips rounded corners)
				  Inner div : scroll container (jamais overflow:hidden)
				*/}
				<div
					className={[
						"relative group bg-slate-100",
						"h-[65dvh] rounded-none overflow-hidden",
						"sm:h-auto sm:aspect-[16/9] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
					].join(" ")}
					role="region"
					aria-label={`Galerie photo — ${vehicleName}`}
					tabIndex={0}
					onKeyDown={handleKeyDown}
				>
					{/* Scroll container */}
					<div
						ref={sliderRef}
						className={[
							"h-full flex overflow-x-auto",
							"[scroll-snap-type:x_mandatory]",
							"[-webkit-overflow-scrolling:touch]",
							"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
						].join(" ")}
					>
						{images.map((src, idx) => (
							<div
								key={src}
								className="relative flex-shrink-0 w-full h-full [scroll-snap-align:center] [scroll-snap-stop:always]"
							>
								<Image
									src={src}
									alt={`${vehicleName} — photo ${idx + 1} sur ${images.length}`}
									fill
									className={[
										"object-cover object-top",
										"transition-transform duration-700 ease-out",
										"sm:group-hover:scale-[1.02]",
									].join(" ")}
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
									priority={idx === 0}
									quality={80}
								/>
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
					{images.length > 1 && (
						<div
							className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none tabular-nums"
							aria-live="polite"
							aria-atomic="true"
						>
							{activeIdx + 1} / {images.length}
						</div>
					)}

					{/* Swipe hint — mobile uniquement */}
					{images.length > 1 && (
						<div
							className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden pointer-events-none flex items-center gap-1.5 bg-black/45 backdrop-blur-sm rounded-full px-3 py-1"
							aria-hidden="true"
						>
							<ChevronLeft size={11} className="text-white/70" />
							<span className="text-white/70 text-[10px] font-light tracking-wide">
								glisser
							</span>
							<ChevronRight size={11} className="text-white/70" />
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

					{/* ── Navigation arrows ────────────────────────────
					    Mobile  : toujours visibles, w-11, fond sombre
					    Desktop : hover uniquement, w-9, fond blanc
					*/}
					{images.length > 1 && (
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

				{/* ── THUMBNAILS ──────────────────────────────────────
				    Mobile  : scroll horizontal, w-[22vw] fixe, scale-105 actif
				    Desktop : grid (jusqu'à 6 colonnes)
				*/}
				{images.length > 1 && (
					<>
						{/* Mobile */}
						<div
							ref={thumbsRef}
							className="flex sm:hidden gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							role="list"
							aria-label="Galerie miniatures"
						>
							{images.map((src, idx) => (
								<button
									key={src}
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
									<Image
										src={src}
										alt={`${vehicleName} — photo ${idx + 1}`}
										fill
										className="object-cover object-top"
										sizes="22vw"
										loading="lazy"
										quality={55}
									/>
								</button>
							))}
						</div>

						{/* Desktop */}
						<div
							className="hidden sm:grid gap-2"
							style={{
								gridTemplateColumns: `repeat(${Math.min(images.length, 6)}, 1fr)`,
							}}
							role="list"
							aria-label="Galerie miniatures"
						>
							{images.map((src, idx) => (
								<button
									key={src}
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
									<Image
										src={src}
										alt={`${vehicleName} — photo ${idx + 1}`}
										fill
										className="object-cover object-top"
										sizes="(max-width: 768px) 22vw, 150px"
										loading="lazy"
										quality={55}
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
					images={images}
					initialIndex={activeIdx}
					vehicleName={vehicleName}
					onClose={() => setLightboxOpen(false)}
				/>
			)}
		</>
	);
}
