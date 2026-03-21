"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface VehicleGalleryProps {
	images: string[];
	vehicleName: string;
}

/* ──────────────────────────────────────────────────────────────
   Hook : navigation tactile par swipe horizontal
   Déclenche onPrev / onNext si le glissement dépasse 40 px.
────────────────────────────────────────────────────────────── */
function useSwipe(onPrev: () => void, onNext: () => void) {
	const startX = useRef<number | null>(null);

	const onTouchStart = (e: React.TouchEvent) => {
		startX.current = e.touches[0].clientX;
	};
	const onTouchEnd = (e: React.TouchEvent) => {
		if (startX.current === null) return;
		const delta = e.changedTouches[0].clientX - startX.current;
		if (Math.abs(delta) > 40) delta < 0 ? onNext() : onPrev();
		startX.current = null;
	};

	return { onTouchStart, onTouchEnd };
}

/* ──────────────────────────────────────────────────────────────
   Lightbox — plein écran, swipeable, thumbnails scroll horizontal
────────────────────────────────────────────────────────────── */
function Lightbox({
	images,
	active,
	onClose,
	onPrev,
	onNext,
	vehicleName,
	setActive,
}: {
	images: string[];
	active: number;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
	vehicleName: string;
	setActive: (i: number) => void;
}) {
	const hasThumbs = images.length > 1;
	const swipe = useSwipe(onPrev, onNext);

	/* Bloquer le scroll du body */
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => { document.body.style.overflow = ""; };
	}, []);

	/* Navigation clavier */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft") onPrev();
			if (e.key === "ArrowRight") onNext();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onClose, onPrev, onNext]);

	return createPortal(
		<div
			className="fixed inset-0 z-[9999] bg-black flex flex-col"
			role="dialog"
			aria-modal="true"
			aria-label={`Galerie — ${vehicleName}`}
		>
			{/* Barre haute : fixe, fond sombre, toujours lisible */}
			<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm">
				<span className="text-white/60 text-sm font-light truncate max-w-[55%]">
					{vehicleName}
				</span>
				<div className="flex items-center gap-4">
					{hasThumbs && (
						<span className="text-white/60 text-sm tabular-nums">
							{active + 1} / {images.length}
						</span>
					)}
					<button
						onClick={onClose}
						className="w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
						aria-label="Fermer la galerie"
					>
						<X size={20} className="text-white" />
					</button>
				</div>
			</div>

			{/* Zone image — plein écran, cliquable pour fermer, swipeable, pinch-zoom natif */}
			<div
				className="flex-1 relative min-h-0"
				style={{ touchAction: "pinch-zoom" }}
				onClick={onClose}
				{...swipe}
			>
				<Image
					src={images[active]}
					alt={`${vehicleName} — photo ${active + 1}`}
					fill
					className="object-contain"
					sizes="100vw"
					priority
				/>

				{/* Flèches — toujours visibles, grandes sur mobile */}
				{hasThumbs && (
					<>
						<button
							onClick={(e) => { e.stopPropagation(); onPrev(); }}
							className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/75 active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
							aria-label="Photo précédente"
						>
							<ChevronLeft size={26} className="text-white" />
						</button>
						<button
							onClick={(e) => { e.stopPropagation(); onNext(); }}
							className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/75 active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
							aria-label="Photo suivante"
						>
							<ChevronRight size={26} className="text-white" />
						</button>
					</>
				)}
			</div>

			{/* Thumbnails — scroll horizontal sur tous les breakpoints */}
			{hasThumbs && (
				<div className="flex-shrink-0 bg-black/80 backdrop-blur-sm">
					<div className="flex items-center gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						{images.map((src, idx) => (
							<button
								key={idx}
								onClick={(e) => { e.stopPropagation(); setActive(idx); }}
								aria-label={`Photo ${idx + 1}`}
								className={`relative flex-shrink-0 w-16 h-11 rounded-md overflow-hidden transition-all duration-200 ${
									active === idx
										? "ring-2 ring-brand-400 opacity-100 scale-110"
										: "opacity-40 hover:opacity-70 scale-100"
								}`}
							>
								<Image
									src={src}
									alt=""
									fill
									className="object-cover object-top"
									sizes="80px"
								/>
							</button>
						))}
					</div>
				</div>
			)}
		</div>,
		document.body,
	);
}

