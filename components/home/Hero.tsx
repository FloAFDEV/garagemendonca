import Link from "next/link";
import Image from "next/image";
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
			<div className="absolute inset-0 z-0">
				<Image
					src="/images/garage-hero.webp"
					alt="Atelier du Garage Auto Mendonça"
					fill
					priority
					className="object-cover object-[50%_50%] lg:object-[5%_50%]"
					sizes="100vw"
				/>
			</div>

			{/* Overlays — On renforce le noir à gauche pour que le texte "pop" */}
			<div
				className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-1"
				aria-hidden="true"
			/>
			<div
				className="absolute inset-0 bg-black/30 z-1"
				aria-hidden="true"
			/>

			{/* Trait accent gauche */}
			{/* Contenu */}
			<div className="relative flex-1 flex items-center">
				{/* On augmente le padding-top sur mobile (pt-28 au lieu de pt-16) */}
				<Container className="pt-28 sm:pt-24 md:pt-36 pb-20 mb-6">
					<div className="max-w-2xl xl:max-w-3xl">
						{/* Eyebrow - ESPACE AJOUTÉ ICI DANS LES CLASSES */}
						<div className="flex items-center gap-3 mb-8 animate-fade-in">
							<div
								className="w-8 h-px bg-brand-500 flex-shrink-0"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-semibold text-[10px] sm:text-xs uppercase tracking-[0.18em] leading-tight">
								Garage Mendonça – Expert auto depuis 2001
							</span>
						</div>

						{/* H1 - On réduit un peu la taille sur mobile (text-4xl) pour éviter qu'il ne prenne trop de place */}
						<h1 className="font-heading font-black text-white text-4xl md:text-6xl xl:text-7xl leading-[1.1] mb-6 animate-slide-up [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
							Votre garage
							<br />
							de confiance à{" "}
							<span className="relative inline-block">
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

						{/* H3 */}
						<h3 className="font-heading font-black text-white text-2xl md:text-3xl xl:text-4xl leading-[1.03] mt-6 mb-6 animate-slide-up [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
							Spécialiste
							<br />
							<span className="relative">
								<span className="text-brand-500">
									japonaises et coréennes
								</span>
							</span>
						</h3>

						{/* CTA */}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs mx-auto sm:max-w-full sm:mx-0 mb-14 animate-slide-up">
							<a
								href="tel:0532002038"
								className="btn-primary w-full sm:w-auto text-base sm:text-lg py-2.5 px-5 sm:py-4 sm:px-8 flex justify-center items-center gap-2 shadow-brand-lg"
							>
								<Phone size={18} aria-hidden="true" />
								Appeler le 05 32 00 20 38
							</a>
							<Link
								href="/contact"
								className="btn-outline w-full sm:w-auto text-base sm:text-lg py-2.5 px-5 sm:py-4 sm:px-8 flex justify-center items-center gap-2"
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
