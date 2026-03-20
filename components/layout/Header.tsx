"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import clsx from "clsx";
import Container from "@/components/ui/Container";

const navLinks = [
	{ href: "/", label: "Accueil" },
	{ href: "/services", label: "Services" },
	{ href: "/vehicules", label: "Occasions" },
	{ href: "/contact", label: "Contact" },
];

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 30);
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={clsx(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300",
				scrolled
					? "bg-white shadow-[0_1px_0_#e2e8f0,0_4px_16px_rgba(0,0,0,0.08)] py-0"
					: "bg-black/10 backdrop-blur-[2px] py-2", // Léger voile pour la lisibilité du texte blanc en haut
			)}
		>
			{/* ── Barre info supérieure ── */}
			<div
				className={clsx(
					"bg-[#0f172a] text-slate-400 text-xs py-2 hidden md:block transition-all duration-300",
					scrolled && "h-0 py-0 overflow-hidden opacity-0",
				)}
			>
				<Container className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<Phone
							size={12}
							className="text-brand-400"
							aria-hidden="true"
						/>
						<a
							href="tel:0532002038"
							className="hover:text-white transition-colors font-medium"
						>
							05 32 00 20 38
						</a>
						<span className="mx-3 opacity-30" aria-hidden="true">
							|
						</span>
						<span>Lun–Ven : 08h–12h / 14h–19h</span>
					</span>
					<a
						href="mailto:contact@garagemendonça.com"
						className="hover:text-white transition-colors"
					>
						contact@garagemendonça.com
					</a>
				</Container>
			</div>

			{/* ── Nav principale ── */}
			<Container as="nav" aria-label="Navigation principale">
				<div className="flex items-center h-16 md:h-[72px]">
					{" "}
					{/* Retrait de justify-between ici */}
					{/* 1. Logo (reste à gauche par défaut) */}
					<Link
						href="/"
						className="flex items-center group flex-shrink-0"
					>
						<div className="relative h-[55px] md:h-[60px] w-[180px] md:w-[220px]">
							<Image
								src="/images/logo.webp"
								alt="Garage Mendonça"
								fill
								priority
								className="object-contain object-left"
							/>
						</div>
					</Link>
					{/* 2. Liens desktop - AJOUT DE ml-auto POUR POUSSER À DROITE */}
					<ul
						className="hidden md:flex items-center gap-1 ml-auto mr-8"
						role="list"
					>
						{navLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className={clsx(
										"font-medium px-4 py-3 rounded-lg transition-all duration-300 text-base",
										scrolled
											? "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
											: "text-white hover:text-white hover:bg-white/10",
									)}
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
					{/* 3. CTA & Burger */}
					<div className="flex items-center gap-4 ml-auto md:ml-0">
						<div className="hidden md:block">
							<a
								href="tel:0532002038"
								className={clsx(
									"btn-primary text-xs py-2.5 px-5 transition-all duration-300",
									!scrolled &&
										"shadow-none border border-white/20 hover:bg-white/10 bg-transparent text-white",
								)}
							>
								<Phone size={14} />
								Prendre RDV
							</a>
						</div>

						{/* Burger mobile (gardera sa place à droite grâce au ml-auto du parent sur mobile) */}
						<button
							onClick={() => setIsOpen(!isOpen)}
							className={clsx(
								"md:hidden p-2 rounded-lg transition-colors",
								scrolled
									? "text-slate-900 hover:bg-slate-100"
									: "text-white hover:bg-white/10",
							)}
						>
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</Container>
			<style jsx>{`
				@keyframes slide-down {
					0% {
						opacity: 0;
						transform: translateY(-10px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-slide-down {
					animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)
						forwards;
				}
			`}</style>
		</header>
	);
}
