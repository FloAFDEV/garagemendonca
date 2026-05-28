import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import GmBadge from "@/components/ui/GmBadge";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { FAQ_CATEGORIES, ALL_FAQ_ITEMS } from "@/lib/faq-data";

export const metadata: Metadata = {
	title: "FAQ — Questions fréquentes sur nos véhicules et services",
	description:
		"Toutes les réponses à vos questions : garantie, essai, financement, livraison, boîte automatique, documents... Garage Auto Mendonca à Drémil-Lafage (31).",
	alternates: {
		canonical: "https://www.garagemendonca.com/faq",
	},
	openGraph: {
		title: "FAQ — Garage Auto Mendonca · Drémil-Lafage",
		description:
			"Garantie, financement, essai, reprise, boîte automatique... Retrouvez toutes les réponses à vos questions avant d'acheter ou faire entretenir votre véhicule.",
		type: "website",
		locale: "fr_FR",
		url: "https://www.garagemendonca.com/faq",
		siteName: "Garage Auto Mendonca",
		images: [
			{
				url: "/images/og-image.webp",
				width: 1200,
				height: 630,
				alt: "FAQ — Garage Auto Mendonca",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "FAQ — Garage Auto Mendonca",
		description:
			"Toutes les réponses à vos questions sur nos véhicules d'occasion et nos services.",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: ALL_FAQ_ITEMS.map((item) => ({
		"@type": "Question",
		name: item.question,
		acceptedAnswer: {
			"@type": "Answer",
			text: item.answer,
		},
	})),
};

export default function FaqPage() {
	return (
		<MainLayout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* ── Hero ── */}
			<section className="relative bg-dark-900 overflow-hidden pt-36 pb-20">
				<div
					className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="absolute bottom-0 left-0 w-80 h-80 bg-brand-800/10 rounded-full blur-[140px] pointer-events-none"
					aria-hidden="true"
				/>
				<Container className="relative">
					<div className="flex items-start justify-between gap-6">
						<div className="flex-1 min-w-0">
							<div className="inline-flex items-center gap-2 mt-8 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 mb-5">
								<span
									className="w-1.5 h-1.5 rounded-full bg-brand-500"
									aria-hidden="true"
								/>
								<span className="text-brand-500 text-xs font-medium tracking-wide uppercase">
									Vos questions, nos réponses
								</span>
							</div>
							<h1 className="ty-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
								Foire aux questions
								<br />
								<span className="text-brand-400">
									Garage Mendonca
								</span>
							</h1>
							<p className="text-dark-300 text-base sm:text-lg leading-relaxed max-w-2xl">
								Garantie, essai, financement, reprise,
								boîte automatique… Retrouvez toutes les réponses
								avant de vous déplacer.
							</p>
						</div>
						<GmBadge
							size="lg"
							className="mt-8 hidden sm:block opacity-90"
						/>
					</div>
				</Container>
			</section>

			{/* ── Contenu ── */}
			<section className="bg-slate-50 py-16 sm:py-20">
				<Container>
					<div className="max-w-3xl mx-auto">
						<FaqAccordion categories={FAQ_CATEGORIES} />

						{/* CTA bas de page */}
						<div className="mt-14 rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
							<p className="font-heading text-xl text-[#0f172a] mb-2">
								Vous ne trouvez pas votre réponse&nbsp;?
							</p>
							<p className="text-slate-500 text-sm mb-7 max-w-md mx-auto">
								Appelez-nous directement ou envoyez-nous un
								message — nous vous répondons rapidement.
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
								<a
									href="tel:0532002038"
									className="btn-primary w-full sm:w-auto justify-center"
								>
									<Phone size={15} aria-hidden="true" />
									05 32 00 20 38
								</a>
								<Link
									href="/contact"
									className="btn-secondary w-full sm:w-auto justify-center"
								>
									<MessageCircle
										size={15}
										aria-hidden="true"
									/>
									Formulaire de contact
								</Link>
							</div>
						</div>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
