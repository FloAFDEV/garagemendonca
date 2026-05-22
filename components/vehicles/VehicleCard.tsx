"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fuel, Gauge, Calendar, ArrowRight, Star } from "lucide-react";
import { Vehicle } from "@/types";
import type { VehicleOptions } from "@/types";
import Badge from "@/components/ui/Badge";
import { getLogoSrc } from "@/lib/brandLogos";

/* ── Options highlights ──────────────────────────────────────────────────────
 * Options les plus "vendantes", par ordre de priorité. Max 4 + badge "+N". */
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

interface VehicleCardProps {
	vehicle: Vehicle;
	priority?: boolean;
}

const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
	Essence: "orange",
	Diesel: "gray",
	Hybride: "green",
	Électrique: "green",
	GPL: "blue",
};

export default function VehicleCard({
	vehicle,
	priority = false,
}: VehicleCardProps) {
	const router = useRouter();
	const colorLabel = vehicle.color ?? "";
	const altText = `${vehicle.brand} ${vehicle.model} ${vehicle.year}${colorLabel ? ` — ${colorLabel}` : ""} — ${vehicle.mileage.toLocaleString("fr-FR")} km`;
	const priceLabel = `${vehicle.price.toLocaleString("fr-FR")} euros`;

	const imgAlt = vehicle.vehicleImages?.[0]?.alt ?? altText;
	const imgSrc = vehicle.thumbnailUrl;

	// Finition — supporte les deux conventions de clé (lowercase + capital)
	const finition =
		vehicle.features?.finition ??
		(vehicle.features as { Finition?: string } | undefined)?.Finition;

	// Lien SEO : slug + shortId, UUID en fallback
	const href = vehicle.slug
		? `/vehicules/${vehicle.slug}-${vehicle.id.slice(0, 8)}`
		: `/vehicules/${vehicle.id}`;

	return (
		<Link
			href={href}
			prefetch={false}
			onMouseEnter={() => router.prefetch(href)}
			onTouchStart={() => router.prefetch(href)}
			className="group flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand-400"
			aria-label={`Voir le détail : ${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${priceLabel}`}
		>
			{/* Image */}
			<div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
				{imgSrc ? (
					<Image
						src={imgSrc}
						alt={imgAlt}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
						className={`object-cover transition-all duration-500 ${vehicle.status === "sold" ? "grayscale" : "group-hover:scale-105"}`}
						priority={priority}
						quality={75}
					/>
				) : (
					<Image
						src="/images/logo-gm.webp"
						alt="Garage Mendonça"
						fill
						className="object-contain p-6 bg-[#0d1b34]"
					/>
				)}

				{/* Overlay Vendu */}
				{vehicle.status === "sold" && (
					<div
						className="absolute inset-0 bg-[#0f172a]/55 flex items-center justify-center"
						aria-hidden="true"
					>
						<span className="bg-red-700 text-white font-heading font-normal text-sm px-4 py-1.5 rounded-xl tracking-widest rotate-[-8deg] shadow-lg select-none uppercase">
							Vendue
						</span>
					</div>
				)}

				{/* Prix overlay */}
				<div
					className="absolute top-2 right-2 bg-[#0f172a]/90 backdrop-blur-sm text-white font-heading font-medium text-sm px-2.5 py-1 rounded-lg"
					aria-hidden="true"
				>
					{vehicle.price.toLocaleString("fr-FR")} €
				</div>

				{vehicle.featured && vehicle.status !== "sold" && (
					<div className="absolute top-2 left-2">
						<Badge variant="gray">
							<Star size={10} className="fill-current" aria-hidden="true" />
							À la une
						</Badge>
					</div>
				)}
			</div>

			{/* Contenu */}
			<div className="p-3 flex flex-col flex-grow">
				{/* Marque + modèle + finition */}
				<div className="flex items-start gap-2 mb-2">
					<div className="w-8 h-8 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-1">
						<Image
							src={getLogoSrc(vehicle.brand)}
							alt=""
							aria-hidden
							width={24}
							height={24}
							className="object-contain w-full h-full"
						/>
					</div>
					<div className="min-w-0">
						<h3 className="ty-subheading text-[#0f172a] text-sm font-medium leading-tight">
							{vehicle.brand} {vehicle.model}
							{finition && (
								<span className="text-brand-600 font-semibold ml-1 text-[12px]">
									{finition}
								</span>
							)}
						</h3>
						{colorLabel && (
							<p className="text-[#64748b] text-[11px] mt-0.5 truncate">
								{colorLabel}
							</p>
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

				{/* Badges — carburant masqué sur mobile (déjà dans la grille specs) */}
				<div className="flex items-center gap-1 flex-wrap mb-2">
					<Badge variant={fuelVariants[vehicle.fuel] ?? "gray"} className="hidden sm:inline-flex">
						{vehicle.fuel}
					</Badge>
					<Badge variant="gray">{vehicle.transmission}</Badge>
					<Badge variant="gray">{vehicle.power} ch</Badge>
				</div>

				{/* Options highlights */}
				<div className="flex flex-wrap gap-1 flex-grow content-start" aria-label="Équipements principaux">
					{vehicle.options && (() => {
						const hits = HIGHLIGHT_KEYS.filter((k) => vehicle.options![k] === true);
						if (hits.length === 0) return null;
						const shown       = hits.slice(0, 4);
						const desktopRest = hits.length - shown.length;
						const mobileRest  = hits.length - 2;
						return (
							<>
								{shown.map((k, idx) => (
									<span
										key={k}
										className={`text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md font-medium leading-5${idx >= 2 ? " hidden sm:inline-flex" : ""}`}
									>
										{HIGHLIGHT_LABELS[k]}
									</span>
								))}
								{desktopRest > 0 && (
									<span className="hidden sm:inline text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-md leading-5">
										+{desktopRest}
									</span>
								)}
								{mobileRest > 0 && (
									<span className="sm:hidden text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-md leading-5">
										+{mobileRest}
									</span>
								)}
							</>
						);
					})()}
				</div>

				{/* Prix + CTA */}
				<div className="mt-auto pt-2 border-t border-slate-100 space-y-1.5">
					<span
						className="block ty-value font-heading text-base"
						aria-label={priceLabel}
					>
						{vehicle.price.toLocaleString("fr-FR")} €
					</span>
					{vehicle.status === "sold" ? (
						<div className="w-full bg-slate-200 text-slate-500 font-normal text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-default">
							Vendue
						</div>
					) : (
						/* Masqué sur mobile : la carte entière est un lien */
						<div className="hidden sm:flex w-full bg-brand-500/90 group-hover:bg-brand-600/95 text-white font-medium text-sm py-2.5 rounded-lg items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-300">
							Voir le véhicule
							<ArrowRight
								size={13}
								className="group-hover:translate-x-0.5 transition-transform duration-300"
							/>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
