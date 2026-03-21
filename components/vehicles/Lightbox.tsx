"use client";

import {
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface LightboxProps {
	images: string[];
	initialIndex: number;
	vehicleName: string;
	onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function dist(t1: Touch, t2: Touch) {
	return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
}

/* ─────────────────────────────────────────────────────────────
   Lightbox
   – Fade + scale on open/close
   – Pinch to zoom (1× → 5×)
   – Double-tap to toggle 2.5× / 1×
   – Drag when zoomed
   – Swipe ←→ to navigate (scale = 1 only)
   – Swipe ↓ to close  (scale = 1 only)
   – Preload next image
───────────────────────────────────────────────────────────── */
export default function Lightbox({
	images,
	initialIndex,
	vehicleName,
	onClose,
}: LightboxProps) {
	const [activeIdx, setActiveIdx] = useState(initialIndex);
	const [visible, setVisible] = useState(false); // animate-in

	const hasPrev = activeIdx > 0;
	const hasNext = activeIdx < images.length - 1;
	const hasThumbs = images.length > 1;

	/* ── DOM refs ─────────────────────────────────────────── */
	const imgWrapRef = useRef<HTMLDivElement>(null);

	/* ── Zoom/pan state (refs = no re-render → 60 fps) ───── */
	const scaleRef = useRef(1);
	const txRef = useRef(0);
	const tyRef = useRef(0);

	/* ── Touch tracking ────────────────────────────────────── */
	const lastTapRef = useRef(0);
	const pinch = useRef<{ dist: number; scale: number } | null>(null);
	const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
	const swipeStart = useRef<{ x: number; y: number; t: number } | null>(null);

	/* ── Stable callback refs (avoid re-attaching listeners) ─ */
	const onCloseRef = useRef(onClose);
	useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

	/* ──────────────────────────────────────────────────────── */
	const applyTransform = useCallback((s: number, tx: number, ty: number) => {
		if (!imgWrapRef.current) return;
		imgWrapRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
		scaleRef.current = s;
		txRef.current = tx;
		tyRef.current = ty;
	}, []);

	const resetTransform = useCallback(() => applyTransform(1, 0, 0), [applyTransform]);

	const goTo = useCallback((idx: number) => {
		setActiveIdx(idx);
		resetTransform();
	}, [resetTransform]);

	/* stable refs for prev/next used inside touch effect */
	const goToRef = useRef(goTo);
	useEffect(() => { goToRef.current = goTo; }, [goTo]);

	const prevRef = useRef(() => {});
	const nextRef = useRef(() => {});

	/* update prev/next refs whenever activeIdx changes */
	useEffect(() => {
		prevRef.current = () => { if (activeIdx > 0) goToRef.current(activeIdx - 1); };
		nextRef.current = () => { if (activeIdx < images.length - 1) goToRef.current(activeIdx + 1); };
	}, [activeIdx, images.length]);

	/* ── Fade in ──────────────────────────────────────────── */
	useEffect(() => {
		document.body.style.overflow = "hidden";
		const id = requestAnimationFrame(() => setVisible(true));
		return () => {
			cancelAnimationFrame(id);
			document.body.style.overflow = "";
		};
	}, []);

	/* ── Keyboard ─────────────────────────────────────────── */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCloseRef.current();
			if (e.key === "ArrowLeft") prevRef.current();
			if (e.key === "ArrowRight") nextRef.current();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	/* ── Preload next image ────────────────────────────────── */
	useEffect(() => {
		if (!hasNext) return;
		const link = document.createElement("link");
		link.rel = "preload";
		link.as = "image";
		link.href = images[activeIdx + 1];
		document.head.appendChild(link);
		return () => { try { document.head.removeChild(link); } catch {} };
	}, [activeIdx, hasNext, images]);

	/* ── Touch (non-passive for preventDefault) ───────────── */
	useEffect(() => {
		const el = imgWrapRef.current;
		if (!el) return;

		const onStart = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				/* ── Pinch start ─────────────────────────────────── */
				pinch.current = { dist: dist(e.touches[0], e.touches[1]), scale: scaleRef.current };
				pan.current = null;
				swipeStart.current = null;
				return;
			}

			if (e.touches.length === 1) {
				const t = e.touches[0];
				const now = Date.now();

				/* ── Double tap → toggle zoom ─────────────────────── */
				if (now - lastTapRef.current < 280) {
					e.preventDefault();
					scaleRef.current > 1 ? resetTransform() : applyTransform(2.5, 0, 0);
					lastTapRef.current = 0;
					return;
				}
				lastTapRef.current = now;

				swipeStart.current = { x: t.clientX, y: t.clientY, t: now };

				if (scaleRef.current > 1) {
					/* ── Pan start ───────────────────────────────────── */
					pan.current = { x: t.clientX, y: t.clientY, tx: txRef.current, ty: tyRef.current };
				}
			}
		};

		const onMove = (e: TouchEvent) => {
			if (e.touches.length === 2 && pinch.current) {
				e.preventDefault();
				const d = dist(e.touches[0], e.touches[1]);
				const newScale = Math.min(Math.max((pinch.current.scale * d) / pinch.current.dist, 1), 5);
				applyTransform(newScale, txRef.current, tyRef.current);
				return;
			}
			if (e.touches.length === 1 && scaleRef.current > 1 && pan.current) {
				e.preventDefault();
				const t = e.touches[0];
				applyTransform(
					scaleRef.current,
					pan.current.tx + (t.clientX - pan.current.x),
					pan.current.ty + (t.clientY - pan.current.y),
				);
			}
		};

		const onEnd = (e: TouchEvent) => {
			/* cleanup pinch */
			if (pinch.current) {
				pinch.current = null;
				if (scaleRef.current < 1.05) resetTransform();
				return;
			}

			/* swipe (only when scale = 1) */
			if (scaleRef.current <= 1 && swipeStart.current && e.changedTouches.length === 1) {
				const t = e.changedTouches[0];
				const dx = t.clientX - swipeStart.current.x;
				const dy = t.clientY - swipeStart.current.y;
				const dt = Date.now() - swipeStart.current.t;

				if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && dt < 400) {
					dx < 0 ? nextRef.current() : prevRef.current();
				} else if (dy > 80 && Math.abs(dx) < 60 && dt < 400) {
					onCloseRef.current();
				}
			}

			swipeStart.current = null;
			pan.current = null;
		};

		el.addEventListener("touchstart", onStart, { passive: false });
		el.addEventListener("touchmove", onMove, { passive: false });
		el.addEventListener("touchend", onEnd, { passive: true });

		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
			el.removeEventListener("touchend", onEnd);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // intentionally empty — uses stable refs only

	/* ─────────────────────────────────────────────────────── */
	return createPortal(
		<div
			className={[
				"fixed inset-0 z-[9999] bg-black flex flex-col",
				"transition-all duration-300 ease-out",
				visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]",
			].join(" ")}
			role="dialog"
			aria-modal="true"
			aria-label={`Galerie — ${vehicleName}`}
		>
			{/* ── Header ─────────────────────────────────────── */}
			<div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm">
				<span className="text-white/60 text-sm font-light truncate max-w-[55%]">
					{vehicleName}
				</span>
				<div className="flex items-center gap-4">
					{hasThumbs && (
						<span className="text-white/60 text-sm tabular-nums">
							{activeIdx + 1} / {images.length}
						</span>
					)}
					<button
						onClick={onClose}
						className="w-10 h-10 bg-white/10 hover:bg-white/25 active:scale-95 rounded-full flex items-center justify-center transition-all"
						aria-label="Fermer"
					>
						<X size={20} className="text-white" />
					</button>
				</div>
			</div>

			{/* ── Image zone ─────────────────────────────────── */}
			<div className="flex-1 relative min-h-0 overflow-hidden">
				{/* Transform wrapper — pinch/pan applied here */}
				<div
					ref={imgWrapRef}
					className="absolute inset-0 will-change-transform"
					style={{ transformOrigin: "center center", touchAction: "none" }}
				>
					<Image
						src={images[activeIdx]}
						alt={`${vehicleName} — photo ${activeIdx + 1}`}
						fill
						className="object-contain select-none"
						sizes="100vw"
						priority
						quality={85}
						draggable={false}
					/>
				</div>

				{/* Navigation arrows */}
				{hasThumbs && (
					<>
						<button
							onClick={() => prevRef.current()}
							disabled={!hasPrev}
							className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/75 active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all disabled:opacity-0 disabled:pointer-events-none"
							aria-label="Photo précédente"
						>
							<ChevronLeft size={26} className="text-white" />
						</button>
						<button
							onClick={() => nextRef.current()}
							disabled={!hasNext}
							className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/75 active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all disabled:opacity-0 disabled:pointer-events-none"
							aria-label="Photo suivante"
						>
							<ChevronRight size={26} className="text-white" />
						</button>
					</>
				)}
			</div>

			{/* ── Thumbnails ─────────────────────────────────── */}
			{hasThumbs && (
				<div className="flex-shrink-0 bg-black/80 backdrop-blur-sm">
					<div className="flex items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{images.map((src, idx) => (
							<button
								key={idx}
								onClick={() => goTo(idx)}
								aria-label={`Photo ${idx + 1}`}
								className={[
									"relative flex-shrink-0 w-16 h-11 rounded-md overflow-hidden",
									"transition-all duration-200",
									activeIdx === idx
										? "ring-2 ring-brand-400 opacity-100 scale-110"
										: "opacity-40 hover:opacity-70 scale-100",
								].join(" ")}
							>
								<Image
									src={src}
									alt=""
									fill
									className="object-cover object-top"
									sizes="80px"
									loading="lazy"
									quality={55}
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
