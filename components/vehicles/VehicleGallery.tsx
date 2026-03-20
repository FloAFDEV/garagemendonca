"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface VehicleGalleryProps {
	images: string[];
	vehicleName: string;
}

/* ── Lightbox rendu via portal au root du document ── */
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
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

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
			className="fixed inset-0 z-[9999] bg-black/96 flex flex-col items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-label={`Galerie — ${vehicleName}`}
		>
			{/* Barre haute */}
			<div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
				<span className="text-white/60 text-sm font-medium">
					{vehicleName}
				</span>
				{images.length > 1 && (
					<span className="text-white/60 text-sm font-medium">
						{active + 1} / {images.length}
					</span>
				)}
				<button
					onClick={onClose}
					className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
					aria-label="Fermer"
				>
					<X size={20} className="text-white" />
				</button>
			</div>

			{/* Image principale */}
			<div
				className="relative w-full max-w-5xl px-4"
				style={{ aspectRatio: "16/9" }}
				onClick={onClose}
			>
				<Image
					src={images[active]}
					alt={`${vehicleName} — photo ${active + 1}`}
					fill
					className="object-contain object-top"
					sizes="100vw"
					priority
					onClick={(e) => e.stopPropagation()}
				/>
			</div>

			{/* Flèches navigation */}
			{images.length > 1 && (
				<>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onPrev();
						}}
						className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
						aria-label="Photo précédente"
					>
						<ChevronLeft size={26} className="text-white" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onNext();
						}}
						className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
						aria-label="Photo suivante"
					>
						<ChevronRight size={26} className="text-white" />
					</button>
				</>
			)}

			{/* Bande de thumbnails */}
			{images.length > 1 && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
					{images.map((src, idx) => (
						<button
							key={idx}
							onClick={(e) => {
								e.stopPropagation();
								setActive(idx);
							}}
							aria-label={`Photo ${idx + 1}`}
							className={`relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
								active === idx
									? "ring-2 ring-brand-400 opacity-100 scale-105"
									: "opacity-40 hover:opacity-70"
							}`}
						>
							<Image
								src={src}
								alt=""
								fill
								className="object-cover object-top"
								sizes="56px"
							/>
						</button>
					))}
				</div>
			)}
		</div>,
		document.body,
	);
}

export default function VehicleGallery({
	images,
	vehicleName,
}: VehicleGalleryProps) {
	const [active, setActive] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	/* Nécessaire pour createPortal (côté client uniquement) */
	useEffect(() => {
		setMounted(true);
	}, []);

	const prev = useCallback(
		() => setActive((i) => (i - 1 + images.length) % images.length),
		[images.length],
	);
	const next = useCallback(
		() => setActive((i) => (i + 1) % images.length),
		[images.length],
	);

	const openLightbox = () => setLightboxOpen(true);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") prev();
		if (e.key === "ArrowRight") next();
		if (e.key === "Enter" || e.key === " ") openLightbox();
	};

	return (
		<>
			<div className="space-y-3">
				{/* ── Image principale ── */}
				<div
					className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 shadow-lg group"
					role="region"
					aria-label={`Galerie photo — ${vehicleName}`}
					tabIndex={0}
					onKeyDown={handleKeyDown}
				>
					<Image
						key={active}
						src={images[active]}
						alt={`${vehicleName} — photo ${active + 1} sur ${images.length}`}
						fill
						className="object-cover object-top transition-opacity duration-300"
						sizes="(max-width: 1024px) 100vw, 66vw"
						priority={active === 0}
					/>

					{/* Overlay gradient */}
					<div
						className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"
						aria-hidden="true"
					/>

					{/* Bouton zoom — cliquable, toujours au-dessus de l'image */}
					<button
						type="button"
						onClick={openLightbox}
						aria-label="Agrandir la photo"
						className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none"
					/>

					{/* Indicateur zoom (visuel seulement, pointer-events-none) */}
					<div
						className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
						aria-hidden="true"
					>
						<ZoomIn size={15} className="text-white" />
						<span className="text-white text-xs font-semibold">
							Agrandir
						</span>
					</div>

					{/* Compteur */}
					{images.length > 1 && (
						<div
							className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full pointer-events-none"
							aria-live="polite"
							aria-atomic="true"
						>
							{active + 1} / {images.length}
						</div>
					)}

					{/* Flèches navigation (au-dessus du bouton transparent) */}
					{images.length > 1 && (
						<>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									prev();
								}}
								className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
								aria-label="Photo précédente"
							>
								<ChevronLeft
									size={18}
									className="text-[#0f172a]"
									aria-hidden="true"
								/>
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									next();
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
								aria-label="Photo suivante"
							>
								<ChevronRight
									size={18}
									className="text-[#0f172a]"
									aria-hidden="true"
								/>
							</button>
						</>
					)}
				</div>

				{/* ── Thumbnails ── */}
				{images.length > 1 && (
					<div
						className="grid gap-2"
						style={{
							gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`,
						}}
						role="list"
						aria-label="Vignettes"
					>
						{images.map((src, idx) => (
							<button
								key={src}
								type="button"
								role="listitem"
								onClick={() => setActive(idx)}
								aria-label={`Voir photo ${idx + 1}`}
								aria-pressed={active === idx}
								className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
									active === idx
										? "ring-2 ring-brand-500 ring-offset-2 scale-[0.97]"
										: "hover:opacity-90 hover:scale-[0.97] opacity-60"
								}`}
							>
								<Image
									src={src}
									alt={`${vehicleName} — vignette ${idx + 1}`}
									fill
									className="object-cover object-top"
									sizes="(max-width: 768px) 20vw, 13vw"
									loading="lazy"
								/>
							</button>
						))}
					</div>
				)}
			</div>

			{/* ── Lightbox via Portal (hors du DOM de la galerie) ── */}
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
