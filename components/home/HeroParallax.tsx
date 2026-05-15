"use client";

import { useEffect, useRef } from "react";

/*
  HeroParallax — image hero avec effet parallaxe au scroll
  ─────────────────────────────────────────────────────────
  • L'image déborde de 15% en hauteur (top: -8%, height: 115%)
    pour absorber le déplacement sans révéler le fond.
  • Scroll listener rAF → translateY(scrollY × 0.28)
  • objectPosition responsive géré via ResizeObserver/matchMedia
    (impossible à faire avec Tailwind sur un inline style)

  objectPosition par breakpoint :
    mobile  (< 640px)   : 68% 50% → enseigne décalée à droite, hors texte
    tablette (≥ 640px)  : 60% 50% → équilibre bâtiment/texte
    desktop (≥ 1024px)  : 55% 50% → signe visible, voitures en foreground
*/

function getObjectPosition(): string {
	if (typeof window === "undefined") return "55% 50%";
	if (window.innerWidth < 640)  return "82% 50%"; /* mobile : enseigne hors zone texte */
	if (window.innerWidth < 1024) return "65% 50%"; /* tablette */
	return "55% 50%";                               /* desktop : signe visible à droite */
}

export default function HeroParallax({
	src,
}: {
	src: string;
	blurDataURL?: string;
}) {
	const imgRef = useRef<HTMLImageElement>(null);
	const rafRef = useRef<number>(0);

	/* ── Parallaxe scroll ── */
	useEffect(() => {
		const onScroll = () => {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				const img = imgRef.current;
				if (!img) return;
				img.style.transform = `translateY(${window.scrollY * 0.28}px)`;
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	/* ── objectPosition responsive ── */
	useEffect(() => {
		const img = imgRef.current;
		if (!img) return;

		const apply = () => {
			img.style.objectPosition = getObjectPosition();
		};

		apply();

		const mql = window.matchMedia("(min-width: 640px), (min-width: 1024px)");
		mql.addEventListener("change", apply);
		return () => mql.removeEventListener("change", apply);
	}, []);

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			ref={imgRef}
			src={src}
			alt=""
			aria-hidden="true"
			loading="eager"
			decoding="async"
			style={{
				position: "absolute",
				top: "-8%",
				left: 0,
				width: "100%",
				height: "115%",
				objectFit: "cover",
				objectPosition: "55% 50%", /* valeur SSR, réécrite côté client */
				willChange: "transform",
				transform: "translateY(0px)",
			}}
		/>
	);
}
