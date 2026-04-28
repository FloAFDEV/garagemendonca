import Link from "next/link";
import Image from "next/image";
import { Fuel, Gauge, Calendar, ArrowRight, Star } from "lucide-react";
import { Vehicle } from "@/types";
import type { VehicleOptions } from "@/types";
import Badge from "@/components/ui/Badge";
import { BRAND_LOGO_MAP } from "@/lib/brandLogos";

/* ── Options highlights ──────────────────────────────────────────────────────
 * Options les plus "vendantes" à afficher sur la carte, par ordre de priorité.
 * Max 4 affichées + badge "+N" si davantage. */
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
	const altText = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.color} — ${vehicle.mileage.toLocaleString("fr-FR")} km`;
	const priceLabel = `${vehicle.price.toLocaleString("fr-FR")} euros`;

	// Priorité : thumbnailUrl > first vehicleImage > first images[] URL
	const imgSrc = vehicle.thumbnailUrl
		?? vehicle.vehicleImages?.[0]?.url
		?? vehicle.images?.[0];
	const imgAlt = vehicle.vehicleImages?.[0]?.alt ?? altText;

	// Lien : slug SEO si disponible, UUID en fallback
	const href = `/vehicules/${vehicle.slug ?? vehicle.id}`;

	return (
		<Link
			href={href}
			className="group flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-400"
			aria-label={`Voir le détail : ${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${priceLabel}`}
		>
			{/* Image */}
			<div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
				<Image
					src={imgSrc}
					alt={imgAlt}
					fill
					priority={priority}
					className={`object-cover transition-transform duration-500 ${vehicle.status === "sold" ? "grayscale" : "group-hover:scale-105"}`}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
				/>

				{/* Overlay Vendu */}
				{vehicle.status === "sold" && (
					<div
						className="absolute inset-0 bg-[#0f172a]/55 flex items-center justify-center"
						aria-hidden="true"
					>
						<span className="bg-red-700 text-white font-heading font-normal text-base px-5 py-2 rounded-xl tracking-widest rotate-[-8deg] shadow-lg select-none uppercase">
							Vendue
						</span>
					</div>
				)}

				{/* Prix overlay */}
				<div
					className="absolute top-2.5 right-2.5 bg-[#0f172a]/90 backdrop-blur-sm text-white font-heading font-medium text-sm px-2.5 py-1 rounded-lg"
					aria-hidden="true"
				>
					{vehicle.price.toLocaleString("fr-FR")} €
				</div>
				{vehicle.featured && vehicle.status !== "sold" && (
					<div className="absolute top-2.5 left-2.5">
						<Badge variant="gray">
							<Star
								size={10}
								className="fill-current"
								aria-hidden="true"
							/>
							À la une
						</Badge>
					</div>
				)}
			</div>

			{/* Contenu */}
			<div className="p-4 flex flex-col flex-grow">
				<div className="flex items-start gap-2.5 mb-3">
					{BRAND_LOGO_MAP[vehicle.brand] && (
						<div className="w-9 h-9 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-1">
							<Image
								src={BRAND_LOGO_MAP[vehicle.brand]}
								alt=""
								aria-hidden
								width={28}
								height={28}
								className="object-contain w-full h-full"
							/>
						</div>
					)}
					<div className="min-w-0">
						<h3 className="ty-subheading text-[#0f172a] text-base leading-tight">
							{vehicle.brand} {vehicle.model}
						</h3>
						<p className="text-[#64748b] text-xs mt-0.5">
							{vehicle.color} · {vehicle.year}
						</p>
					</div>
				</div>

				{/* Specs */}
				<div className="grid grid-cols-3 gap-2 mb-3">
					<div className="flex flex-col items-center bg-[#f8fafc] rounded-lg py-2 px-1">
						<Calendar
							size={13}
							className="text-brand-500 mb-0.5"
							aria-hidden="true"
						/>
						<span className="text-xs font-normal text-[#334155]">
							{vehicle.year}
						</span>
					</div>
					<div className="flex flex-col items-center bg-[#f8fafc] rounded-lg py-2 px-1">
						<Gauge
							size={13}
							className="text-brand-500 mb-0.5"
							aria-hidden="true"
						/>
						<span className="text-xs font-normal text-[#334155] truncate w-full text-center">
							{vehicle.mileage.toLocaleString("fr-FR")} km
						</span>
					</div>
					<div className="flex flex-col items-center bg-[#f8fafc] rounded-lg py-2 px-1">
						<Fuel
							size={13}
							className="text-brand-500 mb-0.5"
							aria-hidden="true"
						/>
						<span className="text-xs font-normal text-[#334155] truncate w-full text-center">
							{vehicle.fuel}
						</span>
					</div>
				</div>

				{/* Badges */}
				<div className="flex items-center gap-1.5 flex-wrap mb-3">
					<Badge variant={fuelVariants[vehicle.fuel] ?? "gray"}>
						{vehicle.fuel}
					</Badge>
					<Badge variant="gray">{vehicle.transmission}</Badge>
					<Badge variant="gray">{vehicle.power} ch</Badge>
				</div>

				{/* Options highlights */}
			<div className="flex flex-wrap gap-1 flex-grow content-start" aria-label="Équipements principaux">
				{vehicle.options && (() => {
					const hits = HIGHLIGHT_KEYS.filter(
						(k) => vehicle.options![k] === true,
					);
					if (hits.length === 0) return null;
					const shown = hits.slice(0, 4);
					const rest  = hits.length - shown.length;
					return (
						<>
							{shown.map((k) => (
								<span
									key={k}
									className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md font-medium leading-5"
								>
									{HIGHLIGHT_LABELS[k]}
								</span>
							))}
							{rest > 0 && (
								<span className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-md leading-5">
									+{rest}
								</span>
							)}
						</>
					);
				})()}
			</div>

			{/* Prix + CTA */}
				<div className="mt-auto pt-3 border-t border-slate-100 space-y-2.5">
					<span
						className="block ty-value font-heading text-lg"
						aria-label={priceLabel}
					>
						{vehicle.price.toLocaleString("fr-FR")} €
					</span>
					{vehicle.status === "sold" ? (
						<div className="w-full bg-slate-200 text-slate-500 font-normal text-sm py-3 rounded-lg flex items-center justify-center gap-2 cursor-default">
							Vendue
						</div>
					) : (
						<div className="w-full bg-brand-500/90 group-hover:bg-brand-600/95 text-white font-semibold text-sm py-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 transform-gpu hover:-translate-y-0.5 hover:scale-105">
							Voir le véhicule
							<ArrowRight
								size={14}
								className="group-hover:translate-x-1 transition-transform duration-300"
							/>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
