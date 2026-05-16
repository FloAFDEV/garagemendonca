import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import GmBadge from "@/components/ui/GmBadge";
import { serviceRepository, garageRepository } from "@/lib/repositories";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";
import ServiceSection from "@/components/services/ServiceSection";

export const metadata: Metadata = {
	title: "Nos Services",
	description:
		"Entretien, réparation mécanique et carrosserie depuis 2001 à Drémil-Lafage. Spécialiste japonaises et boîtes automatiques. Devis gratuit.",
	alternates: {
		canonical: "https://www.garagemendonca.com/services",
	},
	openGraph: {
		title: "Nos Services — Garage Auto Mendonca · Drémil-Lafage",
		description:
			"Entretien, mécanique, carrosserie depuis 2001. Spécialiste boîtes automatiques et véhicules japonais. Devis gratuit.",
		type: "website",
		locale: "fr_FR",
		url: "https://www.garagemendonca.com/services",
		siteName: "Garage Auto Mendonca",
		images: [{ url: "/images/og-image.webp", width: 1200, height: 630, alt: "Services Garage Auto Mendonca" }],
	},
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
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none" aria-hidden="true" />
				<Container className="relative">
					<div className="flex items-start justify-between gap-6">
						<div className="flex-1 min-w-0">
							<div className="inline-flex items-center gap-2 mt-8 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-5">
								<span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
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
						</div>
						<GmBadge size="lg" className="mt-8 hidden sm:block opacity-90" />
					</div>
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
