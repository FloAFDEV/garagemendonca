"use client";

/**
 * QualityControlTooltip — brique système UX, pattern hybride
 *
 * Desktop (pointer: fine)
 *   hover → popover léger avec aperçu + CTA vers /services
 *   clic  → "pinned" (reste ouvert, ESC / clic dehors pour fermer)
 *
 * Mobile (pointer: coarse)
 *   tap → router.push("/services")
 *   Aucun modal, aucun scroll interne — UX standard
 */

import {
	useState,
	useEffect,
	useRef,
	useId,
	useCallback,
	type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, BadgeCheck, ArrowRight } from "lucide-react";
import { QUALITY_CONTROL } from "@/lib/data/qualityControl";

const SERVICES_URL = "/services";
const TOOLTIP_W = 340;
const PREVIEW_ITEMS = 3; // items affichés par section avant "…"

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

interface Props {
	children: React.ReactNode;
	variant?: "inline" | "default";
	triggerClassName?: string;
}

interface TooltipPos {
	top: number;
	left: number;
	transformX: string;
	above: boolean;
}

export default function QualityControlTooltip({
	children,
	variant = "default",
	triggerClassName = "",
}: Props) {
	const router = useRouter();

	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		setIsMobile(window.matchMedia("(pointer: coarse)").matches);
	}, []);

	const [hoverOpen, setHoverOpen] = useState(false);
	const [pinned, setPinned] = useState(false);
	const [tooltipPos, setTooltipPos] = useState<TooltipPos>({
		top: 0,
		left: 0,
		transformX: "-50%",
		above: false,
	});

	const open = hoverOpen || pinned;

	const triggerRef = useRef<HTMLButtonElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const dialogId = useId();
	const titleId = useId();

	const prefersReduced =
		typeof window !== "undefined"
			? window.matchMedia("(prefers-reduced-motion: reduce)").matches
			: false;

	const calcPos = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const halfW = TOOLTIP_W / 2;
		const idealLeft = rect.left + rect.width / 2 - halfW;
		const clampedLeft = Math.max(12, Math.min(vw - TOOLTIP_W - 12, idealLeft));
		const spaceBelow = vh - rect.bottom;
		setTooltipPos({
			top: spaceBelow < 260 ? rect.top - 8 : rect.bottom + 8,
			left: clampedLeft,
			transformX: "0px",
			above: spaceBelow < 260,
		});
	}, []);

	const closeAll = useCallback(() => {
		setHoverOpen(false);
		setPinned(false);
		triggerRef.current?.focus();
	}, []);

	/* ── hover handlers (desktop only) ── */
	const handleTriggerEnter = () => {
		if (isMobile) return;
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
		hoverTimer.current = setTimeout(() => { calcPos(); setHoverOpen(true); }, 180);
	};
	const handleTriggerLeave = () => {
		if (isMobile) return;
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
		hoverTimer.current = setTimeout(() => {
			if (!tooltipRef.current?.matches(":hover")) setHoverOpen(false);
		}, 100);
	};
	const handleTooltipEnter = () => {
		if (isMobile) return;
		if (hoverTimer.current) clearTimeout(hoverTimer.current);
	};
	const handleTooltipLeave = () => {
		if (isMobile) return;
		if (!pinned) setHoverOpen(false);
	};

	/* ── click handler ── */
	const handleClick = () => {
		if (isMobile) {
			router.push(SERVICES_URL);
		} else {
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

	/* ── click outside (desktop, pinned) ── */
	useEffect(() => {
		if (!pinned) return;
		const handler = (e: MouseEvent) => {
			if (
				triggerRef.current?.contains(e.target as Node) ||
				tooltipRef.current?.contains(e.target as Node)
			) return;
			setPinned(false);
			setHoverOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [pinned]);

	/* ── Escape ── */
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open) closeAll();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, closeAll]);

	const trans: CSSProperties = prefersReduced
		? {}
		: { transition: "opacity 0.18s ease, transform 0.22s cubic-bezier(0.16,1,0.3,1)" };

	const triggerBase =
		variant === "inline"
			? "inline-flex items-baseline gap-0.5 underline decoration-dotted decoration-brand-400 underline-offset-2 cursor-pointer text-inherit hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-sm"
			: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl";

	/* ── popover content (desktop preview) ── */
	const popoverContent = (
		<div className="flex flex-col">
			{/* Header */}
			<div className="px-4 pt-4 pb-3 border-b border-slate-100">
				<p className="text-[10px] font-medium text-brand-500 uppercase tracking-widest mb-0.5">
					Protocole qualité
				</p>
				<p id={titleId} className="text-[#0f172a] font-heading font-semibold text-base leading-snug">
					{QUALITY_CONTROL.total} points de contrôle
				</p>
			</div>

			{/* Sections preview */}
			<div className="px-4 py-3 space-y-3">
				{QUALITY_CONTROL.sections.map((section) => {
					const { Icon, bg, border, icon, dot } = TOKENS[section.id];
					const preview = section.items.slice(0, PREVIEW_ITEMS);
					const remaining = section.items.length - PREVIEW_ITEMS;
					return (
						<div key={section.id} className={`rounded-xl border p-3 ${bg} ${border}`}>
							<div className="flex items-center gap-1.5 mb-2">
								<div className={`w-5 h-5 rounded-md flex items-center justify-center bg-white/70 border ${border}`}>
									<Icon size={10} className={icon} aria-hidden="true" />
								</div>
								<p className="text-[#0f172a] font-semibold text-xs leading-tight">
									{section.title}
								</p>
							</div>
							<ul className="space-y-1">
								{preview.map((item) => (
									<li key={item} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
										<span className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} aria-hidden="true" />
										{item}
									</li>
								))}
								{remaining > 0 && (
									<li className="text-[11px] text-slate-400 pl-3">
										+{remaining} autres vérifications…
									</li>
								)}
							</ul>
						</div>
					);
				})}
			</div>

			{/* CTA */}
			<div className="px-4 pb-4">
				<a
					href={SERVICES_URL}
					className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition-colors"
					onClick={closeAll}
				>
					Voir les {QUALITY_CONTROL.total} points de contrôle
					<ArrowRight size={12} aria-hidden="true" />
				</a>
			</div>
		</div>
	);

	return (
		<>
			{/* Trigger */}
			<button
				ref={triggerRef}
				type="button"
				onClick={handleClick}
				onMouseEnter={handleTriggerEnter}
				onMouseLeave={handleTriggerLeave}
				aria-haspopup={isMobile ? undefined : "dialog"}
				aria-expanded={isMobile ? undefined : open}
				aria-controls={isMobile ? undefined : dialogId}
				aria-label={isMobile ? `Voir les ${QUALITY_CONTROL.total} points de contrôle` : undefined}
				className={`${triggerBase} ${triggerClassName}`}
			>
				{children}
				{variant === "inline" && (
					<ArrowRight
						size={11}
						className={`flex-shrink-0 self-center transition-transform ${isMobile ? "text-brand-400" : "text-brand-400 opacity-0 group-hover:opacity-100"}`}
						aria-hidden="true"
					/>
				)}
			</button>

			{/* Desktop popover */}
			{!isMobile && open && (
				<div
					ref={tooltipRef}
					id={dialogId}
					role="dialog"
					aria-modal="false"
					aria-labelledby={titleId}
					onMouseEnter={handleTooltipEnter}
					onMouseLeave={handleTooltipLeave}
					className="fixed z-50 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden"
					style={{
						width: TOOLTIP_W,
						top: tooltipPos.above ? undefined : tooltipPos.top,
						bottom: tooltipPos.above
							? `${window.innerHeight - tooltipPos.top}px`
							: undefined,
						left: tooltipPos.left,
						transform: `translateX(${tooltipPos.transformX})`,
						...trans,
					} as CSSProperties}
				>
					{popoverContent}
				</div>
			)}
		</>
	);
}
