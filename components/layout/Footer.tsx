import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";

const footerLinks = {
  services: [
    { href: "/services#entretien", label: "Entretien & Révision" },
    { href: "/services#mecanique", label: "Réparation Mécanique" },
    { href: "/services#carrosserie", label: "Carrosserie & Peinture" },
    { href: "/services#diagnostic", label: "Diagnostic Électronique" },
  ],
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/vehicules", label: "Véhicules d'occasion" },
    { href: "/contact", label: "Contact & Devis" },
    { href: "/admin/login", label: "Espace Admin" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                  <rect x="9" y="11" width="14" height="10" rx="2" />
                  <circle cx="12" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                </svg>
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg leading-none">
                  Garage Mendonca
                </div>
                <div className="text-xs text-dark-500 mt-0.5">depuis 1993</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-dark-400 mb-6">
              Garage indépendant spécialisé dans l&apos;entretien, la réparation
              et la vente de véhicules d&apos;occasion depuis plus de 30 ans en
              région toulousaine.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-dark-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-dark-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">
              Nos Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-brand-600 rounded-full flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-brand-600 rounded-full flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                <span>
                  6 Avenue de la Mouyssaguese
                  <br />
                  31280 Drémil-Lafage
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-brand-500 flex-shrink-0" />
                <a href="tel:0561837805" className="hover:text-brand-400 transition-colors">
                  05 61 83 78 05
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-brand-500 flex-shrink-0" />
                <a
                  href="mailto:contact@garagemendonca.com"
                  className="hover:text-brand-400 transition-colors break-all"
                >
                  contact@garagemendonca.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Lun–Jeu : 08h–12h / 14h–19h</div>
                  <div>Vendredi : 08h–12h / 14h–18h</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-dark-500">
          <p>© {new Date().getFullYear()} Garage Auto Mendonca. Tous droits réservés.</p>
          <p>
            Siret · N° SIRET — 6 Av. de la Mouyssaguese, 31280 Drémil-Lafage
          </p>
        </div>
      </div>
    </footer>
  );
}
