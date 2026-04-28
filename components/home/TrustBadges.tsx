import { Calendar, ShieldCheck, Settings, Star } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";

const badges = [
	{
		Icon: Calendar,
		value: "+30 ans",
		label: "D'expérience",
		pill: "Depuis 2001",
		description:
			"M. Vitor Mendonca et son équipe mettent leur savoir-faire à votre service pour des prestations fiables et durables.",
		iconBg: "bg-gradient-to-br from-red-50 to-red-100",
		iconRing: "ring-1 ring-red-200",
		iconColor: "text-red-600",
		bar: "bg-gradient-to-r from-red-500 to-red-700",
		pillCls: "bg-red-100 text-red-700 ring-1 ring-red-200",
	},
	{
		Icon: ShieldCheck,
		value: "Spécialiste",
		label: "Japonaises & coréennes",
		pill: "Expert reconnu",
		description:
			"Une expertise dédiée aux véhicules japonais et coréens, avec contrôle rigoureux et garantie 6 à 12 mois.",
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
			"Préconisations constructeur respectées et devis clair avant toute intervention.",
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
			"Accueil avec ou sans rendez-vous, avec un service fiable et transparent.",
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
			className="bg-[#f8fafc] py-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
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
									{/* Barre accent */}
									<div
										className={`absolute top-0 left-0 right-0 h-[2px] ${bar} opacity-50 group-hover:opacity-80 transition-opacity duration-250`}
										aria-hidden="true"
									/>

									{/* Icône + valeur */}
									<div className="flex items-center gap-3 mb-3">
										<div
											className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center ring-1 ${iconRing} flex-shrink-0`}
											aria-hidden="true"
										>
											<Icon
												size={16}
												className={iconColor}
												aria-hidden="true"
											/>
										</div>
										{/* Valeur principale — font-medium car c'est un chiffre clé */}
										<span className="ty-heading text-base text-[#0f172a]">
											{value}
										</span>
									</div>

									{/* Label */}
									<p className="font-normal text-[#0f172a] text-sm mb-2 leading-snug">
										{label}
									</p>

									{/* Description */}
									<p className="font-light text-[#64748b] text-xs leading-relaxed mb-4">
										{description}
									</p>

									{/* Pill badge */}
									<span
										className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full tracking-wide ${pillCls}`}
									>
										<span
											className="w-1 h-1 rounded-full bg-current opacity-60"
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
