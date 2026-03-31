"use client";

import { useState } from "react";
import type { ServiceFAQItem } from "@/types";
import { ChevronDown } from "lucide-react";

interface Props {
	faq: ServiceFAQItem[];
	/** Préfixe unique pour les ids ARIA (ex: le slug du service) */
	serviceSlug: string;
}

function FAQItem({
	item,
	index,
	isOpen,
	onToggle,
	serviceSlug,
}: {
	item: ServiceFAQItem;
	index: number;
	isOpen: boolean;
	onToggle: () => void;
	serviceSlug: string;
}) {
	const headerId = `faq-header-${serviceSlug}-${index}`;
	const panelId = `faq-panel-${serviceSlug}-${index}`;

	return (
		<div className="border border-slate-200 rounded-xl overflow-hidden">
			<button
				id={headerId}
				aria-expanded={isOpen}
				aria-controls={panelId}
				onClick={onToggle}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onToggle();
					}
				}}
				className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				<span className="text-sm font-medium text-slate-900 leading-snug">
					{item.question}
				</span>
				<ChevronDown
					size={16}
					className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
						isOpen ? "rotate-180" : ""
					}`}
					aria-hidden="true"
				/>
			</button>

			<div
				id={panelId}
				role="region"
				aria-labelledby={headerId}
				className={`overflow-hidden transition-[max-height] duration-200 ease-out ${
					isOpen ? "max-h-[400px]" : "max-h-0"
				}`}
			>
				<div className="px-5 pb-5 pt-3 bg-white border-t border-slate-100">
					<p className="text-sm text-slate-600 leading-relaxed">
						{item.answer}
					</p>
				</div>
			</div>
		</div>
	);
}

export default function ServiceFAQ({ faq, serviceSlug }: Props) {
	const [openIndexes, setOpenIndexes] = useState<Set<number>>(
		() => new Set(faq.length > 0 ? [0] : [])
	);

	const toggle = (index: number) => {
		setOpenIndexes((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	};

	if (faq.length === 0) return null;

	return (
		<div>
			<h3 className="ty-label text-brand-600 mb-5">Questions fréquentes</h3>
			<div className="space-y-2">
				{faq.map((item, i) => (
					<FAQItem
						key={i}
						item={item}
						index={i}
						isOpen={openIndexes.has(i)}
						onToggle={() => toggle(i)}
						serviceSlug={serviceSlug}
					/>
				))}
			</div>
		</div>
	);
}
