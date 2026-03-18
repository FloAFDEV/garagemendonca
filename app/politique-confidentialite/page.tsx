import type { Metadata } from "next";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Garage Mendonça",
  description:
    "Politique de confidentialité et protection des données personnelles du Garage Auto Mendonça (RGPD).",
  robots: { index: false, follow: false },
};

const sections = [
  {
    title: "1. Responsable du traitement",
    content: `Le responsable du traitement des données personnelles collectées via le site www.garagemendonca.com est :

Garage Auto Mendonça — SARL
6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage
Téléphone : 05 32 00 20 38
Email : contact@garagemendonca.com`,
  },
  {
    title: "2. Données collectées",
    content: `Nous collectons uniquement les données que vous nous communiquez volontairement, notamment via :

• Le formulaire de contact : nom, prénom, adresse email, numéro de téléphone (optionnel), message.
• Les appels téléphoniques : les informations que vous choisissez de partager lors de la conversation.

Nous ne collectons aucune donnée personnelle sans votre consentement explicite.`,
  },
  {
    title: "3. Finalités du traitement",
    content: `Vos données personnelles sont utilisées pour :

• Répondre à vos demandes de contact ou de devis.
• Gérer notre relation client (suivi des dossiers, rendez-vous).
• Améliorer nos services à partir de vos retours.
• Vous envoyer des informations relatives à nos prestations, uniquement si vous y avez consenti.

Vos données ne sont jamais vendues, louées ou cédées à des tiers à des fins commerciales.`,
  },
  {
    title: "4. Base légale du traitement",
    content: `Les traitements de données s'appuient sur les bases légales suivantes :

• L'exécution d'un contrat ou de mesures précontractuelles (réponse à vos demandes de devis).
• Notre intérêt légitime (amélioration de nos services, gestion de la relation client).
• Votre consentement, lorsqu'il est requis (communications commerciales).`,
  },
  {
    title: "5. Durée de conservation",
    content: `Vos données personnelles sont conservées pendant :

• 3 ans à compter du dernier contact, pour les prospects et clients potentiels.
• 10 ans à compter de la clôture du dossier, pour les données relatives aux contrats et factures (obligation légale).

À l'issue de ces délais, vos données sont supprimées ou anonymisées.`,
  },
  {
    title: "6. Vos droits (RGPD)",
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :

• Droit d'accès : obtenir la confirmation que vos données sont traitées et en obtenir une copie.
• Droit de rectification : faire corriger vos données inexactes ou incomplètes.
• Droit à l'effacement : demander la suppression de vos données (sous certaines conditions).
• Droit à la limitation : demander que le traitement de vos données soit limité.
• Droit à la portabilité : recevoir vos données dans un format structuré et lisible.
• Droit d'opposition : vous opposer au traitement de vos données pour des raisons liées à votre situation particulière.
• Droit de retrait du consentement : retirer votre consentement à tout moment, sans que cela n'affecte la légalité des traitements effectués avant ce retrait.

Pour exercer ces droits, contactez-nous par email à contact@garagemendonca.com ou par courrier à notre adresse.

Vous avez également le droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).`,
  },
  {
    title: "7. Sécurité des données",
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, divulgation, altération ou destruction.

Le site utilise le protocole HTTPS pour sécuriser les échanges de données entre votre navigateur et nos serveurs.`,
  },
  {
    title: "8. Cookies",
    content: `Le site www.garagemendonca.com peut utiliser des cookies de fonctionnement essentiels au bon fonctionnement du site, et des cookies analytiques anonymisés pour mesurer l'audience.

Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies non essentiels. Cela n'affecte pas les fonctionnalités principales du site.`,
  },
  {
    title: "9. Modifications de la politique",
    content: `Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec indication de la date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.`,
  },
  {
    title: "10. Contact DPO",
    content: `Pour toute question relative à la protection de vos données personnelles, vous pouvez nous contacter :

Par email : contact@garagemendonca.com
Par courrier : Garage Auto Mendonça, 6 Avenue de la Mouyssaguese, 31280 Drémil-Lafage
Par téléphone : 05 32 00 20 38 (du lundi au vendredi)`,
  },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <MainLayout>

      {/* ── Header ── */}
      <section className="bg-[#f8fafc] border-b border-slate-200 pt-32 pb-12">
        <Container>
          <div className="max-w-2xl">
            <div className="section-divider" />
            <span className="eyebrow">Protection des données</span>
            <h1 className="section-title mt-1">Politique de confidentialité</h1>
            <p className="text-[#475569] mt-3 text-sm">
              Dernière mise à jour : janvier 2025 · Conformité RGPD ·{" "}
              <Link href="/contact" className="text-brand-500 hover:text-brand-600 font-medium">
                Exercer vos droits
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* ── Encadré RGPD ── */}
      <section className="py-8 bg-white border-b border-slate-200">
        <Container>
          <div className="max-w-3xl bg-brand-50 border border-brand-100 rounded-xl px-6 py-4 flex items-start gap-4">
            <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#0f172a] text-sm mb-1">Engagement RGPD</p>
              <p className="text-[#475569] text-sm leading-relaxed">
                Le Garage Auto Mendonça s'engage à traiter vos données personnelles de manière transparente,
                sécurisée et conforme au Règlement Général sur la Protection des Données (UE) 2016/679.
              </p>
            </div>
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
                  {content.split("\n").map((line, i) =>
                    line ? <p key={i}>{line}</p> : <br key={i} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Liens légaux */}
          <div className="max-w-3xl mt-16 pt-8 border-t border-slate-200">
            <p className="text-[#475569] text-sm mb-4">Voir aussi :</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/mentions-legales"
                className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                Mentions légales →
              </Link>
              <Link
                href="/cgu"
                className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                CGU →
              </Link>
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                Site de la CNIL →
              </a>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
