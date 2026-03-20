import Link from "next/link";
import {
	Phone,
	ArrowRight,
	ShieldCheck,
	Clock,
	Award,
	ChevronDown,
} from "lucide-react";
import StatsCounter from "@/components/home/StatsCounter";
import Container from "@/components/ui/Container";

const trustBadges = [
	{
		Icon: ShieldCheck,
		text: "Devis pièce & main-d'œuvre avant toute intervention",
	},
	{ Icon: Clock, text: "Accueil avec ou sans rendez-vous" },
	{ Icon: Award, text: "Spécialiste japonaises · boîte automatique" },
];

export default function Hero() {
	return (
		<section className="relative min-h-screen flex flex-col overflow-hidden bg-[#0f172a]">
			{/* Fond photo — atelier du garage */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{
					backgroundImage: "url('/images/garage-hero.webp')",
				}}
				role="img"
				aria-label="Atelier du Garage Auto Mendonça à Drémil-Lafage"
			/>

			{/* Overlays — contraste renforcé */}
			<div
				className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"
				aria-hidden="true"
			/>
			<div
				className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"
				aria-hidden="true"
			/>

			{/* Trait accent gauche */}

			{/* Contenu */}
			<div className="relative flex-1 flex items-center">
				<Container className="pt-40 pb-20">
					<div className="max-w-2xl xl:max-w-3xl">
						{/* Eyebrow */}
						<div className="flex items-center gap-3 mb-8 animate-fade-in">
							<div
								className="w-8 h-px bg-brand-500"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
								Garage Mendonça – Expert auto depuis 2001
							</span>
						</div>

						{/* H1 */}
						<h1 className="font-heading font-black text-white text-5xl md:text-6xl xl:text-7xl leading-[1.03] mb-6 animate-slide-up [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
							Votre garage
							<br />
							de confiance à{" "}
							<span className="relative">
								<span className="text-brand-500">
									Drémil-Lafage
								</span>
								<span
									className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-500/50"
									aria-hidden="true"
								/>
							</span>
						</h1>

						{/* Sous-titre (p, pas h2) */}
						<p className="text-slate-100 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-slide-up">
							Mécaniciens qualifiés, équipement dernière
							génération, devis transparent avant toute
							intervention. <br className="hidden lg:block" />
							Spécialiste japonaises et boîte automatique depuis
							2001. Jeunes conducteurs, seniors &amp; PMR
							bienvenus.
						</p>

						{/* CTA */}
						<div className="flex flex-col sm:flex-row gap-4 mb-14 animate-slide-up">
							<a
								href="tel:0532002038"
								className="btn-primary text-base py-4 px-8 shadow-brand-lg"
							>
								<Phone size={18} aria-hidden="true" />
								Appeler le 05 32 00 20 38
							</a>
							<Link
								href="/contact"
								className="btn-outline text-base py-4 px-8"
							>
								Demander un devis gratuit
								<ArrowRight size={17} aria-hidden="true" />
							</Link>
						</div>

						{/* Stats — animation compteur */}
						<StatsCounter />
					</div>
				</Container>
			</div>

			{/* Badges flottants — desktop */}
			<div className="absolute bottom-14 right-8 hidden xl:flex flex-col gap-3 animate-fade-in">
				{trustBadges.map(({ Icon, text }) => (
					<div
						key={text}
						className="bg-white/12 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 text-white text-sm shadow-lg"
					>
						<Icon
							size={17}
							className="text-brand-400 flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-medium">{text}</span>
					</div>
				))}
			</div>

			{/* Scroll indicator */}
			<div
				className="relative pb-10 flex flex-col items-center gap-1 text-white/50"
				aria-hidden="true"
			>
				<span className="text-[10px] uppercase tracking-widest">
					Découvrir
				</span>
				<ChevronDown size={18} className="motion-safe:animate-bounce" />
			</div>
		</section>
	);
}
