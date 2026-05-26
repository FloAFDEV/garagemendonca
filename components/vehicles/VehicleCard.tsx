"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VehiclePhotoImage from "@/components/vehicles/VehiclePhotoImage";
import { Fuel, Gauge, Calendar, ArrowRight, Star } from "lucide-react";
import { Vehicle } from "@/types";
import type { VehicleOptions } from "@/types";
import Badge from "@/components/ui/Badge";
import { getLogoSrc } from "@/lib/brandLogos";
import { getMarketingBadge } from "@/lib/vehicles/helpers";
import { resolveVehicleHref } from "@/lib/utils/slug";

/* ── Options highlights ─────────────────────────────────────────────────── */
const HIGHLIGHT_KEYS: (keyof VehicleOptions)[] = [
	"climatisation_automatique",
	"toit_panoramique",
	"toit_ouvrant",
	"camera_recul",
	"regulateur_adaptatif",
	"jantes_alliage",
	"climatisation",
	"sieges_chauffants",
	"regulateur_vitesse",
	"demarrage_sans_cle",
	"ecran_tactile",
	"gps",
	"bluetooth",
];

const HIGHLIGHT_LABELS: Partial<Record<keyof VehicleOptions, string>> = {
	climatisation_automatique: "Clim auto",
	toit_panoramique:          "Toit pano",
	toit_ouvrant:              "Toit ouvrant",
	camera_recul:              "Caméra recul",
	regulateur_adaptatif:      "Régulateur ACC",
	jantes_alliage:            "Jantes alliage",
	climatisation:             "Climatisation",
	sieges_chauffants:         "Sièges chauf.",
	regulateur_vitesse:        "Régulateur",
	demarrage_sans_cle:        "Keyless",
	ecran_tactile:             "Écran tactile",
	gps:                       "GPS",
	bluetooth:                 "Bluetooth",
};

/**
 * cleanModelText — retire les détails techniques superflus du champ `model`.
 * Les données DB contiennent parfois "Jazz 1.2i 85 ch Boîte automatique" :
 * on extrait uniquement la dénomination commerciale "Jazz".
 * La puissance, la cylindrée et la boîte ont chacune leur badge dédié.
 */
function cleanModelText(raw: string, finition?: string | null): string {
	let s = raw
		// Cylindrée : "1.2i", "1.5 VVT-i", "2.0 THP", "0.9 TCe" etc.
		.replace(/\s+\d+[.,]\d+[a-z]{0,3}\b/gi, "")
		// Puissance isolée : "100 ch", "85 CV", "125 kW", "90hp"
		.replace(/\s+\d{2,4}\s*(ch|cv|kw|hp|bhp)\b/gi, "")
		// Mention boîte dans le modèle
		.replace(/\s*(boîte\s+)?(automatique|manuelle)\b/gi, "")
		// Acronymes transmission
		.replace(/\s*\b(bva|bvm)\b/gi, "")
		.replace(/\s+/g, " ")
		.trim();

	// Si la finition se retrouve doublonnée dans le champ modèle, on la retire
	if (finition) {
		const esc = finition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		s = s.replace(new RegExp(`\\s*\\b${esc}\\b\\s*`, "gi"), " ").trim();
	}

	return s;
}

interface VehicleCardProps {
	vehicle: Vehicle;
	priority?: boolean;
}

