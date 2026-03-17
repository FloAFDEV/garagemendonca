"use client";

import Image from "next/image";
import Link from "next/link";

const brands = [
  { name: "Volkswagen",   file: "volkswagen-logo.png" },
  { name: "BMW",          file: "bmw-logo.png" },
  { name: "Mercedes-Benz",file: "mercedes-benz-logo.png" },
  { name: "Audi",         file: "audi-logo.png" },
  { name: "Renault",      file: "renault-logo.png" },
  { name: "Peugeot",      file: "peugeot-logo.png" },
  { name: "Citroën",      file: "citroen-logo.png" },
  { name: "Fiat",         file: "fiat-logo.png" },
  { name: "Alfa Romeo",   file: "alfa-romeo-logo.png" },
  { name: "Volvo",        file: "volvo-logo.png" },
  { name: "Seat",         file: "seat-logo.png" },
  { name: "Škoda",        file: "skoda-logo.png" },
  { name: "Opel",         file: "opel-logo.png" },
  { name: "Toyota",       file: "toyota-logo.png" },
  { name: "Ford",         file: "ford-logo.png" },
  { name: "Nissan",       file: "nissan-logo.png" },
  { name: "Hyundai",      file: "hyundai-logo.png" },
  { name: "Kia",          file: "kia-logo.png" },
  { name: "Suzuki",       file: "suzuki-logo.png" },
  { name: "Dacia",        file: "dacia-logo.png" },
];

/* Double the list so the CSS marquee loops seamlessly */
const doubled = [...brands, ...brands];

export default function BrandsStrip() {
  return (
    <div className="mt-16 pt-10 border-t border-slate-200/70">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
        Toutes marques · Cliquez pour voir le stock
      </p>

      {/*
        group/strip: hover sur le conteneur pause le marquee
        pour permettre de cliquer sans que ça bouge
      */}
      <div
        className="relative overflow-hidden group/strip"
        aria-label="Filtrer les annonces par marque"
      >
        {/* Dégradé latéral */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f8fafc] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f8fafc] to-transparent z-10" />

        <div className="flex gap-10 items-center animate-marquee whitespace-nowrap group-hover/strip:[animation-play-state:paused]">
          {doubled.map(({ name, file }, i) => (
            <Link
              key={`${name}-${i}`}
              href={`/vehicules?brand=${encodeURIComponent(name)}`}
              /* Les doublons (index >= brands.length) sont cachés aux SR */
              aria-hidden={i >= brands.length}
              tabIndex={i >= brands.length ? -1 : 0}
              title={`Annonces ${name}`}
              className="flex-shrink-0 w-14 h-14 flex items-center justify-center
                         grayscale opacity-50
                         hover:grayscale-0 hover:opacity-100 hover:scale-110
                         transition-all duration-300 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-brand-400 rounded-lg"
            >
              <Image
                src={`/images/brands/${file}`}
                alt={i < brands.length ? name : ""}
                width={56}
                height={56}
                className="object-contain w-full h-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
