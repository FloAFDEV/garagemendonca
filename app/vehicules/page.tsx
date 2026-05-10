// Toujours rendu dynamiquement → voit immédiatement les véhicules ajoutés en admin
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehiclesCatalogue from "@/components/vehicles/VehiclesCatalogue";
import { vehicleRepository } from "@/lib/repositories";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { buildPaginationMeta, listingDescription } from "@/lib/vehicles/pagination";
import Link from "next/link";
import { ClipboardCheck, Wrench, BookOpen, ShieldCheck, ChevronRight } from "lucide-react";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export async function generateMetadata(): Promise<Metadata> {
	const totalCount = await vehicleDb.countPublic(GARAGE_ID).catch(() => 0);
	const desc = listingDescription(1, totalCount);
	return {
		title: "Véhicules d'occasion révisés & garantis | Garage Mendonça",
		description: desc,
		alternates: { canonical: "https://www.garagemendonca.com/vehicules" },
		openGraph: {
			title: "Occasions révisées & garanties — Garage Mendonça, Drémil-Lafage",
			description: desc,
			type: "website",
		},
		twitter: { card: "summary_large_image", title: "Voitures d'occasion — Garage Mendonça", description: desc },
	};
}

export default async function VehiculesPage() {
	const vehicles = await vehicleRepository.getAll(GARAGE_ID || undefined).catch((err) => {
		console.error("[VehiculesPage] fetch vehicles failed:", err);
		return [];
	});

	const totalCount = await vehicleDb.countPublic(GARAGE_ID).catch(() => vehicles.length);
	const meta = buildPaginationMeta(1, totalCount);

	const allBrands = Array.from(new Set(vehicles.map((v) => v.brand))).sort();
	const allFuels = Array.from(new Set(vehicles.map((v) => v.fuel)));

	return (
		<MainLayout>
			{/* ── Hero ── */}
			<section className="bg-[#0f172a] pt-36 pb-20 relative overflow-hidden">
				<div
					className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"
					aria-hidden="true"
				/>
				<Container className="relative">
					<div className="max-w-3xl">
						<div className="flex items-center gap-3 mb-5">
							<div
								className="w-8 h-px bg-brand-500"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-normal text-xs uppercase tracking-caps">
								Notre stock · {totalCount} véhicule{totalCount > 1 ? "s" : ""}
							</span>
						</div>
						<h1 className="ty-display text-white text-5xl md:text-6xl mb-6">
							Véhicules d&apos;occasion{" "}
							<span className="text-brand-500">
								révisés &amp; garantis
							</span>
						</h1>
						<p className="text-slate-300 text-xl leading-relaxed max-w-2xl">
							Chaque véhicule est inspecté en 160 points, révisé
							et garanti 6 à 12 mois kilométrage illimité.
							Financement et reprise étudiés ensemble.
						</p>
					</div>
				</Container>
			</section>

			{/* ── Catalogue ── */}
			<section className="py-12 bg-[#f8fafc]">
				<Container>
					<VehiclesCatalogue
						vehicles={vehicles}
						allBrands={allBrands}
						allFuels={allFuels}
					/>

					{/* Lien vers les pages paginées SEO */}
					{meta.totalPages > 1 && (
						<div className="mt-10 flex flex-wrap gap-2 justify-center">
							<p className="w-full text-center text-sm text-slate-500 mb-2">
								Parcourir le catalogue page par page :
							</p>
							{Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
								<Link
									key={p}
									href={`/vehicules/page/${p}`}
									className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
								>
									{p}
								</Link>
							))}
							<Link
								href="/vehicules/page/2"
								className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-brand-600 border border-brand-200 hover:bg-brand-50 transition-colors ml-2"
							>
								Page suivante <ChevronRight size={14} />
							</Link>
						</div>
					)}
				</Container>
			</section>

			{/* ── Bannière garanties ── */}
			<section className="py-12 bg-white border-t border-slate-200">
				<Container>
					<div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 text-center">
						{[
							{
								Icon: ClipboardCheck,
								label: "Contrôle technique récent",
							},
							{
								Icon: Wrench,
								label: "Révision complète effectuée",
							},
							{
								Icon: BookOpen,
								label: "Carnet d'entretien vérifié",
							},
							{
								Icon: ShieldCheck,
								label: "Garantie 6 à 12 mois km illimités",
							},
						].map(({ Icon, label }) => (
							<div
								key={label}
								className="flex items-center gap-3"
							>
								<div
									className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0"
									aria-hidden="true"
								>
									<Icon
										size={17}
										className="text-brand-500"
										strokeWidth={1.75}
										aria-hidden="true"
									/>
								</div>
								<span className="font-normal text-[#0f172a] text-sm">
									{label}
								</span>
							</div>
						))}
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
