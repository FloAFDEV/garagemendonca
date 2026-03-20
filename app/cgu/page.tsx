import type { Metadata } from "next";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
	title: "Conditions Générales d'Utilisation — Garage Mendonça",
	description:
		"Conditions Générales d'Utilisation du site internet du Garage Auto Mendonça à Drémil-Lafage (31).",
	robots: { index: false, follow: false },
};

const sections = [
	{
		title: "1. Objet",
		content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site internet www.garagemendonça.com, édité par le Garage Auto Mendonça (ci-après « le Garage »).

Tout accès au site implique l'acceptation sans réserve des présentes CGU. Le Garage se réserve le droit de les modifier à tout moment ; les modifications entrent en vigueur dès leur publication sur le site.`,
	},
	{
		title: "2. Accès au site",
		content: `Le site est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Tous les frais nécessaires pour l'accès au site (matériel, logiciels, connexion internet) sont à la charge exclusive de l'utilisateur.

Le Garage met en œuvre tous les moyens raisonnables à sa disposition pour assurer un accès de qualité au site, mais n'est tenu à aucune obligation d'y parvenir. Il peut interrompre l'accès au site à tout moment pour des raisons de maintenance ou de mise à jour, sans préavis.`,
	},
	{
		title: "3. Utilisation du site",
		content: `L'utilisateur s'engage à utiliser le site conformément aux lois et réglementations en vigueur, ainsi qu'aux présentes CGU. Il s'interdit notamment de :

• Publier ou transmettre des contenus illicites, offensants ou portant atteinte aux droits de tiers.
• Tenter de porter atteinte à la sécurité du site ou de ses serveurs.
• Utiliser des robots, scripts ou tout autre procédé automatisé pour accéder au site ou en extraire des données.
• Reproduire, copier ou vendre tout ou partie du contenu du site sans autorisation préalable.`,
	},
	{
		title: "4. Formulaire de contact",
		content: `Le site propose un formulaire de contact permettant aux utilisateurs d'envoyer des demandes d'information ou de devis au Garage.

L'utilisateur s'engage à fournir des informations exactes et à ne pas utiliser ce formulaire à des fins de démarchage commercial non sollicité ou à d'autres fins illicites.

Les données transmises via le formulaire de contact sont traitées conformément à notre Politique de confidentialité.`,
	},
	{
		title: "5. Propriété intellectuelle",
		content: `L'ensemble du contenu du site (textes, images, vidéos, logos, icônes, mise en page) est protégé par le droit de la propriété intellectuelle. Toute reproduction, diffusion ou utilisation sans autorisation écrite préalable du Garage est interdite.

Les marques automobiles citées à titre de référence (BMW, Audi, Volkswagen, Mercedes, etc.) sont la propriété de leurs titulaires respectifs.`,
	},
	{
		title: "6. Limitation de responsabilité",
		content: `Le Garage s'efforce d'assurer l'exactitude et la mise à jour des informations publiées sur le site. Toutefois, il ne peut garantir l'exhaustivité, l'exactitude ou l'actualité de ces informations.

Les informations relatives aux véhicules (prix, kilométrage, équipements) sont données à titre indicatif et peuvent être modifiées sans préavis. Seule la fiche technique remise lors de l'achat fait foi.

Le Garage décline toute responsabilité pour tout préjudice direct ou indirect résultant de l'utilisation du site.`,
	},
	{
		title: "7. Protection des données personnelles",
		content: `La collecte et le traitement des données personnelles sont régis par notre Politique de confidentialité, consultable à l'adresse /politique-confidentialite.

Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : contact@garagemendonça.com`,
	},
	{
		title: "8. Cookies",
		content: `Le site peut utiliser des cookies à des fins de fonctionnement et d'analyse d'audience. En continuant à naviguer sur le site, vous acceptez l'utilisation de ces cookies.

Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, ce qui peut cependant affecter le bon fonctionnement de certaines fonctionnalités du site.`,
	},
	{
		title: "9. Droit applicable et juridiction",
		content: `Les présentes CGU sont régies par le droit francais. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, les parties rechercheront une solution amiable avant tout recours judiciaire. À défaut d'accord amiable, le litige sera soumis aux tribunaux compétents du ressort de Toulouse.`,
	},
];

export default function CguPage() {
	return (
		<MainLayout>
			{/* ── Header ── */}
			<section className="bg-[#f8fafc] border-b border-slate-200 pt-32 pb-12">
				<Container>
					<div className="max-w-2xl">
						<div className="section-divider" />
						<span className="eyebrow">Utilisation du site</span>
						<h1 className="section-title mt-1">
							Conditions Générales d'Utilisation
						</h1>
						<p className="text-[#475569] mt-3 text-sm">
							Dernière mise à jour : janvier 2025 ·{" "}
							<Link
								href="/contact"
								className="text-brand-500 hover:text-brand-600 font-medium"
							>
								Nous contacter
							</Link>
						</p>
					</div>
				</Container>
			</section>

			{/* ── Contenu ── */}
			<section className="py-16 bg-white">
				<Container>
					<div className="max-w-3xl space-y-10">
						{sections.map(({ title, content }) => (
							<div key={title}>
								<h2 className="font-heading font-bold text-[#0f172a] text-lg mb-4 pb-3 border-b border-slate-100">
									{title}
								</h2>
								<div className="text-[#475569] text-sm leading-[1.85] space-y-2">
									{content
										.split("\n")
										.map((line, i) =>
											line ? (
												<p key={i}>{line}</p>
											) : (
												<br key={i} />
											),
										)}
								</div>
							</div>
						))}
					</div>

					{/* Liens légaux */}
					<div className="max-w-3xl mt-16 pt-8 border-t border-slate-200">
						<p className="text-[#475569] text-sm mb-4">
							Voir aussi :
						</p>
						<div className="flex flex-wrap gap-4">
							<Link
								href="/mentions-legales"
								className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
							>
								Mentions légales →
							</Link>
							<Link
								href="/politique-confidentialite"
								className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
							>
								Politique de confidentialité →
							</Link>
						</div>
					</div>
				</Container>
			</section>
		</MainLayout>
	);
}
