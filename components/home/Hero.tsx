import Link from "next/link";
import Image from "next/image";
import HeroParallax from "./HeroParallax";
import {
	Phone,
	ArrowRight,
	ShieldCheck,
	Clock,
	Award,
	ChevronDown,
} from "lucide-react";
import Container from "@/components/ui/Container";

const trustBadges = [
	{
		Icon: ShieldCheck,
		text: "Devis pièce & main-d'œuvre avant toute intervention",
	},
	{ Icon: Clock, text: "Accueil avec ou sans rendez-vous" },
	{ Icon: Award, text: "Spécialiste japonaises · boîte automatique" },
];

const stats = [
	{ value: "30+", label: "Ans d'expérience" },
	{ value: "2 000+", label: "Réparations réalisées" },
	{ value: "98 %", label: "Clients satisfaits" },
];

export default function Hero() {
	return (
		/*
		  h-[100svh]   → hauteur exacte du viewport visible (safe viewport height)
		               Exclut la toolbar Safari sur iOS. Pas de double-scroll.
		  min-h-[580px] → plancher pour petits écrans / clavier ouvert
		  max-h-[920px] → plafond ultrawide (évite un hero de 2000px sur 4K)
		*/
		<section className="relative flex flex-col overflow-hidden bg-[#0f172a] h-[100svh] min-h-[580px] max-h-[920px]">
			{/* Image hero avec parallaxe — client component */}
			<div className="absolute inset-0 z-0 overflow-hidden">
				<HeroParallax
					src="/images/garage-hero.webp"
					blurDataURL="data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACQAwCdASoUAA4APzmEuVOvKKWisAgB4CcJYwCw7CHXM7kTkb4gAP7i1RsqrgFVkvWAc0CH7FmQjgfFK0vcFjfsd5Hf8lO3qB/LQBi85PMkMM7AAAA="
				/>
			</div>

			{/* Gradient L→R : protège la colonne texte gauche sur desktop */}
			<div
				className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/50 to-black/10 z-1"
				aria-hidden="true"
			/>
			{/* Couche plate : sécurité contraste globale */}
			<div
				className="absolute inset-0 bg-black/28 z-1"
				aria-hidden="true"
			/>
			{/* Overlay mobile renforcé */}
			<div
				className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent sm:hidden z-1"
				aria-hidden="true"
			/>

			{/* Contenu — min-h-0 permet la compression flex sans overflow */}
			<div className="relative flex-1 flex items-center min-h-0">
				{/*
				  pt : compense navbar fixe + topbar (md+, visible si non scrollé) + bannière (~88px avec image)
				  Mobile : bannière 38px (pas d'image) + nav 64px + 30px air  = 132px
				  sm     : bannière 88px (image 64px + py-3) + nav 64px + 12px = 164px
				  md     : bannière 88px + topbar 32px + nav 72px + 12px air   = 204px
				  lg     : idem md                                              = 204px
				*/}
				<Container className="pt-[132px] sm:pt-[164px] md:pt-[224px] lg:pt-[224px] pb-6 md:pb-8">
					<div className="max-w-2xl xl:max-w-3xl">
						{/* Eyebrow */}
						<div className="flex items-center gap-3 mb-5 animate-fade-in">
							<div
								className="w-8 h-px bg-brand-500 flex-shrink-0"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-normal text-[10px] uppercase tracking-caps leading-tight">
								Garage Mendonca – Expert auto depuis 2003
							</span>
						</div>

						{/* H1
						  text-4xl             → mobile  (375px) ~36px
						  md:text-5xl          → laptop  (768px) ~48px  — réduit de 60→48 pour 1366×768
						  lg:text-6xl          → desktop (1024px) ~60px
						  xl:text-7xl          → large   (1280px+) ~72px
						*/}
						<h1 className="ty-display text-white text-3xl md:text-[42px] lg:text-5xl xl:text-[60px] mb-4 animate-slide-up [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
							Votre garage
							<br />
							de confiance à{" "}
							<span className="relative inline-block">
								<span className="text-brand-500">
									Drémil-Lafage
								</span>
								<span
									className="absolute -bottom-1 left-0 right-0 h-px bg-brand-500/40"
									aria-hidden="true"
								/>
							</span>
						</h1>

						{/* Sous-titre */}
						<p className="text-slate-200 font-light text-base md:text-lg leading-relaxed mb-5 max-w-xl animate-slide-up">
							Mécaniciens qualifiés, équipement dernière
							génération, devis transparent avant toute
							intervention.{" "}
							<br className="hidden lg:block" />
							Spécialiste japonaises et boîte automatique depuis
							2003. Jeunes conducteurs, seniors &amp; PMR
							bienvenus.
						</p>

						{/* H3 */}
						<h3 className="ty-display text-white text-lg md:text-xl lg:text-2xl xl:text-3xl mt-3 mb-4 animate-slide-up [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
							Spécialiste
							<br />
							<span className="text-brand-500">
								japonaises et coréennes
							</span>
						</h3>

						{/* CTA */}
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs mx-auto sm:max-w-full sm:mx-0 mb-6 animate-slide-up">
							<a
								href="tel:0532002038"
								className="btn-primary w-full sm:w-auto text-sm sm:text-base py-2.5 px-5 sm:py-3 sm:px-7 flex justify-center items-center gap-2 shadow-brand-lg"
							>
								<Phone size={16} aria-hidden="true" />
								Nous contacter
							</a>
							<Link
								href="/contact"
								className="btn-outline w-full sm:w-auto text-white sm:text-base py-2.5 px-5 sm:py-3 sm:px-7 flex justify-center items-center gap-2"
							>
								Demander un devis gratuit
								<ArrowRight size={17} aria-hidden="true" />
							</Link>
						</div>

						{/* Stats — 3 items → grid-cols-3 (l'original avait grid-cols-4, col vide) */}
						<div className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 border-t border-white/12 animate-fade-in text-white">
							{stats.map(({ value, label }) => (
								<div
									key={label}
									className="text-center sm:text-left"
								>
									<div className="ty-stat text-xl sm:text-2xl md:text-3xl leading-none mb-1">
										{value}
									</div>
									<div className="text-slate-300 font-light text-[10px] sm:text-xs leading-snug mt-0.5">
										{label}
									</div>
								</div>
							))}
						</div>
					</div>
				</Container>
			</div>

			{/* ── Logo GM — badge emblème coin haut droit ─────────────── */}
			<div
				className="absolute top-[80px] right-6 sm:top-[88px] sm:right-8 md:top-[100px] md:right-12 z-10 animate-fade-in hidden sm:block"
				aria-hidden="true"
			>
				<div className="relative sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full ring-2 ring-white/30 shadow-[0_6px_32px_rgba(0,0,0,0.6)] overflow-hidden">
					<Image
						src="/images/logo-gm.webp"
						alt=""
						fill
						sizes="(max-width: 1024px) 80px, 112px"
						className="object-cover"
						priority
					/>
				</div>
			</div>

			{/* Badges flottants — uniquement xl (≥1280px), évite de cacher du contenu */}
			<div className="absolute bottom-14 right-8 hidden xl:flex flex-col gap-3 animate-fade-in">
				{trustBadges.map(({ Icon, text }) => (
					<div
						key={text}
						className="bg-white/05 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3 text-white text-sm shadow-lg"
					>
						<Icon
							size={15}
							className="text-brand-400 flex-shrink-0"
							aria-hidden="true"
						/>
						<span className="font-light text-sm text-white/90">
							{text}
						</span>
					</div>
				))}
			</div>

			{/* Scroll indicator — pb-6 (réduit de pb-10) */}
			<div
				className="relative pb-6 flex flex-col items-center gap-1 text-white/60"
				aria-hidden="true"
			>
				<span className="text-[9px] font-light uppercase tracking-caps">
					Découvrir
				</span>
				<ChevronDown size={16} className="motion-safe:animate-bounce" />
			</div>
		</section>
	);
}
