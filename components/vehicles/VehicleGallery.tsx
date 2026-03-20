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

	const hasThumbs = images.length > 1;

	return createPortal(
		<div
			className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
			role="dialog"
			aria-modal="true"
			aria-label={`Galerie — ${vehicleName}`}
		>
			{/* ── Barre haute ── */}
			<div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
				<span className="text-white/50 text-sm font-medium truncate max-w-[50%]">
					{vehicleName}
				</span>
				<div className="flex items-center gap-3">
					{hasThumbs && (
						<span className="text-white/50 text-sm tabular-nums">
							{active + 1} / {images.length}
						</span>
					)}
					<button
						onClick={onClose}
						className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
						aria-label="Fermer"
					>
						<X size={18} className="text-white" />
					</button>
				</div>
			</div>

			{/* ── Image principale ── */}
			<div
				className="flex-1 flex items-center justify-center px-16 py-2 min-h-0"
				onClick={onClose}
			>
				<div
					className="relative w-full max-w-5xl"
					style={{ aspectRatio: "16/9" }}
					onClick={(e) => e.stopPropagation()}
				>
					<Image
						src={images[active]}
						alt={`${vehicleName} — photo ${active + 1}`}
						fill
						className="object-contain object-top"
						sizes="(max-width: 1280px) 100vw, 1280px"
						priority
					/>
				</div>
			</div>

			{/* ── Flèches navigation ── */}
			{hasThumbs && (
				<>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onPrev();
						}}
						className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
						aria-label="Photo précédente"
					>
						<ChevronLeft size={24} className="text-white" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onNext();
						}}
						className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
						aria-label="Photo suivante"
					>
						<ChevronRight size={24} className="text-white" />
					</button>
				</>
			)}

			{/* ── Mini galerie thumbnails dans le lightbox ── */}
			{hasThumbs && (
				<div className="flex-shrink-0 pb-4 px-4">
					<div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
						{images.map((src, idx) => (
							<button
								key={idx}
								onClick={(e) => {
									e.stopPropagation();
									setActive(idx);
								}}
								aria-label={`Photo ${idx + 1}`}
								className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
									active === idx
										? "w-20 h-14 ring-2 ring-brand-400 opacity-100"
										: "w-16 h-11 opacity-40 hover:opacity-75 hover:scale-105"
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

export default function VehicleGallery({
	images,
	vehicleName,
}: VehicleGalleryProps) {
	const [active, setActive] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

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

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") prev();
		if (e.key === "ArrowRight") next();
		if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
	};

	return (
		<>
			<div className="space-y-3">
				{/* ── Image principale avec bordure discrète ── */}
				<div
					className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
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

					{/* Overlay gradient bas */}
					<div
						className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"
						aria-hidden="true"
					/>

					{/* Bouton zoom transparent couvrant toute l'image */}
					<button
						type="button"
						onClick={() => setLightboxOpen(true)}
						aria-label="Agrandir la photo"
						className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none"
					/>

					{/* Badge zoom — visuel seul */}
					<div
						className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
						aria-hidden="true"
					>
						<ZoomIn size={13} className="text-white" />
						<span className="text-white text-[11px] font-semibold tracking-wide">
							Agrandir
						</span>
					</div>

					{/* Compteur photo */}
					{images.length > 1 && (
						<div
							className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none tabular-nums"
							aria-live="polite"
							aria-atomic="true"
						>
							{active + 1} / {images.length}
						</div>
					)}

					{/* Flèches navigation */}
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
								<ChevronLeft size={18} className="text-[#0f172a]" aria-hidden="true" />
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
								<ChevronRight size={18} className="text-[#0f172a]" aria-hidden="true" />
							</button>
						</>
					)}
				</div>

				{/* ── Mini galerie thumbnails (toujours visible si >1 photo) ── */}
				{images.length > 1 && (
					<div
						className="grid gap-2"
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
									sizes="(max-width: 768px) 17vw, 11vw"
									loading="lazy"
								/>
								{/* Numéro de photo */}
								{active !== idx && (
									<span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/40 rounded px-1 pointer-events-none">
										{idx + 1}
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>

			{/* ── Lightbox via Portal ── */}
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
