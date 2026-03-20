import type { Metadata } from "next";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import { vehicles } from "@/lib/data";
import VehicleCard from "@/components/vehicles/VehicleCard";
import {
	Car,
	ShieldCheck,
	Wrench,
	FileCheck2,
	BadgeCheck,
	Phone,
	ArrowRight,
	Star,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Véhicules d'occasion — Garage Mendonça",
	description:
		"Découvrez nos véhicules d'occasion soigneusement sélectionnés, révisés et garantis. Toutes marques, financement disponible. Garage Mendonça à Drémil-Lafage.",
};

const guarantees = [
	{
		Icon: ShieldCheck,
		title: "Garantie incluse",
		desc: "6 à 12 mois kilométrage illimité sur chaque véhicule.",
	},
	{
		Icon: Wrench,
		title: "Révision complète",
		desc: "Chaque véhicule est entièrement révisé avant mise en vente.",
	},
	{
		Icon: FileCheck2,
		title: "Carnet d'entretien",
		desc: "Historique d'entretien vérifié et transparent.",
	},
	{
		Icon: BadgeCheck,
		title: "160 points de contrôle",
		desc: "Inspection technique rigoureuse à chaque entrée en stock.",
	},
];

const featured = vehicles.filter((v) => v.featured).slice(0, 3);
const rest = vehicles.filter((v) => !v.featured).slice(0, 3);

