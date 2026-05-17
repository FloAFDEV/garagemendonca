/**
 * Footer — Async Server Component
 * ─────────────────────────────────────────────────────────────────────────
 * Charge les horaires depuis la DB (Supabase). Fallback sur les horaires
 * par défaut si Supabase n'est pas configuré.
 * Seul le bouton "Gérer mes cookies" est interactif → extrait dans
 * CookieSettingsButton ("use client" minimal, jamais re-render).
 */

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import Container from "@/components/ui/Container";
import CookieSettingsButton from "@/components/cookies/CookieSettingsButton";
import { garageRepository } from "@/lib/repositories";
import { getActiveGarageId } from "@/lib/config/garage";
import type { GarageOpeningHours, GarageDay } from "@/types";

const ACTIVE_GARAGE_ID = getActiveGarageId();

const DAYS_ORDER: GarageDay[] = [
	"lundi",
	"mardi",
	"mercredi",
	"jeudi",
	"vendredi",
	"samedi",
	"dimanche",
];
const DAY_LABELS: Record<GarageDay, string> = {
	lundi: "Lundi",
	mardi: "Mardi",
	mercredi: "Mercredi",
	jeudi: "Jeudi",
	vendredi: "Vendredi",
	samedi: "Samedi",
	dimanche: "Dimanche",
};

function buildHoursRows(
	oh: GarageOpeningHours,
): { day: string; time: string }[] {
	// Groupe les jours consécutifs avec les mêmes horaires
	type Segment = {
		days: GarageDay[];
		open: string | null;
		close: string | null;
	};
	const segments: Segment[] = [];

	for (const day of DAYS_ORDER) {
		const h = oh[day];
		const open = h?.open ?? null;
		const close = h?.close ?? null;
		const last = segments[segments.length - 1];
		if (last && last.open === open && last.close === close) {
			last.days.push(day);
		} else {
			segments.push({ days: [day], open, close });
		}
	}

	return segments.map(({ days, open, close }) => {
		const label =
			days.length === 1
				? DAY_LABELS[days[0]]
				: `${DAY_LABELS[days[0]]} – ${DAY_LABELS[days[days.length - 1]]}`;
		const time =
			open && close
				? `${open.replace(":", "h")} / ${close.replace(":", "h")}`
				: "Fermé";
		return { day: label, time };
	});
}

const FALLBACK_HOURS = [
	{ day: "Lun – Jeu", time: "08h–12h / 14h–19h" },
	{ day: "Vendredi", time: "08h–12h / 14h–18h" },
	{ day: "Sam – Dim", time: "Fermé" },
];

const footerLinks = {
	services: [
		{ href: "/services#entretien", label: "Entretien & Révision" },
		{ href: "/services#mecanique", label: "Réparation Mécanique" },
		{ href: "/services#carrosserie", label: "Carrosserie & Peinture" },
	],
	navigation: [
		{ href: "/", label: "Accueil" },
		{ href: "/vehicules", label: "Occasions" },
		{ href: "/produit", label: "Notre offre VO" },
		{ href: "/contact", label: "Contact & Devis" },
		{ href: "/faq", label: "FAQ" },
	],
};

