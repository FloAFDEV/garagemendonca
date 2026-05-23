"use client";

/**
 * QualityControlTooltip — brique système UX globale
 *
 * Desktop (pointer: fine)
 *   hover trigger → popover après 200 ms
 *   clic trigger  → "pinned" (reste ouvert même si souris quitte)
 *   ESC / clic dehors → fermeture
 *
 * Mobile (pointer: coarse / touch)
 *   tap → bottom sheet accessible
 *   backdrop / bouton X → fermeture
 *
 * Accessibility
 *   role="dialog", aria-modal, focus trap, Escape, aria-expanded
 *   prefers-reduced-motion respecté
 */

import {
	useState,
	useEffect,
	useRef,
	useId,
	useCallback,
	type CSSProperties,
} from "react";
import { X, FileCheck2, BadgeCheck, Info } from "lucide-react";
import { QUALITY_CONTROL } from "@/lib/data/qualityControl";

/* ── tokens visuels par section ─────────────────────────────────────── */
const TOKENS = {
	ct: {
		bg: "bg-blue-50",
		border: "border-blue-100",
		icon: "text-blue-600",
		dot: "bg-blue-400",
		Icon: FileCheck2,
	},
	charte: {
		bg: "bg-brand-50",
		border: "border-brand-100",
		icon: "text-brand-600",
		dot: "bg-brand-500",
		Icon: BadgeCheck,
	},
} as const;

/* ── types ───────────────────────────────────────────────────────────── */
interface Props {
	/**
	 * Contenu du déclencheur.
	 * En mode inline, `children` est encadré d'un soulignement pointillé + icône.
	 */
	children: React.ReactNode;
	/**
	 * inline  : usage dans un paragraphe (soulignement léger, icône ⓘ)
	 * default : usage comme élément autonome (wrapper transparent)
	 */
	variant?: "inline" | "default";
	/** Classes Tailwind ajoutées au bouton déclencheur */
	triggerClassName?: string;
}

interface TooltipPos {
	top: number;
	left: number;
	transformX: string;
	above: boolean;
}

/* ── constante de largeur du tooltip desktop ─────────────────────────── */
const TOOLTIP_W = 480;

