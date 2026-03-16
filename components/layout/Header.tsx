"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/vehicules", label: "Véhicules" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-dark-900/96 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)] shadow-lg"
          : "bg-transparent"
      )}
    >
      {/* ── Barre info supérieure — sobre, pas orange ── */}
      <div className="bg-dark-950/90 border-b border-white/[0.06] text-[#9ca3af] text-xs py-2 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone size={12} className="text-brand-400" aria-hidden="true" />
            <a
              href="tel:0532002038"
              className="hover:text-white transition-colors font-medium"
            >
              05 32 00 20 38
            </a>
            <span className="mx-3 opacity-30" aria-hidden="true">|</span>
            <span>Lun–Jeu : 08h–12h / 14h–19h &nbsp;·&nbsp; Ven : 08h–12h / 14h–18h</span>
          </span>
          <a
            href="mailto:contact@garagemendonca.com"
            className="hover:text-white transition-colors"
          >
            contact@garagemendonca.com
          </a>
        </div>
      </div>

      {/* ── Nav principale ── */}
      <nav className="container mx-auto px-4" aria-label="Navigation principale">
        <div className="flex items-center justify-between h-16 md:h-18 md:h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Garage Mendonça – Accueil">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand transition-all duration-200 group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="2" />
                <circle cx="12" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
              </svg>
            </div>
            <div>
              <div className="font-heading font-bold text-white leading-none text-base">
                Garage Mendonça
              </div>
              <div className="text-[11px] text-[#9ca3af] leading-none mt-0.5">
                Drémil-Lafage · depuis 1993
              </div>
            </div>
          </Link>

          {/* Liens desktop */}
          <ul className="hidden md:flex items-center gap-0.5" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#9ca3af] hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/8 transition-all duration-150 text-sm focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center">
            <a
              href="tel:0532002038"
              className="btn-primary text-sm py-2.5 px-5"
            >
              <Phone size={14} />
              Prendre RDV
            </a>
          </div>

          {/* Burger mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu mobile */}
        <div
          id="mobile-menu"
          className={clsx(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-[380px] pb-4 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-dark-850 rounded-2xl p-3 flex flex-col gap-0.5 border border-white/[0.06]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[#9ca3af] hover:text-white font-medium px-4 py-3 rounded-xl hover:bg-white/8 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06] mt-2 pt-3">
              <a
                href="tel:0532002038"
                className="btn-primary w-full justify-center text-sm"
              >
                <Phone size={15} />
                05 32 00 20 38
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
