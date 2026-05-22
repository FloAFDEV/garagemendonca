"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Car, Phone } from "lucide-react";
import Header from "@/components/layout/Header";

export default function NotFound() {
	/* Verrouille le scroll du body — garantit zéro scroll quelle que soit
	   la taille de la barre d'adresse mobile (dvh vs svh). */
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => { document.body.style.overflow = ""; };
	}, []);

	return (
		<>
			<Header />

			{/*
			  svh = small viewport height (barre d'adresse visible incluse).
			  Plus fiable que dvh sur mobile : ne dépasse jamais la zone peinte.
			  body overflow:hidden via useEffect → zéro scroll garanti.
			*/}
			<main className="h-[calc(100svh-64px)] md:h-[calc(100svh-72px)] mt-16 md:mt-[72px] bg-[#f8fafc] flex flex-col items-center justify-center px-4 gap-3 sm:gap-5 text-center overflow-hidden">

				{/* Illustration — +20 % vs version précédente */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
					className="flex justify-center w-full flex-shrink-0"
					aria-hidden="true"
				>
					<Image
						src="/images/404-illustration.webp"
						alt=""
						width={800}
						height={600}
						priority
						className="w-auto object-contain"
						style={{ maxHeight: "clamp(132px, 33.6svh, 312px)" }}
						onError={(e) => { e.currentTarget.style.display = "none"; }}
					/>
				</motion.div>

				{/* Message + CTAs */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15, duration: 0.4 }}
					className="max-w-md w-full flex-shrink-0"
				>
					<h1 className="font-heading font-medium text-[#0f172a] text-xl sm:text-2xl md:text-3xl mb-1.5 sm:mb-3 tracking-tight">
						Oups&nbsp;! Cette route est sans issue.
					</h1>
					<p className="text-[#475569] text-sm sm:text-base leading-relaxed mb-3 sm:mb-5">
						Le véhicule ou la page recherchée n&apos;est plus disponible
						ou a changé d&apos;adresse.
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-5">
						<Link
							href="/"
							className="btn-primary w-full sm:w-auto px-6 py-2.5 justify-center text-sm"
						>
							<ArrowLeft size={18} strokeWidth={1.75} />
							Retourner à l&apos;accueil
						</Link>
						<Link
							href="/vehicules"
							className="btn-secondary w-full sm:w-auto px-6 py-2.5 justify-center text-sm"
						>
							<Car size={18} strokeWidth={1.75} />
							Voir nos véhicules
						</Link>
					</div>

					{/* Lien assistance */}
					<p className="text-[#64748b] text-xs sm:text-sm">
						Besoin d&apos;aide&nbsp;?{" "}
						<a
							href="tel:0532002038"
							className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors"
						>
							<Phone size={13} strokeWidth={1.75} aria-hidden="true" />
							05&nbsp;32&nbsp;00&nbsp;20&nbsp;38
						</a>
					</p>
				</motion.div>
			</main>
		</>
	);
}
