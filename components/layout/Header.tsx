"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
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
	const pathname = usePathname();

	/* Pages avec fond clair qui nécessitent un header opaque dès le départ */
	const isLightPage =
		pathname === "/vehicules" ||
		/^\/vehicules\/.+/.test(pathname) ||
		pathname === "/contact" ||
		pathname === "/cgu" ||
		pathname === "/mentions-legales" ||
		pathname === "/politique-confidentialite";

	/* Opaque si scrollé OU si page à fond clair */
	const isOpaque = scrolled || isLightPage;

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 30);
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={clsx(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300",
				isOpaque
					? "bg-white shadow-[0_1px_0_#e2e8f0,0_4px_16px_rgba(0,0,0,0.08)] py-0"
					: "bg-black/10 backdrop-blur-[2px] py-2",
			)}
		>
			{/* ── Barre info supérieure ── */}
			<div
				className={clsx(
					"bg-[#0f172a] text-slate-400 text-xs py-2 hidden md:block transition-all duration-300",
					isOpaque && "h-0 py-0 overflow-hidden opacity-0",
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
					{/* 1. Logo */}
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

					{/* 2. Liens desktop */}
					<ul
						className="hidden md:flex items-center gap-1 ml-auto mr-8"
						role="list"
					>
						{navLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className={clsx(
										"font-medium px-4 py-3 rounded-lg transition-all duration-300 text-sm",
										isOpaque
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
									!isOpaque &&
										"shadow-none border border-white/20 hover:bg-white/10 bg-transparent text-white",
								)}
							>
								<Phone size={14} />
								Prendre RDV
							</a>
						</div>

						{/* Burger mobile - COULEUR CORRIGÉE ICI */}
						<button
							onClick={() => setIsOpen(!isOpen)}
							className={clsx(
								"md:hidden p-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-400",
								isOpaque
									? "text-[#0f172a] hover:bg-slate-100"
									: "text-white hover:bg-white/10",
							)}
							aria-label={
								isOpen ? "Fermer le menu" : "Ouvrir le menu"
							}
							aria-expanded={isOpen}
						>
							{isOpen ? <X size={22} /> : <Menu size={22} />}
						</button>
					</div>
				</div>

				{/* Menu mobile */}
				<div
					id="mobile-menu"
					className={clsx(
						"md:hidden overflow-hidden transition-all duration-300 ease-in-out",
						isOpen
							? "max-h-[380px] pb-4 opacity-100"
							: "max-h-0 opacity-0",
					)}
				>
					<div className="bg-white rounded-2xl p-3 flex flex-col gap-0.5 border border-slate-200 shadow-md">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className="text-[#475569] hover:text-[#0f172a] font-medium px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
							>
								{link.label}
							</Link>
						))}
						<div className="border-t border-slate-100 mt-2 pt-3">
							<a
								href="tel:0532002038"
								className="btn-primary w-full justify-center text-sm"
							>
								<Phone size={15} />
								05 32 00 20 38
							</a>
						</div>
					</div>
				</div>
			</Container>{" "}
			{/* <-- FERMETURE DU CONTAINER AJOUTÉE */}
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
