import type { ServiceTestimonial } from "@/types";

interface Props {
	testimonials: ServiceTestimonial[];
}

function StarRating({ rating }: { rating: number }) {
	const clamped = Math.max(1, Math.min(5, Math.round(rating)));
	return (
		<div
			className="flex items-center gap-0.5"
			aria-label={`Note : ${clamped} sur 5`}
			role="img"
		>
			{Array.from({ length: 5 }, (_, i) => (
				<svg
					key={i}
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill={i < clamped ? "currentColor" : "none"}
					stroke="currentColor"
					strokeWidth="1.5"
					className={i < clamped ? "text-amber-400" : "text-slate-200"}
					aria-hidden="true"
				>
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
				</svg>
			))}
		</div>
	);
}

export default function ServiceTestimonials({ testimonials }: Props) {
	if (testimonials.length === 0) return null;

	const colClass =
		testimonials.length === 1
			? "grid-cols-1"
			: testimonials.length === 2
				? "sm:grid-cols-2"
				: "sm:grid-cols-2 lg:grid-cols-3";

	return (
		<div>
			<h3 className="ty-label text-brand-600 mb-5">Ce qu&apos;ils en disent</h3>
			<div className={`grid grid-cols-1 ${colClass} gap-4`}>
				{testimonials.map((t, i) => (
					<div
						key={i}
						className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3"
					>
						<StarRating rating={t.rating} />
						<p className="text-sm text-slate-700 leading-relaxed before:content-['\u00AB\u00a0'] after:content-['\u00a0\u00BB']">
							{t.content}
						</p>
						<div className="mt-auto pt-2 border-t border-slate-100">
							<p className="text-xs font-semibold text-slate-900">
								{t.author}
							</p>
							<p className="text-[11px] text-slate-400 mt-0.5">
								{t.location} · {t.date}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
