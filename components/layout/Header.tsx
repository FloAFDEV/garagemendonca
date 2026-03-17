"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
          ? "bg-white shadow-[0_1px_0_#e2e8f0,0_4px_16px_rgba(0,0,0,0.08)]"
          : "bg-white/95 backdrop-blur-sm shadow-[0_1px_0_#e2e8f0]"
      )}
    >
      {/* ── Barre info supérieure ── */}
      <div className="bg-[#0f172a] text-slate-400 text-xs py-2 hidden md:block">
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
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="Garage Mendonça – Accueil">
            <div className="relative h-14 w-[185px] overflow-hidden rounded-lg transition-opacity duration-200 group-hover:opacity-90">
              <Image
                src="/images/logo.png"
                alt="Garage Mendonça"
                fill
                priority
                className="object-contain object-left"
                sizes="185px"
              />
            </div>
          </Link>

          {/* Liens desktop */}
          <ul className="hidden md:flex items-center gap-0.5" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#475569] hover:text-[#0f172a] font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-150 text-sm focus-visible:ring-2 focus-visible:ring-brand-400"
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
            className="md:hidden text-[#0f172a] p-2 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400"
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
          <div className="bg-white rounded-2xl p-3 flex flex-col gap-0.5 border border-slate-200 shadow-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[#475569] hover:text-[#0f172a] font-medium px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-3">
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
