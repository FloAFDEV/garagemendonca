interface Props {
	features: string[];
}

function CheckIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-brand-500 flex-shrink-0 mt-0.5"
			aria-hidden="true"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export default function ServiceFeatures({ features }: Props) {
	if (features.length === 0) return null;

	return (
		<div>
			<h3 className="ty-label text-brand-600 mb-5">Nos prestations</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
				{features.map((feature) => (
					<div key={feature} className="flex items-start gap-3">
						<CheckIcon />
						<span className="text-sm text-slate-700 leading-snug">
							{feature}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
