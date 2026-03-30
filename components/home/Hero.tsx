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
			{/*
			  ─── STRATÉGIE IMAGE ───────────────────────────────────────────────
			  Règle : sur mobile le texte couvre toute la largeur → on décale
			  l'image vers la droite pour révéler l'enseigne SANS que le
			  décalage soit trop fort sur les grands écrans où l'enseigne
			  se retrouverait derrière le bloc texte.

			  Valeurs calibrées :
			    < sm  (mobile)          : 72 % → enseigne visible à droite ✓
			    sm    (tablette 768 px) : 60 % → décalage modéré
			    md    (≥ 1024 px)       : 20 % → léger décalage, texte protégé
			    lg+   (desktop)         : 5  % → quasi identique à l'original
			                                     (prouvé fonctionnel)

			  Solution B – double image (recommandée à terme) :
			    Quand une version portrait de l'image sera disponible, remplacer
			    le bloc ci-dessous par :

			    <Image
			      src="/images/garage-hero-mobile.webp"   ← portrait, enseigne centrée
			      alt="Atelier du Garage Auto Mendonça"
			      fill priority
			      className="sm:hidden object-cover object-center"
			      sizes="100vw"
			    />
			    <Image
			      src="/images/garage-hero.webp"
			      alt="Atelier du Garage Auto Mendonça"
			      fill priority
			      className="hidden sm:block object-cover object-[20%_center] lg:object-[5%_50%]"
			      sizes="100vw"
			    />
			  ────────────────────────────────────────────────────────────────── */}
			<div className="absolute inset-0 z-0">
				<Image
					src="/images/garage-hero.webp"
					alt="Atelier du Garage Auto Mendonça"
					fill
					priority
					className="object-cover object-[72%_center] sm:object-[60%_center] md:object-[20%_center] lg:object-[5%_50%]"
					sizes="100vw"
				/>
			</div>

			{/*
			  Overlay gradient L → R :
			  Le "from" très sombre couvre la colonne texte (côté gauche).
			  Le "to-transparent" laisse l'image s'exprimer sur la droite.
			  Valeurs identiques à la version originale validée.
			*/}
			<div
				className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/40 to-transparent z-1"
				aria-hidden="true"
			/>
			{/*
			  Couche plate de sécurité : assombrit uniformément l'ensemble,
			  critique pour la lisibilité du texte sur mobile (plein écran)
			  et pour éviter que l'enseigne lumineuse ne "transperce" le gradient.
			*/}
			<div
				className="absolute inset-0 bg-black/28 z-1"
				aria-hidden="true"
			/>

			{/* Contenu */}
			<div className="relative flex-1 flex items-center">
				<Container className="pt-28 sm:pt-24 md:pt-36 pb-20 mb-6">
					<div className="max-w-2xl xl:max-w-3xl">
						{/* Eyebrow */}
						<div className="flex items-center gap-3 mb-8 animate-fade-in">
							<div
								className="w-8 h-px bg-brand-500 flex-shrink-0"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-normal text-[10px] uppercase tracking-caps leading-tight">
								Garage Mendonça – Expert auto depuis 2001
							</span>
						</div>

						{/* H1 */}
						<h1 className="ty-display text-white text-4xl md:text-6xl xl:text-7xl mb-6 animate-slide-up [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
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
						<p className="text-slate-200 font-light text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-slide-up">
							Mécaniciens qualifiés, équipement dernière
							génération, devis transparent avant toute
							intervention. <br className="hidden lg:block" />
							Spécialiste japonaises et boîte automatique depuis
							2001. Jeunes conducteurs, seniors &amp; PMR
							bienvenus.
						</p>

						{/* H3 */}
						<h3 className="ty-display text-white text-2xl md:text-3xl xl:text-4xl mt-6 mb-6 animate-slide-up [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
							Spécialiste
							<br />
							<span className="text-brand-500">
								japonaises et coréennes
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

						<StatsCounter />
					</div>
				</Container>
			</div>

			{/* Badges flottants desktop */}
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

			{/* Scroll indicator */}
			<div
				className="relative pb-10 flex flex-col items-center gap-1 text-white/60"
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