/* ── composant ──────────────────────────────────────────────────────── */
export default function QualityControlTooltip({
	children,
	variant = "default",
	triggerClassName = "",
}: Props) {
	/* ─── détection pointer / touch ─── */
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		setIsMobile(window.matchMedia("(pointer: coarse)").matches);
	}, []);

	/* ─── state ─── */
	const [hoverOpen, setHoverOpen] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [mounted, setMounted] = useState(false); // DOM présent (animation)
	const [sheetVisible, setSheetVisible] = useState(false); // classe visible (mobile)
	const [tooltipPos, setTooltipPos] = useState<TooltipPos>({
		top: 0,
		left: 0,
		transformX: "-50%",
		above: false,
	});

	const open = hoverOpen || pinned;

	/* ─── refs ─── */
	const triggerRef = useRef<HTMLButtonElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const dialogId = useId();
	const titleId = useId();

	const prefersReduced =
		typeof window !== "undefined"
			? window.matchMedia("(prefers-reduced-motion: reduce)").matches
			: false;

	/* ─── calcul de position du tooltip desktop ─── */
	const calcPos = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		const halfW = TOOLTIP_W / 2;
		const idealLeft = rect.left + rect.width / 2 - halfW;
		const clampedLeft = Math.max(12, Math.min(vw - TOOLTIP_W - 12, idealLeft));

		// flèche offset si tooltip décalé latéralement
		const arrowIdeal = rect.left + rect.width / 2;
		const arrowOffset = arrowIdeal - clampedLeft - halfW;
		const transformX = `calc(-50% + ${arrowOffset}px)`;

		const spaceBelow = vh - rect.bottom;
		const above = spaceBelow < 320;

		setTooltipPos({
			top: above ? rect.top - 8 : rect.bottom + 8,
			left: clampedLeft + halfW,
			transformX,
			above,
		});
	}, []);

	/* ─── ouvrir tooltip desktop ─── */
	const openDesktop = useCallback(() => {
		calcPos();
		setHoverOpen(true);
	}, [calcPos]);

	/* ─── fermer tout ─── */
	const closeAll = useCallback(() => {
		setHoverOpen(false);
		setPinned(false);
		// mobile sheet
		setSheetVisible(false);
		setTimeout(() => setMounted(false), prefersReduced ? 0 : 320);
		triggerRef.current?.focus();
	}, [prefersReduced]);

	/* ─── handlers hover desktop ─── */
	const handleTriggerEnter = () => {
		if (isMobile) return;
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
		hoverTimer.current = setTimeout(openDesktop, 200);
	};
	const handleTriggerLeave = () => {
		if (isMobile) return;
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
		// small grace period pour traverser le gap trigger → tooltip
		hoverTimer.current = setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover")) setHoverOpen(false);
		}, 120);
	};
	const handleTooltipEnter = () => {
		if (isMobile) return;
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
		setHoverOpen(true);
	};
	const handleTooltipLeave = () => {
		if (isMobile) return;
		if (!pinned) setHoverOpen(false);
	};

	/* ─── clic trigger ─── */
	const handleClick = () => {
		if (isMobile) {
			// ouvre la bottom sheet
			setMounted(true);
			requestAnimationFrame(() =>
				requestAnimationFrame(() => setSheetVisible(true)),
			);
		} else {
			// toggle pin
			if (pinned) {
				setPinned(false);
				setHoverOpen(false);
			} else {
				calcPos();
				setHoverOpen(true);
				setPinned(true);
			}
		}
	};

	/* ─── clic dehors (desktop, quand pinné) ─── */
	useEffect(() => {
		if (!pinned) return;
		const handler = (e: MouseEvent) => {
			if (
				triggerRef.current?.contains(e.target as Node) ||
				tooltipRef.current?.contains(e.target as Node)
			)
				return;
			setPinned(false);
			setHoverOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [pinned]);

	/* ─── Escape ─── */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape" && (open || mounted)) closeAll();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, mounted, closeAll]);

	/* ─── focus → close button quand la sheet s'ouvre ─── */
	useEffect(() => {
		if (sheetVisible) closeRef.current?.focus();
	}, [sheetVisible]);

	/* ─── body scroll lock (mobile sheet) ─── */
	useEffect(() => {
		if (mounted) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mounted]);

	/* ─── transition styles ─── */
	const trans = prefersReduced
		? {}
		: {
				transition:
					"opacity 0.22s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1)",
			};

	/* ─── classes du déclencheur ─── */
	const triggerBase =
		variant === "inline"
			? "inline-flex items-baseline gap-0.5 underline decoration-dotted decoration-brand-400 underline-offset-2 cursor-pointer text-inherit hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-sm"
			: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl";

	/* ─── contenu partagé (tooltip desktop + sheet mobile) ─── */
	const panelContent = (
		<>
			<div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
				<div>
					<p className="text-[10px] font-medium text-brand-500 uppercase tracking-widest mb-1">
						Notre protocole qualité
					</p>
					<h2
						id={titleId}
						className="text-[#0f172a] font-heading font-semibold text-lg leading-snug"
					>
						{QUALITY_CONTROL.total} points de contrôle
					</h2>
					<p className="text-slate-400 font-light text-xs mt-1">
						Deux niveaux complémentaires appliqués par nos
						mécaniciens
					</p>
				</div>
				<button
					ref={closeRef}
					type="button"
					onClick={closeAll}
					aria-label="Fermer"
					className="ml-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-500 hover:text-slate-700"
				>
					<X size={13} />
				</button>
			</div>

			<div className="overflow-y-auto flex-1 p-4 grid sm:grid-cols-2 gap-3">
				{QUALITY_CONTROL.sections.map((section) => {
					const { Icon, bg, border, icon, dot } =
						TOKENS[section.id];
					return (
						<div
							key={section.id}
							className={`rounded-xl border p-3.5 ${bg} ${border}`}
						>
							<div className="flex items-center gap-2 mb-2.5">
								<div
									className={`w-6 h-6 rounded-lg flex items-center justify-center bg-white/70 border ${border}`}
								>
									<Icon
										size={12}
										className={icon}
										aria-hidden="true"
									/>
								</div>
								<p className="text-[#0f172a] font-semibold text-xs leading-tight">
									{section.title}
								</p>
							</div>
							<ul className="space-y-1.5">
								{section.items.map((item) => (
									<li
										key={item}
										className="flex items-start gap-1.5 text-[11px] text-slate-600 font-light leading-snug"
									>
										<span
											className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`}
											aria-hidden="true"
										/>
										{item}
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</div>

			<div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex-shrink-0">
				<p className="text-slate-400 font-light text-[10px] text-center">
					Protocole appliqué à chaque entrée en stock depuis 2003
				</p>
			</div>
		</>
	);

	return (
		<>
			{/* ─── Trigger ─────────────────────────────────────────── */}
			<button
				ref={triggerRef}
				type="button"
				onClick={handleClick}
				onMouseEnter={handleTriggerEnter}
				onMouseLeave={handleTriggerLeave}
				aria-haspopup="dialog"
				aria-expanded={open || mounted}
				aria-controls={dialogId}
				className={`${triggerBase} ${triggerClassName}`}
			>
				{children}
				{variant === "inline" && (
					<Info
						size={11}
						className="text-brand-400 self-center flex-shrink-0"
						aria-hidden="true"
					/>
				)}
			</button>

			{/* ─── Desktop tooltip (pointer: fine) ─────────────────── */}
			{!isMobile && open && (
				<div
					ref={tooltipRef}
					id={dialogId}
					role="dialog"
					aria-modal="false"
					aria-labelledby={titleId}
					onMouseEnter={handleTooltipEnter}
					onMouseLeave={handleTooltipLeave}
					className="fixed z-50 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col max-h-[70vh] overflow-hidden"
					style={
						{
							width: TOOLTIP_W,
							top: tooltipPos.above ? undefined : tooltipPos.top,
							bottom: tooltipPos.above
								? `${window.innerHeight - tooltipPos.top}px`
								: undefined,
							left: tooltipPos.left,
							transform: `translateX(${tooltipPos.transformX})`,
							opacity: 1,
							...trans,
						} as CSSProperties
					}
				>
					{panelContent}
				</div>
			)}

			{/* ─── Mobile bottom sheet ──────────────────────────────── */}
			{isMobile && mounted && (
				<div
					className="fixed inset-0 z-50 flex items-end justify-center"
					aria-hidden={!sheetVisible}
				>
					{/* backdrop */}
					<div
						className="absolute inset-0 bg-black/50"
						style={{ opacity: sheetVisible ? 1 : 0, ...trans }}
						onClick={closeAll}
						aria-hidden="true"
					/>
					{/* sheet */}
					<div
						id={dialogId}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						className="relative bg-white w-full rounded-t-3xl shadow-2xl flex flex-col max-h-[85dvh] overflow-hidden"
						style={{
							opacity: sheetVisible ? 1 : 0,
							transform: sheetVisible
								? "translateY(0)"
								: "translateY(3rem)",
							...trans,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{panelContent}
					</div>
				</div>
			)}
		</>
	);
}
