import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import { serviceRepository, garageRepository } from "@/lib/repositories";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";
import ServiceSection from "@/components/services/ServiceSection";

export const metadata: Metadata = {
	title: "Nos Services",
	description:
		"Entretien, réparation mécanique et carrosserie depuis 2001 à Drémil-Lafage. Spécialiste japonaises et boîtes automatiques. Devis gratuit.",
};

export default async function ServicesPage() {
	const [allServices, garage] = await Promise.all([
		serviceRepository.getByGarageId(ACTIVE_GARAGE_ID),
		garageRepository.getById(ACTIVE_GARAGE_ID),
	]);

	const activeServices = allServices.filter((s) => s.is_active);
	const phone = garage?.phone ?? "05 32 00 20 38";

	return (
		<MainLayout>
			{/* ── Hero page ── */}
			<section className="relative bg-dark-900 overflow-hidden pt-36 pb-20">
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none" />
				<Container className="relative">
					<div className="inline-flex items-center gap-2 mt-8 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-5">
						<span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
						<span className="text-brand-500 text-xs font-medium tracking-wide uppercase">
							Nos expertises
						</span>
					</div>
					<h1 className="ty-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
						Mécanique, carrosserie &amp; vente
						<br />
						<span className="text-brand-400">
							depuis 2001 à Drémil-Lafage
						</span>
					</h1>
					<p className="text-dark-300 text-base sm:text-lg leading-relaxed max-w-2xl">
						Mécaniciens qualifiés et continuellement formés,
						équipements dernière génération. Diagnostic en 10
						minutes, devis avant toute intervention.
					</p>
				</Container>
			</section>

			{/* ── Services ── */}
			<section className="bg-slate-50">
				<Container>
					{activeServices.map((service, index) => (
						<div key={service.id}>
							<ServiceSection service={service} phone={phone} />
							{/* Séparateur entre services */}
							{index < activeServices.length - 1 && (
								<div
									className="border-b border-slate-200"
									aria-hidden="true"
								/>
							)}
						</div>
					))}
				</Container>
			</section>
		</MainLayout>
	);
}
