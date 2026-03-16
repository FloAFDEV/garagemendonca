"use client";

import { Phone } from "lucide-react";

export default function StickyCallButton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <a
        href="tel:0532002038"
        className="flex items-center justify-center gap-3 w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold py-4 text-base transition-colors shadow-2xl"
      >
        <Phone size={20} />
        <span>Appeler le 05 32 00 20 38</span>
      </a>
    </div>
  );
}
