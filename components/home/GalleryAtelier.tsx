const photos = [
  {
    src: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80",
    alt: "Mécanicien au travail sur un moteur",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
    alt: "Véhicule sur pont élévateur",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    alt: "Diagnostic électronique automobile",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80",
    alt: "Outils de mécanique professionnels",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
    alt: "Atelier automobile équipé",
    span: "",
  },
];

export default function GalleryAtelier() {
  return (
    <section className="py-24 bg-dark-50">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <div className="section-divider" />
            <span className="eyebrow">Notre atelier</span>
            <h2 className="section-title">
              Un équipement<br />professionnel
            </h2>
          </div>
          <p className="text-dark-500 text-sm leading-relaxed max-w-sm mt-4 lg:mt-0">
            Des outils de dernière génération, un atelier bien organisé.
            La qualité de notre travail se voit dès l&apos;entrée dans nos locaux.
          </p>
        </div>

        {/* Grid photo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 h-auto lg:h-[520px]">
          {photos.map(({ src, alt, span }) => (
            <div
              key={src}
              className={`relative overflow-hidden rounded-lg bg-dark-200 group ${span}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay sur hover */}
              <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/25 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
