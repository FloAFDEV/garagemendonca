"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-dark-900/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      )}
    >
      {/* Top bar */}
      <div className="bg-brand-600 text-white text-sm py-2 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone size={13} />
            <a href="tel:0561837805" className="hover:underline font-medium">
              05 61 83 78 05
            </a>
            <span className="mx-3 opacity-50">|</span>
            <span>Lun–Jeu : 08h–12h / 14h–19h &nbsp;•&nbsp; Ven : 08h–12h / 14h–18h</span>
          </span>
          <a
            href="mailto:contact@garagemendonca.com"
            className="hover:underline"
          >
            contact@garagemendonca.com
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:bg-brand-500 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="2" />
                <circle cx="12" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
              </svg>
            </div>
            <div>
              <div className="font-heading font-bold text-white leading-none text-lg">
                Garage Mendonca
              </div>
              <div className="text-xs text-dark-400 leading-none mt-0.5">
                Drémil-Lafage · depuis 1993
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-dark-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA button */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:0561837805"
              className="btn-primary text-sm py-2.5"
            >
              <Phone size={15} />
              Prendre RDV
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={clsx(
            "md:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <div className="bg-dark-800 rounded-2xl p-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-dark-300 hover:text-white font-medium px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-dark-700 mt-2 pt-3">
              <a
                href="tel:0561837805"
                className="btn-primary w-full justify-center text-sm"
              >
                <Phone size={15} />
                05 61 83 78 05
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
