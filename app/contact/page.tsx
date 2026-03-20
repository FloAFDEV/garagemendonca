import type { Metadata } from "next";
import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/contact/ContactForm";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
	title: "Contact et Devis",
	description:
		"Contactez Garage Auto Mendonça à Drémil-Lafage. Appelez le 05 32 00 20 38 ou envoyez-nous un message pour un devis gratuit. Réponse sous 24h.",
};

function ContactFormWrapper({
	searchParams,
}: {
	searchParams: Record<string, string>;
}) {
	const vehicule = searchParams?.vehicule;
	return <ContactForm vehicule={vehicule} />;
}

const hours = [
	{ day: "Lundi", time: "08h00–12h00 / 14h00–19h00", open: true },
	{ day: "Mardi", time: "08h00–12h00 / 14h00–19h00", open: true },
	{ day: "Mercredi", time: "08h00–12h00 / 14h00–19h00", open: true },
	{ day: "Jeudi", time: "08h00–12h00 / 14h00–19h00", open: true },
	{ day: "Vendredi", time: "08h00–12h00 / 14h00–18h00", open: true },
	{ day: "Samedi", time: "Fermé", open: false },
	{ day: "Dimanche", time: "Fermé", open: false },
];

interface PageProps {
	searchParams: Promise<Record<string, string>>;
}

export default async function ContactPage({ searchParams }: PageProps) {
	const params = await searchParams;
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
							<span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
								Disponibles du lundi au vendredi
							</span>
						</div>
						<h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
							Contactez-nous —{" "}
							<span className="text-brand-500">
								devis gratuit sous 24h
							</span>
						</h1>
						<p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
							Appelez-nous directement ou envoyez-nous un message.
							Nous répondons sous 24h et vous proposons un devis
							gratuit et détaillé.
						</p>
					</div>
				</Container>
			</section>

			{/* ── Contenu ── */}
			<section className="py-16 bg-[#f8fafc]">
				<Container>
					<div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
						{/* Sidebar coordonnées — en premier sur mobile */}
						<div className="lg:col-span-2 lg:order-2 space-y-5">
							<h2 className="font-heading font-bold text-[#0f172a] text-2xl mb-6">
								Nos coordonnées
							</h2>

							{/* Téléphone */}
							<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
								<div className="flex items-center gap-4 mb-3">
									<div
										className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0"
										aria-hidden="true"
									>
										<Phone
											size={22}
											className="text-brand-600"
											aria-hidden="true"
										/>
									</div>
									<div>
										<p className="text-xs text-[#475569] font-medium">
											Téléphone
										</p>
										<a
											href="tel:0532002038"
											className="font-heading font-bold text-[#0f172a] text-xl hover:text-brand-600 transition-colors"
										>
											05 32 00 20 38
										</a>
									</div>
								</div>
								<a
									href="tel:0532002038"
									className="btn-primary w-full justify-center mt-2"
								>
									<Phone size={16} aria-hidden="true" />
									Appeler maintenant
								</a>
							</div>

							{/* Email */}
							<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
								<div className="flex items-start gap-4">
									<div
										className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0"
										aria-hidden="true"
									>
										<Mail
											size={22}
											className="text-brand-600"
											aria-hidden="true"
										/>
									</div>
									<div>
										<p className="text-xs text-[#475569] font-medium mb-1">
											Email
										</p>
										<a
											href="mailto:contact@garagemendonça.com"
											className="font-semibold text-[#0f172a] hover:text-brand-600 transition-colors text-sm break-all"
										>
											contact@garagemendonça.com
										</a>
									</div>
								</div>
							</div>

							{/* Adresse */}
							<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
								<div className="flex items-start gap-4">
									<div
										className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0"
										aria-hidden="true"
									>
										<MapPin
											size={22}
											className="text-brand-600"
											aria-hidden="true"
										/>
									</div>
									<div>
										<p className="text-xs text-[#475569] font-medium mb-1">
											Adresse
										</p>
										<address className="not-italic font-semibold text-[#0f172a] text-sm leading-relaxed">
											6 Avenue de la Mouyssaguese
											<br />
											31280 Drémil-Lafage
										</address>
										<a
											href="https://maps.google.com/?q=6+Avenue+de+la+Mouyssaguese+31280+Drémil-Lafage"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-brand-600 text-xs font-medium mt-2 hover:text-brand-700"
											aria-label="Itinéraire Google Maps (ouvre un nouvel onglet)"
										>
											Itinéraire Google Maps
											<ExternalLink
												size={12}
												aria-hidden="true"
											/>
										</a>
									</div>
								</div>
							</div>

							{/* Horaires */}
							<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
								<div className="flex items-center gap-3 mb-5">
									<div
										className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0"
										aria-hidden="true"
									>
										<Clock
											size={22}
											className="text-brand-600"
											aria-hidden="true"
										/>
									</div>
									<h3 className="font-semibold text-[#0f172a]">
										Horaires d'ouverture
									</h3>
								</div>
								<ul className="space-y-2">
									{hours.map(({ day, time, open }) => (
										<li
											key={day}
											className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0"
										>
											<span className="text-[#475569]">
												{day}
											</span>
											<span
												className={`font-medium ${open ? "text-[#0f172a]" : "text-red-500"}`}
											>
												{time}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Formulaire */}
						<div
							id="contact-form"
							className="lg:col-span-3 lg:order-1"
						>
							<h2 className="font-heading font-bold text-[#0f172a] text-2xl mb-6">
								Envoyez-nous un message
							</h2>
							<Suspense
								fallback={
									<div className="h-96 bg-white rounded-2xl animate-pulse border border-slate-200" />
								}
							>
								<ContactFormWrapper searchParams={params} />
							</Suspense>
						</div>
					</div>

					{/* Carte */}
					<div className="mt-10 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
						<iframe
							src="https://maps.google.com/maps?q=6+Avenue+de+la+Mouyssaguese,+31280+Dr%C3%A9mil-Lafage,+France&z=16&output=embed"
							width="100%"
							height="400"
							style={{ border: 0 }}
							allowFullScreen
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Plan d'accès au Garage Mendonça — 6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage"
						/>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
