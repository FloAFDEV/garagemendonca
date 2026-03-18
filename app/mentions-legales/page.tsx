import type { Metadata } from "next";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Mentions Légales — Garage Mendonça",
  description: "Mentions légales du site internet du Garage Auto Mendonça à Drémil-Lafage (31).",
  robots: { index: false, follow: false },
};

const sections = [
  {
    title: "1. Éditeur du site",
    content: `Le site internet www.garagemendonca.com est édité par :

**Garage Auto Mendonça**
Forme juridique : SARL
Capital social : 7 700 €
SIRET : 449 948 975 00023
RCS : Toulouse
Code NAF/APE : 4520A — Entretien et réparation de véhicules automobiles légers
Numéro de TVA intracommunautaire : FR XX 449948975

Adresse du siège social :
6 Avenue de la Mouyssaguese
31280 Drémil-Lafage
France

Téléphone : 05 32 00 20 38
Email : contact@garagemendonca.com

Directeur de la publication : Vitor Mendonça`,
  },
  {
    title: "2. Hébergeur",
    content: `Le site est hébergé par :

**Vercel Inc.**
440 N Barranca Ave #4133
Covina, CA 91723
États-Unis
Site web : https://vercel.com`,
  },
  {
    title: "3. Propriété intellectuelle",
    content: `L'ensemble des éléments constituant ce site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) est la propriété exclusive du Garage Auto Mendonça ou de ses partenaires.

Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable du Garage Auto Mendonça.

Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.`,
  },
  {
    title: "4. Limitation de responsabilité",
    content: `Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.

Le Garage Auto Mendonça ne saurait être tenu responsable des dommages directs ou indirects, quelle qu'en soit la cause, origine, nature ou conséquence, provoqués à raison de l'accès de quiconque au site ou de l'impossibilité d'y accéder.

Les photos présentées sur le site sont non contractuelles.`,
  },
  {
    title: "5. Liens hypertextes",
    content: `Le site peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre d'information uniquement. Le Garage Auto Mendonça n'a aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.`,
  },
  {
    title: "6. Droit applicable",
    content: `Le présent site et les présentes mentions légales sont soumis au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du Tribunal de Commerce de Toulouse.`,
  },
];

export default function MentionsLegalesPage() {
  return (
    <MainLayout>

      {/* ── Header ── */}
      <section className="bg-[#f8fafc] border-b border-slate-200 pt-32 pb-12">
        <Container>
          <div className="max-w-2xl">
            <div className="section-divider" />
            <span className="eyebrow">Informations légales</span>
            <h1 className="section-title mt-1">Mentions légales</h1>
            <p className="text-[#475569] mt-3 text-sm">
              Dernière mise à jour : janvier 2025 ·{" "}
              <Link href="/contact" className="text-brand-500 hover:text-brand-600 font-medium">
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
                <div className="text-[#475569] text-sm leading-[1.85] whitespace-pre-line space-y-2">
                  {content.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p key={i} className="font-semibold text-[#0f172a]">
                          {line.slice(2, -2)}
                        </p>
                      );
                    }
                    return line ? <p key={i}>{line}</p> : <br key={i} />;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Liens légaux */}
          <div className="max-w-3xl mt-16 pt-8 border-t border-slate-200">
            <p className="text-[#475569] text-sm mb-4">Voir aussi :</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/politique-confidentialite"
                className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                Politique de confidentialité →
              </Link>
              <Link
                href="/cgu"
                className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
              >
                Conditions Générales d'Utilisation →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
