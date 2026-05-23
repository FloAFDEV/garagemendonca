"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import { X, FileCheck2, BadgeCheck } from "lucide-react";
import { QUALITY_CONTROL } from "@/lib/data/qualityControl";

const SECTION_ICONS = {
	ct: FileCheck2,
	charte: BadgeCheck,
} as const;

const SECTION_COLORS = {
	ct: {
		bg: "bg-blue-50",
		border: "border-blue-100",
		icon: "text-blue-600",
		dot: "bg-blue-500",
	},
	charte: {
		bg: "bg-brand-50",
		border: "border-brand-100",
		icon: "text-brand-600",
		dot: "bg-brand-500",
	},
} as const;

interface Props {
	/** Contenu du bouton déclencheur */
	children: React.ReactNode;
	/** Classes Tailwind supplémentaires sur le bouton */
	triggerClassName?: string;
}

export default function QualityControlPopover({
	children,
	triggerClassName = "",
}: Props) {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);
	const dialogId = useId();
	const titleId = useId();
	const closeRef = useRef<HTMLButtonElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const prefersReduced =
		typeof window !== "undefined"
			? window.matchMedia("(prefers-reduced-motion: reduce)").matches
			: false;

	const open = useCallback(() => {
		setMounted(true);
		// 1 frame delay so the transition fires
		requestAnimationFrame(() =>
			requestAnimationFrame(() => setVisible(true)),
		);
	}, []);

	const close = useCallback(() => {
		setVisible(false);
		const delay = prefersReduced ? 0 : 320;
		setTimeout(() => {
			setMounted(false);
			triggerRef.current?.focus();
		}, delay);
	}, [prefersReduced]);

	// Escape key
	useEffect(() => {
		if (!mounted) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [mounted, close]);

	// Focus trap — move focus to close button on open
	useEffect(() => {
		if (visible) closeRef.current?.focus();
	}, [visible]);

	// Prevent body scroll when open
	useEffect(() => {
		if (mounted) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mounted]);

	const transition = prefersReduced
		? {}
		: {
				transition:
					"opacity 0.28s ease, transform 0.32s cubic-bezier(0.16,1,0.3,1)",
			};

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={open}
				aria-haspopup="dialog"
				aria-expanded={mounted}
				aria-controls={dialogId}
				className={triggerClassName}
			>
				{children}
			</button>

			{mounted && (
				/* ── Overlay ── */
				<div
					className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
					aria-hidden={!visible}
				>
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/50"
						style={{
							opacity: visible ? 1 : 0,
							...transition,
						}}
						onClick={close}
						aria-hidden="true"
					/>

					{/* Panel */}
					<div
						id={dialogId}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col"
						style={{
							opacity: visible ? 1 : 0,
							transform: visible
								? "translateY(0)"
								: "translateY(3rem)",
							...transition,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
							<div>
								<p className="text-xs font-normal text-brand-500 uppercase tracking-caps mb-1">
									Notre protocole qualité
								</p>
								<h2
									id={titleId}
									className="text-[#0f172a] font-heading font-semibold text-xl"
								>
									{QUALITY_CONTROL.total} points de contrôle
								</h2>
								<p className="text-slate-500 font-light text-sm mt-1">
									Chaque véhicule est inspecté selon deux niveaux
									complémentaires
								</p>
							</div>
							<button
								ref={closeRef}
								type="button"
								onClick={close}
								aria-label="Fermer"
								className="ml-4 mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-500 hover:text-slate-700"
							>
								<X size={15} />
							</button>
						</div>

						{/* Sections */}
						<div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
							{QUALITY_CONTROL.sections.map((section) => {
								const Icon = SECTION_ICONS[section.id];
								const colors = SECTION_COLORS[section.id];
								return (
									<div
										key={section.id}
										className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}
									>
										<div className="flex items-center gap-2.5 mb-3">
											<div
												className={`w-7 h-7 rounded-xl flex items-center justify-center bg-white/80 border ${colors.border}`}
											>
												<Icon
													size={14}
													className={colors.icon}
													aria-hidden="true"
												/>
											</div>
											<div>
												<p className="text-[#0f172a] font-semibold text-sm leading-tight">
													{section.title}
												</p>
												<p className="text-slate-500 font-light text-[11px] leading-tight mt-0.5">
													{section.description}
												</p>
											</div>
										</div>
										<ul className="space-y-1.5">
											{section.items.map((item) => (
												<li
													key={item}
													className="flex items-start gap-2 text-sm text-slate-700 font-light"
												>
													<span
														className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`}
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

						{/* Footer */}
						<div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
							<p className="text-slate-500 font-light text-xs text-center leading-relaxed">
								Ce protocole est appliqué par nos mécaniciens
								qualifiés avant chaque mise en vente.
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
