import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";

const hours = [
	{ day: "Lundi – Jeudi", time: "08h00–12h00  /  14h00–19h00" },
	{ day: "Vendredi", time: "08h00–12h00  /  14h00–18h00" },
	{ day: "Samedi – Dimanche", time: "Fermé" },
];

export default function MapContact() {
	return (
		<section className="py-28 bg-[#f1f5f9]">
			<Container>
				<AnimateOnScroll>
					<div className="text-center mb-14">
						<div className="section-divider mx-auto" />
						<span className="eyebrow justify-center">
							Nous trouver
						</span>
						<h2 className="section-title">
							Comment nous rendre visite
						</h2>
						<p className="section-subtitle mx-auto mt-4">
							Situé à Drémil-Lafage, à quelques kilomètres de
							Toulouse, notre garage est facilement accessible.
						</p>
					</div>
				</AnimateOnScroll>

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
					{/* Info panel */}
					<AnimateOnScroll
						delay={80}
						className="lg:col-span-2 flex flex-col gap-5"
					>
						{/* Adresse */}
						<div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300">
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
									<MapPin
										size={18}
										className="text-brand-500"
									/>
								</div>
								<div>
									<h3 className="ty-subheading text-[#0f172a] text-sm mb-1">
										Adresse
									</h3>
									<p className="font-light text-[#475569] text-sm leading-relaxed">
										6 Avenue de la Mouyssaguese
										<br />
										31280 Drémil-Lafage, France
									</p>
									<a
										href="https://maps.google.com/?q=Garage+Mendonça+Drémil-Lafage"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 text-brand-600 text-xs font-normal mt-3 hover:text-brand-700 transition-colors rounded"
									>
										Ouvrir dans Google Maps
										<ExternalLink size={11} />
									</a>
								</div>
							</div>
						</div>

						{/* Téléphone & Email */}
						<div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300">
							<div className="space-y-4">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
										<Phone
											size={18}
											className="text-brand-500"
										/>
									</div>
									<div>
										<p className="ty-label mb-1">
											Téléphone
										</p>
										{/* Numéro = valeur clé → font-medium */}
										<a
											href="tel:0532002038"
											className="ty-value text-sm hover:text-brand-600 transition-colors"
										>
											05 32 00 20 38
										</a>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
										<Mail
											size={18}
											className="text-brand-500"
										/>
									</div>
									<div>
										<p className="ty-label mb-1">
											Email
										</p>
										<a
											href="mailto:contact@garagemendonça.com"
											className="font-normal text-[#0f172a] hover:text-brand-600 transition-colors text-sm"
										>
											contact@garagemendonça.com
										</a>
									</div>
								</div>
							</div>
						</div>

						{/* Horaires */}
						<div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
									<Clock
										size={18}
										className="text-brand-500"
									/>
								</div>
								<h3 className="ty-subheading text-[#0f172a] text-sm">
									Horaires d&apos;ouverture
								</h3>
							</div>
							<ul className="space-y-3">
								{hours.map(({ day, time }) => (
									<li
										key={day}
										className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0"
									>
										<span className="font-light text-[#475569]">
											{day}
										</span>
										<span
											className={`text-xs font-medium ${
												time === "Fermé"
													? "text-red-500"
													: "text-[#0f172a]"
											}`}
										>
											{time}
										</span>
									</li>
								))}
							</ul>
						</div>
					</AnimateOnScroll>

					{/* Carte */}
					<AnimateOnScroll delay={160} className="lg:col-span-3">
						<div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card h-full min-h-[400px]">
							<iframe
								src="https://maps.google.com/maps?q=6+Avenue+de+la+Mouyssaguese,+31280+Dr%C3%A9mil-Lafage,+France&z=16&output=embed"
								width="100%"
								height="100%"
								style={{ border: 0, minHeight: "400px" }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="Carte Garage Mendonça"
							/>
						</div>
					</AnimateOnScroll>
				</div>
			</Container>
		</section>
	);
}