/* ──────────────────────────────────────────────────────────────
   Galerie principale
────────────────────────────────────────────────────────────── */
export default function VehicleGallery({
	images,
	vehicleName,
}: VehicleGalleryProps) {
	const [active, setActive] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => { setMounted(true); }, []);

	const prev = useCallback(
		() => setActive((i) => (i - 1 + images.length) % images.length),
		[images.length],
	);
	const next = useCallback(
		() => setActive((i) => (i + 1) % images.length),
		[images.length],
	);

	const swipe = useSwipe(prev, next);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") prev();
		if (e.key === "ArrowRight") next();
		if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
	};

	return (
		<>
			{/*
			  Note : sur mobile, -mx-4 annule le padding du Container pour
			  que l'image occupe toute la largeur de l'écran.
			  Sur desktop (sm+), on revient à la mise en page normale.
			  Ajustez la valeur (-mx-4 / -mx-6) selon le padding de votre Container.
			*/}
			<div className="space-y-3 -mx-4 sm:mx-0">

				{/* ── Image principale ─────────────────────────────────────── */}
				<div
					className={[
						"relative group overflow-hidden bg-slate-100",
						// Mobile : dvh corrige l'hauteur réelle Safari/iOS (sans la barre d'adresse)
						"h-[65dvh] rounded-none",
						// Desktop : 16/9, arrondi, bordure, ombre
						"sm:h-auto sm:aspect-[16/9] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
					].join(" ")}
					role="region"
					aria-label={`Galerie photo — ${vehicleName}`}
					tabIndex={0}
					onKeyDown={handleKeyDown}
					{...swipe}
				>
					<Image
						key={active}
						src={images[active]}
						alt={`${vehicleName} — photo ${active + 1} sur ${images.length}`}
						fill
						className="object-cover object-top transition-opacity duration-300"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
						priority={active === 0}
					/>

					{/* Peek gradient : guide l'œil, renforce l'immersion mobile */}
					<div
						className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
						aria-hidden="true"
					/>

					{/* Bouton invisible couvrant l'image — ouvre le lightbox */}
					<button
						type="button"
						onClick={() => setLightboxOpen(true)}
						aria-label="Agrandir la photo"
						className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none"
					/>

					{/* Badge zoom — desktop seulement, au hover */}
					<div
						className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm rounded-lg px-2.5 py-1.5 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
						aria-hidden="true"
					>
						<ZoomIn size={13} className="text-white" />
						<span className="text-white text-[11px] tracking-wide">
							Agrandir
						</span>
					</div>

					{/* Compteur photo */}
					{images.length > 1 && (
						<div
							className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none tabular-nums"
							aria-live="polite"
							aria-atomic="true"
						>
							{active + 1} / {images.length}
						</div>
					)}

					{/* Indicateur swipe — mobile uniquement, disparaît après interaction */}
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

					{/* ── Flèches navigation ──
					    Mobile  : toujours visibles, fond sombre, w-11 h-11
					    Desktop : visibles au hover du groupe, fond blanc, w-9 h-9
					*/}
					{images.length > 1 && (
						<>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); prev(); }}
								className={[
									"absolute left-3 top-1/2 -translate-y-1/2 z-10",
									"flex items-center justify-center rounded-full transition-all",
									// Mobile
									"w-11 h-11 bg-black/45 backdrop-blur-sm active:scale-95",
									// Desktop
									"sm:w-9 sm:h-9 sm:bg-white/90 sm:hover:bg-white sm:shadow-md",
									"sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
								].join(" ")}
								aria-label="Photo précédente"
							>
								<ChevronLeft
									size={22}
									className="text-white sm:text-[#0f172a]"
									aria-hidden="true"
								/>
							</button>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); next(); }}
								className={[
									"absolute right-3 top-1/2 -translate-y-1/2 z-10",
									"flex items-center justify-center rounded-full transition-all",
									"w-11 h-11 bg-black/45 backdrop-blur-sm active:scale-95",
									"sm:w-9 sm:h-9 sm:bg-white/90 sm:hover:bg-white sm:shadow-md",
									"sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
								].join(" ")}
								aria-label="Photo suivante"
							>
								<ChevronRight
									size={22}
									className="text-white sm:text-[#0f172a]"
									aria-hidden="true"
								/>
							</button>
						</>
					)}
				</div>

				{/* ── Thumbnails ─────────────────────────────────────────────
				    Mobile  : scroll horizontal, chaque thumb = 22 vw
				    Desktop : grid responsive (jusqu'à 6 colonnes)
				*/}
				{images.length > 1 && (
					<>
						{/* Mobile */}
						<div
							className="flex sm:hidden gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
							role="list"
							aria-label="Galerie miniatures"
						>
							{images.map((src, idx) => (
								<button
									key={src}
									type="button"
									role="listitem"
									onClick={() => setActive(idx)}
									aria-label={`Photo ${idx + 1}`}
									aria-pressed={active === idx}
									className={`relative flex-shrink-0 w-[22vw] aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 transition-all duration-200 border ${
										active === idx
											? "border-brand-500 ring-2 ring-brand-500/30 opacity-100 scale-105"
											: "border-slate-200 opacity-50 hover:opacity-85 scale-100"
									}`}
								>
									<Image
										src={src}
										alt={`${vehicleName} — photo ${idx + 1}`}
										fill
										className="object-cover object-top"
										sizes="25vw"
										loading="lazy"
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
									onClick={() => setActive(idx)}
									aria-label={`Photo ${idx + 1}`}
									aria-pressed={active === idx}
									className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 border ${
										active === idx
											? "border-brand-500 ring-2 ring-brand-500/30 opacity-100 shadow-sm"
											: "border-slate-200 opacity-55 hover:opacity-100 hover:border-slate-300 hover:shadow-sm"
									}`}
								>
									<Image
										src={src}
										alt={`${vehicleName} — photo ${idx + 1}`}
										fill
										className="object-cover object-top"
										sizes="11vw"
										loading="lazy"
									/>
									{active !== idx && (
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

			{/* ── Lightbox via portal ── */}
			{mounted && lightboxOpen && (
				<Lightbox
					images={images}
					active={active}
					vehicleName={vehicleName}
					onClose={() => setLightboxOpen(false)}
					onPrev={prev}
					onNext={next}
					setActive={setActive}
				/>
			)}
		</>
	);
}