export default async function Footer() {
	// Chargement dynamique des horaires (fallback si Supabase indisponible)
	const garage = await garageRepository
		.getById(ACTIVE_GARAGE_ID)
		.catch(() => null);
	const hours = garage?.opening_hours
		? buildHoursRows(garage.opening_hours)
		: FALLBACK_HOURS;
	return (
		<footer className="bg-slate-900 text-slate-300">
			{/* Bande accent top */}
			<div
				className="h-px bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600"
				aria-hidden="true"
			/>

			{/* Corps principal */}
			<Container className="py-16">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
					{/* Colonne 1 — Marque */}
					<div className="lg:col-span-1">
						<Link
							href="/"
							className="flex items-center gap-3 mb-5 group"
							aria-label="Garage Mendonça — retour à l'accueil"
						>
							<div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/15 group-hover:ring-white/30 transition-all shadow-lg">
								<Image
									src="/images/logo-gm.webp"
									alt=""
									aria-hidden="true"
									fill
									sizes="44px"
									className="object-cover"
								/>
							</div>
							<div>
								<div className="ty-subheading text-white text-base leading-tight">
									Garage Mendonca
								</div>
								<div className="font-light text-xs text-slate-300 mt-0.5">
									Depuis 2001 · Drémil-Lafage
								</div>
							</div>
						</Link>

						<p className="font-light text-sm leading-relaxed text-slate-300 mb-5">
							Spécialiste des voitures japonaises et boîtes
							automatiques depuis 2001, le Garage Mendonca
							accueille jeunes conducteurs, seniors et personnes à
							mobilité réduite. Nous parlons portugais et
							francais.
						</p>
					</div>

					{/* Colonne 2 — Services + Nav */}
					<div>
						<h4 className="ty-label text-slate-200 mb-5">
							Nos Services
						</h4>
						<ul className="space-y-3 mb-8">
							{footerLinks.services.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="font-light text-sm hover:text-brand-400 transition-colors flex items-center gap-2 group"
									>
										<span
											className="w-1 h-1 bg-slate-200 rounded-full flex-shrink-0 group-hover:bg-brand-400 transition-colors"
											aria-hidden="true"
										/>
										{link.label}
									</Link>
								</li>
							))}
						</ul>

						<h4 className="ty-label text-slate-200 mb-5">
							Navigation
						</h4>
						<ul className="space-y-3">
							{footerLinks.navigation.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="font-light text-sm hover:text-brand-400 transition-colors flex items-center gap-2 group"
									>
										<span
											className="w-1 h-1 bg-slate-200 rounded-full flex-shrink-0 group-hover:bg-brand-400 transition-colors"
											aria-hidden="true"
										/>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Colonne 3 — Contact */}
					<div>
						<h4 className="ty-label text-slate-200 mb-5">
							Contact
						</h4>
						<ul className="space-y-4">
							<li className="flex items-start gap-3 font-light text-sm">
								<MapPin
									size={15}
									className="text-brand-500 mt-0.5 flex-shrink-0"
									aria-hidden="true"
								/>
								<div>
									<span className="block leading-relaxed">
										6 Avenue de la Mouyssaguese
										<br />
										31280 Drémil-Lafage
									</span>
									<a
										href="https://maps.google.com/?q=Garage+Mendonca+6+Avenue+de+la+Mouyssaguese+31280+Dremil-Lafage"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs mt-2 transition-colors"
									>
										Ouvrir dans Google Maps
										<ExternalLink
											size={10}
											aria-hidden="true"
										/>
									</a>
								</div>
							</li>
							<li className="flex items-center gap-3 text-sm">
								<Phone
									size={15}
									className="text-brand-500 flex-shrink-0"
									aria-hidden="true"
								/>
								<a
									href="tel:0532002038"
									className="font-medium text-slate-300 hover:text-brand-400 transition-colors"
								>
									05 32 00 20 38
								</a>
							</li>
							<li className="flex items-center gap-3 text-sm">
								<Mail
									size={15}
									className="text-brand-500 flex-shrink-0"
									aria-hidden="true"
								/>
								<a
									href="mailto:contact@garagemendonca.com"
									className="font-light hover:text-brand-400 transition-colors break-all"
								>
									contact@garagemendonca.com
								</a>
							</li>
						</ul>
					</div>

					{/* Colonne 4 — Horaires */}
					<div>
						<h4 className="ty-label text-slate-200 mb-5">
							Horaires d&apos;ouverture
						</h4>
						<div className="flex items-center gap-2 mb-4">
							<Clock
								size={13}
								className="text-brand-500"
								aria-hidden="true"
							/>
							<span className="font-light text-xs text-slate-300">
								Avec ou sans rendez-vous
							</span>
						</div>
						<ul className="space-y-3 mb-6">
							{hours.map(({ day, time }) => (
								<li
									key={day}
									className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0"
								>
									<span className="font-light text-slate-200">
										{day}
									</span>
									<span
										className={`font-medium text-xs ${
											time === "Fermé"
												? "text-slate-500"
												: "text-slate-300"
										}`}
									>
										{time}
									</span>
								</li>
							))}
						</ul>

						<a
							href="tel:0532002038"
							className="inline-flex items-center gap-2 btn-primary text-sm py-3 w-full justify-center"
						>
							<Phone size={14} aria-hidden="true" />
							Nous contacter
						</a>
					</div>
				</div>
			</Container>

			{/* Barre légale */}
			<div className="border-t border-slate-800">
				<Container className="py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] font-light text-slate-400">
					<p>
						© {new Date().getFullYear()} Garage Auto Mendonca · SARL
						· SIRET 449 948 975 00023 · RCS Toulouse ·
					</p>
					<div className="flex items-center gap-5">
						<Link
							href="/mentions-legales"
							className="hover:text-slate-500 transition-colors"
						>
							Mentions légales
						</Link>
						<Link
							href="/cgu"
							className="hover:text-slate-500 transition-colors"
						>
							CGU
						</Link>
						<Link
							href="/politique-confidentialite"
							className="hover:text-slate-500 transition-colors"
						>
							Confidentialité
						</Link>
						{/* Seul élément interactif → micro composant client isolé */}
						<CookieSettingsButton />
						<span className="text-slate-800">NAF 4520A</span>
					</div>
				</Container>
			</div>
		</footer>
	);
}
