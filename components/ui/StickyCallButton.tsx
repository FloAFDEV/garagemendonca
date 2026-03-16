"use client";

import { Phone } from "lucide-react";

export default function StickyCallButton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" role="complementary" aria-label="Bouton d'appel rapide">
      {/* Barre d'ombre supérieure pour profondeur */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" aria-hidden="true" />
      <a
        href="tel:0532002038"
        className="flex items-center justify-center gap-3 w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold py-4 text-base transition-colors shadow-brand-lg"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Phone size={17} />
        </div>
        <span>Appeler : 05 32 00 20 38</span>
      </a>
    </div>
  );
}
