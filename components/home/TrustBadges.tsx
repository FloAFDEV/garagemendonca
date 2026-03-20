import { Calendar, ShieldCheck, Settings, Star } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";

const badges = [
	{
		Icon: Calendar,
		value: "+30 ANS",
		label: "D'expérience",
		pill: "Depuis 2001",
		description:
			"M. Vitor Mendonça et son équipe mettent leur savoir-faire à votre service pour des prestations de qualité.",
		iconBg: "bg-gradient-to-br from-red-50 to-red-100",
		iconRing: "ring-1 ring-red-200",
		iconColor: "text-red-600",
		bar: "bg-gradient-to-r from-red-500 to-red-700",
		pillCls: "bg-red-100 text-red-700 ring-1 ring-red-200",
	},
	{
		Icon: ShieldCheck,
		value: "Véhicules",
		label: "Expertisés & garantis",
		pill: "Garantie incluse",
		description:
			"Garantie 6 à 12 mois km illimités. Vérification en 160 points et 250–500 km parcourus avant mise en vente.",
		iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
		iconRing: "ring-1 ring-slate-300",
		iconColor: "text-slate-700",
		bar: "bg-gradient-to-r from-slate-500 to-slate-700",
		pillCls: "bg-slate-200 text-slate-800 ring-1 ring-slate-300",
	},
	{
		Icon: Settings,
		value: "Rigueur",
		label: "Dans la préparation",
		pill: "Certifié pro",
		description:
			"Préconisations constructeur toujours respectées. Devis pièce & main-d'œuvre établi avant toute intervention.",
		iconBg: "bg-gradient-to-br from-amber-50 to-amber-100",
		iconRing: "ring-1 ring-amber-200",
		iconColor: "text-amber-600",
		bar: "bg-gradient-to-r from-amber-500 to-amber-600",
		pillCls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
	},
	{
		Icon: Star,
		value: "Satisfaction",
		label: "Notre priorité",
		pill: "98 % satisfaits",
		description:
			"Accueil avec ou sans rendez-vous, du lundi au vendredi. La satisfaction client est au cœur de chaque intervention.",
		iconBg: "bg-gradient-to-br from-red-50 to-red-100",
		iconRing: "ring-1 ring-red-200",
		iconColor: "text-red-600",
		bar: "bg-gradient-to-r from-red-500 to-red-700",
		pillCls: "bg-red-100 text-red-700 ring-1 ring-red-200",
	},
];

export default function TrustBadges() {
	return (
		<section
			className="bg-[#f8fafc] py-6 shadow-[0_8px_32px_rgba(0,0,0,0.07)]"
			aria-label="Nos engagements"
		>
			<Container>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
					{badges.map(
						(
							{
								Icon,
								value,
								label,
								pill,
								description,
								iconBg,
								iconRing,
								iconColor,
								bar,
								pillCls,
							},
							i,
						) => (
							<AnimateOnScroll key={label} delay={i * 80}>
								<div className="group relative bg-white rounded-xl border border-slate-100 px-5 py-6 overflow-hidden transition-all duration-250 hover:shadow-md hover:-translate-y-0.5">
									{/* Barre accent couleur haut */}
									<div
										className={`absolute top-0 left-0 right-0 h-[3px] ${bar} opacity-60 group-hover:opacity-100 transition-opacity duration-250`}
										aria-hidden="true"
									/>

									{/* Icône + valeur */}
									<div className="flex items-center gap-3 mb-3">
										<div
											className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center ring-1 ${iconRing} flex-shrink-0`}
											aria-hidden="true"
										>
											<Icon
												size={17}
												className={iconColor}
												aria-hidden="true"
											/>
										</div>
										<span className="font-heading font-black text-base text-[#0f172a] leading-tight">
											{value}
										</span>
									</div>

									{/* Label */}
									<p className="font-semibold text-[#0f172a] text-sm mb-2 leading-snug">
										{label}
									</p>

									{/* Description */}
									<p className="text-[#64748b] text-xs leading-relaxed mb-3">
										{description}
									</p>

									{/* Pill badge coloré */}
									<span
										className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${pillCls}`}
									>
										<span
											className="w-1 h-1 rounded-full bg-current opacity-70"
											aria-hidden="true"
										/>
										{pill}
									</span>
								</div>
							</AnimateOnScroll>
						),
					)}
				</div>
			</Container>
		</section>
	);
}
