import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import GmBadge from "@/components/ui/GmBadge";
import { serviceRepository, garageRepository } from "@/lib/repositories";
import { ACTIVE_GARAGE_ID } from "@/lib/config/garage";
import ServiceSection from "@/components/services/ServiceSection";
import { FileCheck2, BadgeCheck } from "lucide-react";
import { QUALITY_CONTROL } from "@/lib/data/qualityControl";

export const metadata: Metadata = {
	title: "Nos Services",
	description:
		"Entretien, réparation mécanique et carrosserie depuis 2003 à Drémil-Lafage. Spécialiste japonaises et boîtes automatiques. Prix transparents avant toute intervention.",
	alternates: {
		canonical: "https://www.garagemendonca.com/services",
	},
	openGraph: {
		title: "Nos Services — Garage Auto Mendonca · Drémil-Lafage",
		description:
			"Entretien, mécanique, carrosserie depuis 2003. Spécialiste boîtes automatiques et véhicules japonais. Prix transparents avant toute intervention.",
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

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "AutoRepair",
		name: "Garage Auto Mendonca",
		url: "https://www.garagemendonca.com/services",
		telephone: "+33532002038",
		address: {
			"@type": "PostalAddress",
			streetAddress: "6 Avenue de la Mouyssaguese",
			addressLocality: "Drémil-Lafage",
			postalCode: "31280",
			addressCountry: "FR",
		},
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Nos services",
			itemListElement: activeServices.map((s, i) => ({
				"@type": "ListItem",
				position: i + 1,
				item: {
					"@type": "Service",
					name: s.title,
					description: s.short_description,
					provider: { "@type": "AutoRepair", name: "Garage Auto Mendonca" },
				},
			})),
		},
	};

	return (
		<MainLayout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
			/>
			{/* ── Hero page ── */}
			<section className="relative bg-dark-900 overflow-hidden pt-24 pb-14">
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
									depuis 2003 à Drémil-Lafage
								</span>
							</h1>
							<p className="text-dark-300 text-base sm:text-lg leading-relaxed max-w-2xl">
								Mécaniciens qualifiés et continuellement formés,
								équipements dernière génération. Diagnostic en 10
								minutes, tarif communiqué avant toute intervention.
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

			{/* ── Protocole Qualité 160 points ── */}
			<section
				id="protocole-qualite"
				className="py-16 bg-white border-t border-slate-100"
				aria-labelledby="qc-heading"
			>
				<Container>
					<div className="mb-10 text-center">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-4">
							<span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
							<span className="text-brand-500 text-xs font-medium tracking-wide uppercase">
								Protocole qualité
							</span>
						</div>
						<h2
							id="qc-heading"
							className="ty-heading text-2xl sm:text-3xl text-slate-900 mb-3"
						>
							{QUALITY_CONTROL.total} points de contrôle
						</h2>
						<p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
							Avant chaque mise en vente, chaque véhicule d&apos;occasion est soumis
							à un protocole d&apos;inspection en deux volets — contrôle technique
							réglementaire et charte qualité interne.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
						{/* Contrôle technique */}
						<div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
							<div className="flex items-center gap-3 mb-5">
								<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/80 border border-blue-100">
									<FileCheck2 size={17} className="text-blue-600" aria-hidden="true" />
								</div>
								<div>
									<h3 className="font-heading font-medium text-slate-900 text-sm leading-snug">
										{QUALITY_CONTROL.sections[0].title}
									</h3>
									<p className="text-slate-500 text-xs leading-snug mt-0.5">
										{QUALITY_CONTROL.sections[0].description}
									</p>
								</div>
							</div>
							<ul className="space-y-2">
								{QUALITY_CONTROL.sections[0].items.map((item) => (
									<li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-snug">
										<span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-400" aria-hidden="true" />
										{item}
									</li>
								))}
							</ul>
						</div>

						{/* Charte qualité Garage Mendonça */}
						<div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
							<div className="flex items-center gap-3 mb-5">
								<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/80 border border-brand-100">
									<BadgeCheck size={17} className="text-brand-600" aria-hidden="true" />
								</div>
								<div>
									<h3 className="font-heading font-medium text-slate-900 text-sm leading-snug">
										{QUALITY_CONTROL.sections[1].title}
									</h3>
									<p className="text-slate-500 text-xs leading-snug mt-0.5">
										{QUALITY_CONTROL.sections[1].description}
									</p>
								</div>
							</div>
							<ul className="space-y-2">
								{QUALITY_CONTROL.sections[1].items.map((item) => (
									<li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-snug">
										<span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 bg-brand-500" aria-hidden="true" />
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