export default function ProduitPage() {
	return (
		<MainLayout>
			{/* ── Hero ── */}
			<section className="relative bg-[#0f172a] pt-36 pb-24 overflow-hidden">
				<div
					className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl pointer-events-none"
					aria-hidden="true"
				/>
				<Container className="relative">
					<div className="max-w-3xl">
						<div className="flex items-center gap-3 mb-6">
							<div
								className="w-8 h-px bg-brand-500"
								aria-hidden="true"
							/>
							<span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
								Nos véhicules d'occasion
							</span>
						</div>
						<h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-[1.06]">
							Occasion de qualité,{" "}
							<span className="text-brand-500">
								garantie incluse
							</span>
						</h1>
						<p className="text-slate-300 text-xl leading-relaxed max-w-2xl mb-10">
							Chaque véhicule de notre stock est inspecté selon
							160 points de contrôle, révisé par nos mécaniciens
							et garanti. Financement et reprise étudiés ensemble.
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<Link
								href="/vehicules"
								className="btn-primary text-base py-4 px-8"
							>
								<Car size={18} />
								Voir tout le stock
							</Link>
							<a
								href="tel:0532002038"
								className="btn-outline text-base py-4 px-8"
							>
								<Phone size={18} />
								Appeler le garage
							</a>
						</div>
					</div>
				</Container>
			</section>

			{/* ── Garanties ── */}
			<section className="py-16 bg-white border-b border-slate-200">
				<Container>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{guarantees.map(({ Icon, title, desc }) => (
							<div key={title} className="text-center">
								<div
									className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4"
									aria-hidden="true"
								>
									<Icon
										className="h-5 w-5 text-brand-500"
										strokeWidth={1.75}
									/>
								</div>
								<h3 className="font-heading font-bold text-[#0f172a] text-sm mb-1">
									{title}
								</h3>
								<p className="text-[#475569] text-xs leading-relaxed">
									{desc}
								</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── Véhicules à la une ── */}
			{featured.length > 0 && (
				<section className="py-20 bg-[#f8fafc]">
					<Container>
						<div className="flex items-end justify-between mb-10">
							<div>
								<div className="section-divider" />
								<span className="eyebrow">
									Sélection du moment
								</span>
								<h2 className="section-title">
									Véhicules{" "}
									<span className="text-brand-500">
										à la une
									</span>
								</h2>
							</div>
							<Link
								href="/vehicules"
								className="hidden sm:inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors group"
							>
								Tout voir
								<ArrowRight
									size={14}
									className="group-hover:translate-x-1 transition-transform"
								/>
							</Link>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{featured.map((vehicle) => (
								<VehicleCard
									key={vehicle.id}
									vehicle={vehicle}
								/>
							))}
						</div>
					</Container>
				</section>
			)}

			{/* ── Autres véhicules ── */}
			{rest.length > 0 && (
				<section className="py-20 bg-white">
					<Container>
						<div className="flex items-end justify-between mb-10">
							<div>
								<div className="section-divider" />
								<span className="eyebrow">
									Disponibles maintenant
								</span>
								<h2 className="section-title">
									Autres véhicules
								</h2>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
							{rest.map((vehicle) => (
								<VehicleCard
									key={vehicle.id}
									vehicle={vehicle}
								/>
							))}
						</div>

						<div className="text-center">
							<Link
								href="/vehicules"
								className="btn-primary text-base px-10 py-4"
							>
								<Car size={18} />
								Voir tous les véhicules ({vehicles.length}{" "}
								disponibles)
							</Link>
						</div>
					</Container>
				</section>
			)}

			{/* ── Chiffres clés ── */}
			<section className="py-16 bg-[#f8fafc] border-t border-slate-200">
				<Container>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto">
						{[
							{ value: "30+", label: "Ans d'expérience" },
							{ value: "+1 200", label: "Véhicules vendus" },
							{ value: "98%", label: "Clients satisfaits" },
							{ value: "9", label: "Véhicules de prêt" },
						].map(({ value, label }) => (
							<div key={label}>
								<div className="font-heading font-black text-4xl text-brand-500 mb-1">
									{value}
								</div>
								<div className="text-[#475569] text-sm">
									{label}
								</div>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── Avis clients ── */}
			<section className="py-16 bg-white">
				<Container>
					<div className="max-w-2xl mx-auto text-center mb-10">
						<div className="section-divider mx-auto" />
						<span className="eyebrow">Ils nous font confiance</span>
						<h2 className="section-title">
							Ce que disent nos clients
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						{[
							{
								name: "Thomas R.",
								note: "Achat d'une Volkswagen Golf. Véhicule impeccable, révision faite, garantie 12 mois. Je recommande vivement !",
							},
							{
								name: "Marie-Claire D.",
								note: "Service au top, transparent sur les prix. La voiture était comme neuve. Merci à toute l'équipe !",
							},
							{
								name: "Karim B.",
								note: "Troisième véhicule acheté ici. Toujours aussi sérieux. Financement rapide et sans surprise.",
							},
						].map(({ name, note }) => (
							<div
								key={name}
								className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6 shadow-sm"
							>
								<div
									className="flex gap-0.5 mb-3"
									aria-label="5 étoiles sur 5"
								>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											size={14}
											className="text-brand-500 fill-brand-500"
											aria-hidden="true"
										/>
									))}
								</div>
								<p className="text-[#475569] text-sm leading-relaxed mb-4">
									"{note}"
								</p>
								<p className="font-heading font-bold text-[#0f172a] text-sm">
									{name}
								</p>
							</div>
						))}
					</div>
				</Container>
			</section>

			{/* ── CTA final ── */}
			<section className="py-16 bg-[#0f172a] relative">
				<div
					className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600"
					aria-hidden="true"
				/>
				<Container className="text-center">
					<h2 className="font-heading font-black text-white text-3xl md:text-4xl mb-4">
						Un véhicule vous intéresse ?
					</h2>
					<p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
						Contactez-nous pour un essai, un financement ou une
						reprise. Réponse sous 24h.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a
							href="tel:0532002038"
							className="btn-primary text-base py-4 px-8"
						>
							<Phone size={18} />
							05 32 00 20 38
						</a>
						<Link
							href="/contact"
							className="btn-outline text-base py-4 px-8"
						>
							Demander des infos
							<ArrowRight size={17} />
						</Link>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
