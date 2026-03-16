import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80",
    alt: "Mécanicien au travail sur un moteur",
    caption: "Atelier mécanique",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
    alt: "Véhicule sur pont élévateur",
    caption: "Pont élévateur",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    alt: "Diagnostic électronique automobile",
    caption: "Diagnostic électronique",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80",
    alt: "Outils de mécanique professionnels",
    caption: "Outillage professionnel",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
    alt: "Atelier automobile équipé",
    caption: "Espace de travail",
    span: "",
  },
];

export default function GalleryAtelier() {
  return (
    <section className="py-24 bg-dark-950">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
            <div>
              <div className="section-divider" />
              <span className="eyebrow-light">Notre atelier</span>
              <h2 className="section-title-light">
                Un équipement<br />professionnel
              </h2>
            </div>
            <p className="text-[#9ca3af] text-sm leading-relaxed max-w-sm mt-4 lg:mt-0">
              Des outils de dernière génération, un atelier organisé avec soin.
              La précision de notre travail se voit dès le premier regard.
            </p>
          </div>
        </AnimateOnScroll>

        {/* ── Grille photo ── */}
        <AnimateOnScroll delay={100}>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:h-[520px]">
            {photos.map(({ src, alt, caption, span }) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-xl bg-dark-800 group ${span}`}
              >
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-107"
                  style={{ minHeight: "180px" }}
                  loading="lazy"
                />

                {/* Overlay gradient dégradé bas */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-400"
                  aria-hidden="true"
                />

                {/* Caption */}
                <div className="absolute bottom-3 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white text-xs font-semibold">{caption}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
