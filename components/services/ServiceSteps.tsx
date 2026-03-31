import type { ServiceStep } from "@/types";

interface Props {
	steps: ServiceStep[];
}

export default function ServiceSteps({ steps }: Props) {
	if (steps.length === 0) return null;

	const sorted = [...steps].sort((a, b) => a.order - b.order);

	return (
		<div>
			<h3 className="ty-label text-brand-600 mb-8">Comment ça se passe ?</h3>

			{/* ── Desktop : timeline horizontale ── */}
			<div
				className="hidden md:block"
				style={{ ["--step-count" as string]: sorted.length }}
			>
				{/* Ligne de connexion */}
				<div className="relative flex items-start">
					{/* Trait horizontal entre les cercles */}
					<div
						className="absolute top-5 left-0 right-0 h-px bg-slate-200 pointer-events-none"
						aria-hidden="true"
					/>
					{sorted.map((step) => (
						<div
							key={step.order}
							className="relative flex-1 flex flex-col items-center gap-4 px-3"
						>
							{/* Cercle numéroté */}
							<div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 z-10 shadow-sm shadow-brand-500/30">
								{step.order}
							</div>

							{/* Contenu */}
							<div className="text-center">
								<p className="text-sm font-semibold text-slate-900 mb-1 leading-snug">
									{step.title}
								</p>
								<p className="text-xs text-slate-500 leading-relaxed">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ── Mobile : timeline verticale ── */}
			<div className="md:hidden space-y-0">
				{sorted.map((step, i) => (
					<div key={step.order} className="flex gap-4">
						{/* Ligne + cercle */}
						<div className="flex flex-col items-center flex-shrink-0">
							<div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold shadow-sm shadow-brand-500/30">
								{step.order}
							</div>
							{i < sorted.length - 1 && (
								<div
									className="w-px flex-1 bg-slate-200 my-1"
									aria-hidden="true"
								/>
							)}
						</div>

						{/* Contenu */}
						<div className={i < sorted.length - 1 ? "pb-6" : ""}>
							<p className="text-sm font-semibold text-slate-900 mb-1 leading-snug">
								{step.title}
							</p>
							<p className="text-xs text-slate-500 leading-relaxed">
								{step.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
