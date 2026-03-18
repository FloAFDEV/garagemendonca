import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Youtube, ExternalLink } from "lucide-react";

const footerLinks = {
  services: [
    { href: "/services#entretien", label: "Entretien & Révision" },
    { href: "/services#mecanique", label: "Réparation Mécanique" },
    { href: "/services#carrosserie", label: "Carrosserie & Peinture" },
    { href: "/services#diagnostic", label: "Diagnostic & Pannes" },
  ],
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/vehicules", label: "Occasions" },
    { href: "/produit", label: "Notre offre VO" },
    { href: "/contact", label: "Contact & Devis" },
  ],
};

const hours = [
  { day: "Lun – Jeu", time: "08h–12h / 14h–19h" },
  { day: "Vendredi", time: "08h–12h / 14h–18h" },
  { day: "Sam – Dim", time: "Fermé" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">

      {/* ── Bande accent top ── */}
      <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />

      {/* ── Corps principal ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Colonne 1 — Marque */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                  <rect x="9" y="11" width="14" height="10" rx="2" />
                  <circle cx="12" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                </svg>
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg leading-tight">
                  Garage Mendonça
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Depuis 2001 · Drémil-Lafage</div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-500 mb-5">
              Spécialiste des voitures japonaises et boîtes automatiques depuis 2001, le Garage Mendonça accueille jeunes conducteurs, seniors et personnes à mobilité réduite. Nous parlons portugais et français.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-brand-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-brand-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Colonne 2 — Services + Nav */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-sm">
              Nos Services
            </h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-slate-600 rounded-full flex-shrink-0 group-hover:bg-brand-400 transition-colors" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-heading font-semibold text-white mb-5 text-sm">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-slate-600 rounded-full flex-shrink-0 group-hover:bg-brand-400 transition-colors" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-sm">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-brand-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="block leading-relaxed">
                    6 Avenue de la Mouyssaguese<br />
                    31280 Drémil-Lafage
                  </span>
                  <a
                    href="https://maps.google.com/?q=Garage+Mendonca+6+Avenue+de+la+Mouyssaguese+31280+Dremil-Lafage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs mt-2 transition-colors"
                  >
                    Ouvrir dans Google Maps
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-brand-500 flex-shrink-0" aria-hidden="true" />
                <a
                  href="tel:0532002038"
                  className="hover:text-brand-400 transition-colors font-medium"
                >
                  05 32 00 20 38
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-brand-500 flex-shrink-0" aria-hidden="true" />
                <a
                  href="mailto:contact@garagemendonca.com"
                  className="hover:text-brand-400 transition-colors break-all"
                >
                  contact@garagemendonca.com
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 — Horaires */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-sm">
              Horaires d&apos;ouverture
            </h4>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} className="text-brand-500" aria-hidden="true" />
              <span className="text-xs text-slate-500">Avec ou sans rendez-vous</span>
            </div>
            <ul className="space-y-3 mb-6">
              {hours.map(({ day, time }) => (
                <li key={day} className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400">{day}</span>
                  <span
                    className={`font-semibold text-xs ${
                      time === "Fermé" ? "text-slate-600" : "text-white"
                    }`}
                  >
                    {time}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="tel:0532002038"
              className="inline-flex items-center gap-2 btn-primary text-sm py-3 w-full justify-center"
            >
              <Phone size={15} />
              Appeler le garage
            </a>
          </div>
        </div>
      </div>

      {/* ── Barre légale ── */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Garage Auto Mendonça · SARL · SIRET 449 948 975 00023 · RCS Toulouse · Capital 7 700 €</p>
          <div className="flex items-center gap-5">
            <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgu" className="hover:text-slate-400 transition-colors">
              CGU
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-slate-400 transition-colors">
              Confidentialité
            </Link>
            <span className="text-slate-700">NAF 4520A</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
