import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { getActiveGarageId } from "@/lib/config/garage";

const GARAGE_ID = getActiveGarageId();

const guarantees = [
	"Garantie 6 à 12 mois km illimités",
	"Vérification en 160 points",
	"250–500 km parcourus avant vente",
	"Révision boîte automatique incluse",
];

export default async function FeaturedVehicles() {
	const [featured, totalCount] = await Promise.all([
		vehicleDb.getFeatured(GARAGE_ID, 4).catch(() => []),
		vehicleDb.countPublic(GARAGE_ID).catch(() => 0),
	]);

	const displayed = featured.length > 0
		? featured
		: await vehicleDb.listPaginated(GARAGE_ID, 1, 4).catch(() => []);

	if (displayed.length === 0) {
		return (
			<section className="py-16 sm:py-24 lg:py-28 bg-white">
				<Container>
					<div className="flex flex-col items-center justify-center text-center gap-6 py-12 sm:py-20 max-w-lg mx-auto">
						<div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
							<ShieldCheck size={24} className="text-brand-500" />
						</div>
						<div>
							<h2 className="section-title text-xl sm:text-2xl mb-3">
								Nouvelles annonces bientôt disponibles
							</h2>
							<p className="text-[#64748b] text-sm sm:text-base leading-relaxed">
								Notre stock se renouvelle régulièrement. Contactez-nous directement pour connaître les véhicules disponibles ou à venir.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row items-center gap-3">
							<Link
								href="/contact"
								className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2 group"
							>
								Nous contacter
								<ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
							</Link>
							<a
								href="tel:0532002038"
								className="btn-secondary text-sm py-2.5 px-6 inline-flex items-center gap-2"
							>
								05 32 00 20 38
							</a>
						</div>
					</div>
				</Container>
			</section>
		);
	}

	return (
		<section className="py-16 sm:py-24 lg:py-28 bg-white">
			<Container>
				{/* ── Header ── */}
				<AnimateOnScroll>
					<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-5 sm:mb-10 lg:mb-14">
						<div className="flex-1">
							<div className="section-divider" />
							<span className="eyebrow">Derniers arrivages</span>
							{/* Titre + CTA "Voir tout" alignés sur mobile */}
							<div className="flex items-center justify-between gap-4">
								<h2 className="section-title text-2xl sm:text-3xl md:text-4xl">
									Nos dernières occasions
								</h2>
								<Link
									href="/vehicules"
									className="sm:hidden flex-shrink-0 inline-flex items-center gap-1 text-brand-600 text-sm font-medium whitespace-nowrap"
									aria-label={`Voir les ${totalCount} véhicules disponibles`}
								>
									Voir tout
									<ArrowRight size={14} aria-hidden="true" />
								</Link>
							</div>
							{/* Sous-titre masqué sur mobile — le titre seul suffit */}
							<p className="hidden sm:block section-subtitle mt-3 max-w-lg text-sm sm:text-base leading-relaxed">
								Fraîchement entrées en stock, révisées et
								garanties 6 à 12 mois, kilométrage illimité.
								Boîte automatique, prêtes à prendre la route.
							</p>
						</div>
					</div>
				</AnimateOnScroll>

				{/* ── Mobile : Carousel horizontal scroll-snap ── */}
				<div
					className="sm:hidden -mx-4 overflow-x-auto flex gap-3 px-4 pb-4 mb-6
					           [scroll-snap-type:x_mandatory]
					           [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					role="list"
					aria-label="Véhicules à la une"
				>
					{displayed.map((vehicle, i) => (
						<div
							key={vehicle.id}
							role="listitem"
							className="flex-shrink-0 w-[78vw] [scroll-snap-align:start]"
						>
							<VehicleCard vehicle={vehicle} priority={i === 0} />
						</div>
					))}
				</div>

				{/* ── Desktop : Grille ── */}
				<div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
					{displayed.map((vehicle, i) =>
						i === 0 ? (
							<VehicleCard key={vehicle.id} vehicle={vehicle} priority />
						) : (
							<AnimateOnScroll key={vehicle.id} delay={i * 80}>
								<VehicleCard vehicle={vehicle} />
							</AnimateOnScroll>
						)
					)}
				</div>

				{/* ── Bannière garanties ── */}
				<AnimateOnScroll delay={150}>
					<div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-4 sm:p-6">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
							<div className="flex items-start gap-2 sm:gap-3">
								<ShieldCheck
									size={18}
									className="text-brand-500 mt-0.5 flex-shrink-0"
								/>
								<div>
									<p className="text-[#0f172a] font-normal text-sm sm:text-base mb-1">
										Tous nos véhicules sont contrôlés,
										révisés et garantis
									</p>
									<div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-x-5">
										{guarantees.map((g) => (
											<span
												key={g}
												className="font-light text-[#64748b] text-xs sm:text-sm flex items-center gap-1"
											>
												<span
													className="w-1 h-1 bg-brand-500/70 rounded-full"
													aria-hidden="true"
												/>
												{g}
											</span>
										))}
									</div>
								</div>
							</div>

							<Link
								href="/vehicules"
								className="btn-primary text-sm sm:text-base py-2.5 sm:py-3 flex-shrink-0 inline-flex items-center gap-2 group"
								aria-label="Voir tous les véhicules disponibles"
							>
								Voir tous nos véhicules ({totalCount})
								<ArrowRight
									size={14}
									className="transition-transform group-hover:translate-x-1"
								/>
							</Link>
						</div>
					</div>
				</AnimateOnScroll>
			</Container>
		</section>
	);
}
