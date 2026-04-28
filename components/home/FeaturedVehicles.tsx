import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";
import { vehicleRepository } from "@/lib/repositories/vehicleRepository";
import { DEMO_MODE } from "@/lib/supabase/readClient";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

const guarantees = [
	"Garantie 6 à 12 mois km illimités",
	"Vérification en 160 points",
	"250–500 km parcourus avant vente",
	"Révision boîte automatique incluse",
];

export default async function FeaturedVehicles() {
	const allFeatured = await vehicleRepository.getFeatured(4, GARAGE_ID || undefined).catch(() => []);

	const displayed = allFeatured.length > 0
		? allFeatured
		: await vehicleRepository.getAll(GARAGE_ID || undefined).catch(() => []).then((vs) =>
				[...vs].sort((a, b) =>
					(b.createdAt || "1900-01-01").localeCompare(a.createdAt || "1900-01-01"),
				).slice(0, 4),
		  );

	const totalCount = await vehicleRepository.getAll(GARAGE_ID || undefined).catch(() => []).then((vs) => vs.length);

	if (displayed.length === 0 && !DEMO_MODE) {
		return null;
	}

	return (
		<section className="py-20 sm:py-28 bg-white">
			<Container>
				{/* ── Header ── */}
				<AnimateOnScroll>
					<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 sm:mb-14">
						<div>
							<div className="section-divider" />
							<span className="eyebrow">Derniers arrivages</span>
							<h2 className="section-title text-2xl sm:text-3xl md:text-4xl">
								Nos dernières occasions
							</h2>
							<p className="section-subtitle mt-2 sm:mt-3 max-w-full sm:max-w-lg text-sm sm:text-base leading-relaxed">
								Fraîchement entrées en stock, révisées et
								garanties 6 à 12 mois, kilométrage illimité.
								Boîte automatique, prêtes à prendre la route.
							</p>
						</div>
					</div>
				</AnimateOnScroll>

				{/* ── Grid ── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
					{displayed.map((vehicle, i) => (
						<AnimateOnScroll key={vehicle.id} delay={i * 80}>
							<VehicleCard vehicle={vehicle} priority={i === 0} />
						</AnimateOnScroll>
					))}
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
