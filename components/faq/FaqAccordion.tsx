"use client";

import { useState, useId, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import type { FaqCategory } from "@/lib/faq-data";

function FaqItem({
	question,
	answer,
	id,
}: {
	question: string;
	answer: string;
	id: string;
}) {
	const [open, setOpen] = useState(false);
	const panelId = `${id}-panel`;
	const headingId = `${id}-heading`;
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<div className="border-b border-slate-200 last:border-0">
			<h3>
				<button
					id={headingId}
					aria-expanded={open}
					aria-controls={panelId}
					onClick={() => setOpen((v) => !v)}
					className="w-full flex items-center justify-between gap-4 py-5 text-left text-[#0f172a] hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:text-brand-600 group"
				>
					<span className="font-medium text-sm sm:text-base leading-snug pr-2">
						{question}
					</span>
					<span
						className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
							open
								? "bg-brand-600 text-white"
								: "bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600"
						}`}
						aria-hidden="true"
					>
						{open ? <Minus size={14} /> : <Plus size={14} />}
					</span>
				</button>
			</h3>

			<div
				id={panelId}
				role="region"
				aria-labelledby={headingId}
				ref={contentRef}
				style={{
					display: "grid",
					gridTemplateRows: open ? "1fr" : "0fr",
					transition: "grid-template-rows 220ms ease",
				}}
			>
				<div className="overflow-hidden">
					<p className="pb-5 text-slate-600 text-sm sm:text-base leading-relaxed">
						{answer}
					</p>
				</div>
			</div>
		</div>
	);
}

export default function FaqAccordion({
	categories,
}: {
	categories: FaqCategory[];
}) {
	const uid = useId();

	return (
		<div className="space-y-10">
			{categories.map((cat) => (
				<section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
					<div className="flex items-center gap-3 mb-2">
						<span
							className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0"
							aria-hidden="true"
						/>
						<h2
							id={`cat-${cat.id}`}
							className="text-xs font-medium tracking-widest uppercase text-brand-500"
						>
							{cat.label}
						</h2>
					</div>

					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 sm:px-7 divide-y divide-slate-200">
						{cat.items.map((item, i) => (
							<FaqItem
								key={i}
								question={item.question}
								answer={item.answer}
								id={`${uid}-${cat.id}-${i}`}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