export default function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
	const router = useRouter();
	const colorLabel = vehicle.color ?? "";
	const altText = `${vehicle.brand} ${vehicle.model} ${vehicle.year}${colorLabel ? ` — ${colorLabel}` : ""} — ${vehicle.mileage.toLocaleString("fr-FR")} km`;
	const priceLabel = `${vehicle.price.toLocaleString("fr-FR")} euros`;

	const imgAlt = vehicle.vehicleImages?.[0]?.alt ?? altText;
	const imgSrc = vehicle.thumbnailUrl;

	const finition =
		vehicle.features?.finition ??
		(vehicle.features as { Finition?: string } | undefined)?.Finition;

	const garantie =
		vehicle.features?.garantie ??
		(vehicle.features as { Garantie?: string } | undefined)?.Garantie;

	const marketingBadge = getMarketingBadge(vehicle.features as Record<string, unknown>);
	const href = resolveVehicleHref(vehicle);

	const optionHits = vehicle.options
		? HIGHLIGHT_KEYS.filter((k) => vehicle.options![k] === true)
		: [];

	return (
		<Link
			href={href}
			prefetch={false}
			onMouseEnter={() => router.prefetch(href)}
			onTouchStart={() => router.prefetch(href)}
			className="group flex flex-col h-full bg-white rounded-xl border border-black/[0.07] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_6px_14px_rgba(0,0,0,0.07),0_18px_38px_rgba(0,0,0,0.09)] hover:-translate-y-[5px] focus-visible:ring-2 focus-visible:ring-brand-400"
			aria-label={`Voir le détail : ${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${priceLabel}`}
		>
			{/* ── Image ──────────────────────────────────────────────────────────────
			    Mobile (< sm) : aspect-[3/2] — ratio compact, lisible en 2-col
			    Desktop (sm+) : aspect-[4/3] — format original inchangé             */}
			<div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden bg-slate-200">
				{imgSrc ? (
					<VehiclePhotoImage
						src={imgSrc}
						alt={imgAlt}
						fill
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
						priority={priority}
						quality={75}
						className={`transition-all duration-500 ${vehicle.status === "sold" ? "grayscale" : "group-hover:scale-105"}`}
					/>
				) : marketingBadge?.variant === "arrivage" ? (
					<Image
						src="/images/arrivage.webp"
						alt="Véhicule en cours d'arrivage — Garage Mendonça"
						fill
						className="object-cover"
					/>
				) : (
					<Image
						src="/images/logo-gm.webp"
						alt="Garage Mendonça"
						fill
						className="object-contain p-6 bg-[#0d1b34]"
					/>
				)}

				{/* Vendu — mobile : bandeau discret en bas / desktop : overlay complet */}
				{vehicle.status === "sold" && (
					<>
						<div className="sm:hidden absolute bottom-0 inset-x-0 bg-slate-800/80 text-white text-[10px] font-medium text-center py-0.5 tracking-widest uppercase">
							Vendue
						</div>
						<div className="hidden sm:flex absolute inset-0 bg-[#0f172a]/55 items-center justify-center" aria-hidden="true">
							<span className="bg-red-700 text-white font-heading font-normal text-sm px-4 py-1.5 rounded-xl tracking-widest rotate-[-8deg] shadow-lg select-none uppercase">
								Vendue
							</span>
						</div>
					</>
				)}

				{/* À la une — compact sur mobile */}
				{vehicle.featured && vehicle.status !== "sold" && (
					<div className="absolute top-1.5 left-1.5">
						<span className="inline-flex items-center gap-0.5 sm:gap-1 bg-brand-600/90 backdrop-blur-sm text-white text-[9px] sm:text-[11px] font-medium tracking-wide px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm ring-1 ring-white/20">
							<Star size={8} className="fill-current" aria-hidden="true" />
							À la une
						</span>
					</div>
				)}

				{marketingBadge && (
					<div className="absolute bottom-2 left-2 right-2">
						<span className={`inline-flex items-center gap-1.5 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-lg shadow-md w-full justify-center ${
							marketingBadge.variant === "arrivage" ? "bg-brand-600/90" : "bg-slate-700/90"
						}`}>
							{marketingBadge.label}
						</span>
					</div>
				)}
			</div>

			{/* ── Contenu ─────────────────────────────────────────────────────────── */}
			<div className="flex flex-col flex-grow">

				{/* ══ MOBILE (< sm) : marque/modèle → finition → badge boîte → prix → année·km ══
				    Structure strictement identique sur toutes les annonces.            */}
				<div className="sm:hidden flex flex-col gap-0.5 px-2.5 pt-2.5 pb-2">
					{/* Ligne 1 : [Marque Modèle] — titre seul, sans badge */}
					<p className="text-[12px] font-semibold text-[#0f172a] leading-tight truncate">
						{vehicle.brand} {cleanModelText(vehicle.model, finition)}
					</p>
					{/* Ligne 2 : Finition — même taille/graisse que le titre, rouge bordeaux */}
					{finition && (
						<p className="text-[12px] font-semibold text-brand-600 leading-tight truncate">
							{finition}
						</p>
					)}
					{/* Ligne 3 : Badge transmission — "Boîte auto" si automatique.
					    Si manuelle : span invisible pour préserver la hauteur de ligne
					    et garantir l'alignement du prix dans la grille.              */}
					<span
						className={`self-start whitespace-nowrap text-[9px] font-semibold rounded-full px-1.5 py-0.5 leading-none ${
							vehicle.transmission === "Automatique"
								? "text-[#e11d48] bg-[#fff1f2] border border-[#fecdd3]"
								: "invisible"
						}`}
						aria-label={vehicle.transmission === "Automatique" ? "Boîte automatique" : undefined}
						aria-hidden={vehicle.transmission !== "Automatique" ? true : undefined}
					>
						Boîte auto
					</span>
					{/* Ligne 4 : Prix */}
					<span className="font-bold text-[#0f172a] text-sm leading-tight" aria-label={priceLabel}>
						{vehicle.price.toLocaleString("fr-FR")} €
					</span>
					{/* Ligne 5 : Année · km */}
					<p className="text-[10px] text-[#94a3b8] leading-tight">
						{vehicle.year} · {vehicle.mileage.toLocaleString("fr-FR")} km
					</p>
				</div>

				{/* ══ DESKTOP (sm+) : layout original inchangé ════════════════════ */}
				<div className="hidden sm:flex sm:flex-col sm:flex-grow p-3">

					{/* Marque + modèle + finition */}
					<div className="flex items-start gap-2 mb-2">
						<div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
							<Image
								src={getLogoSrc(vehicle.brand)}
								alt=""
								aria-hidden
								width={24}
								height={24}
								className="object-contain w-full h-full"
							/>
						</div>
						<div className="min-w-0 overflow-hidden">
							{/* Titre : "[Marque] [Modèle]" nettoyé + finition en rouge bordeaux
							    même taille (text-sm) et graisse (font-medium) que le titre */}
							<h3 className="ty-subheading text-sm font-medium leading-tight line-clamp-2">
								<span className="text-[#0f172a]">
									{vehicle.brand} {cleanModelText(vehicle.model, finition)}
								</span>
								{finition && (
									<span className="text-brand-600 ml-1">
										{finition}
									</span>
								)}
							</h3>
							{/* Couleur — sous-titre discret gris, comme "Gris Anthracite" */}
							{colorLabel && (
								<p className="text-[#64748b] text-[11px] mt-0.5 truncate">{colorLabel}</p>
							)}
						</div>
					</div>

					{/* Specs */}
					<div className="grid grid-cols-3 gap-1.5 mb-2">
						<div className="flex flex-col items-center bg-[#f8fafc] rounded-lg py-1.5 px-1">
							<Calendar size={12} className="text-brand-500 mb-0.5" aria-hidden="true" />
							<span className="text-xs font-normal text-[#334155]">{vehicle.year}</span>
						</div>
						<div className="flex flex-col items-center bg-[#f8fafc] rounded-lg py-1.5 px-1">
							<Gauge size={12} className="text-brand-500 mb-0.5" aria-hidden="true" />
							<span className="text-xs font-normal text-[#334155] truncate w-full text-center">
								{vehicle.mileage.toLocaleString("fr-FR")} km
							</span>
						</div>
						<div className="flex flex-col items-center bg-[#f8fafc] rounded-lg py-1.5 px-1">
							<Fuel size={12} className="text-brand-500 mb-0.5" aria-hidden="true" />
							<span className="text-xs font-normal text-[#334155] truncate w-full text-center">
								{vehicle.fuel}
							</span>
						</div>
					</div>

					{/* Badges boîte + garantie (puissance retirée — déjà dans le titre) */}
					<div className="flex items-center gap-1.5 mb-2">
						{/* Transmission — texte adaptatif selon breakpoint, jamais "BVA"/"BVM" */}
						<Badge variant="gray" className="flex-1 justify-center normal-case whitespace-nowrap">
							{vehicle.transmission === "Automatique" ? (
								<>
									<span className="md:hidden">Auto</span>
									<span className="hidden md:inline lg:hidden">Boîte auto</span>
									<span className="hidden lg:inline">Boîte automatique</span>
								</>
							) : (
								<>
									<span className="lg:hidden">Manuelle</span>
									<span className="hidden lg:inline">Boîte manuelle</span>
								</>
							)}
						</Badge>
						{garantie && (
							<span className="flex-1 text-center text-[11px] px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full font-medium leading-5 whitespace-nowrap">
								Garantie {garantie}
							</span>
						)}
					</div>

					{/* Options highlights */}
					<div className="flex flex-wrap gap-1 flex-grow content-start" aria-label="Équipements principaux">
						{optionHits.length > 0 && (() => {
							const shown = optionHits.slice(0, 4);
							const rest  = optionHits.length - shown.length;
							return (
								<>
									{shown.map((k) => (
										<span key={k} className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md font-medium leading-5">
											{HIGHLIGHT_LABELS[k]}
										</span>
									))}
									{rest > 0 && (
										<span className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-md leading-5">
											+{rest}
										</span>
									)}
								</>
							);
						})()}
					</div>

					{/* Prix + CTA */}
					<div className="mt-auto pt-2 border-t border-slate-100 space-y-2">
						<span
							className="block text-left font-heading font-semibold text-[#0f172a] text-lg leading-tight"
							aria-label={priceLabel}
						>
							{vehicle.price.toLocaleString("fr-FR")} €
						</span>
						{vehicle.status === "sold" ? (
							<div className="w-full bg-slate-200 text-slate-500 font-normal text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-default">
								Vendue
							</div>
						) : (
							<div className="flex w-full bg-brand-500/90 group-hover:bg-brand-600/95 text-white font-medium text-sm py-2.5 rounded-lg items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-300">
								Voir le véhicule
								<ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
