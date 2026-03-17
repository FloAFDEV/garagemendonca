import Image from "next/image";

const brands = [
  { name: "Volkswagen", file: "volkswagen-logo.png" },
  { name: "BMW",        file: "bmw-logo.png" },
  { name: "Mercedes-Benz", file: "mercedes-benz-logo.png" },
  { name: "Audi",       file: "audi-logo.png" },
  { name: "Renault",    file: "renault-logo.png" },
  { name: "Peugeot",    file: "peugeot-logo.png" },
  { name: "Citroën",    file: "citroen-logo.png" },
  { name: "Fiat",       file: "fiat-logo.png" },
  { name: "Alfa Romeo", file: "alfa-romeo-logo.png" },
  { name: "Volvo",      file: "volvo-logo.png" },
  { name: "Seat",       file: "seat-logo.png" },
  { name: "Škoda",      file: "skoda-logo.png" },
  { name: "Opel",       file: "opel-logo.png" },
  { name: "Toyota",     file: "toyota-logo.png" },
  { name: "Ford",       file: "ford-logo.png" },
  { name: "Mini",       file: "mini-logo.png" },
  { name: "Dacia",      file: "dacia-logo.png" },
  { name: "Hyundai",    file: "hyundai-logo.png" },
  { name: "Kia",        file: "kia-logo.png" },
  { name: "Porsche",    file: "porsche-logo.png" },
];

/* Double the list so the CSS marquee loops seamlessly */
const doubled = [...brands, ...brands];

export default function BrandsStrip() {
  return (
    <div className="mt-16 pt-10 border-t border-slate-200/70">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
        Toutes marques · Toutes générations
      </p>

      {/* Marquee wrapper */}
      <div
        className="relative overflow-hidden"
        aria-label="Marques prises en charge"
      >
        {/* Left / right fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f8fafc] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f8fafc] to-transparent z-10" />

        <div className="flex gap-10 items-center animate-marquee whitespace-nowrap">
          {doubled.map(({ name, file }, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-shrink-0 w-14 h-14 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title={name}
            >
              <Image
                src={`/images/brands/${file}`}
                alt={name}
                width={56}
                height={56}
                className="object-contain w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
