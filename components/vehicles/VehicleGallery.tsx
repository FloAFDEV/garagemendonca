"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface VehicleGalleryProps {
  images: string[];
  vehicleName: string;
}

export default function VehicleGallery({ images, vehicleName }: VehicleGalleryProps) {
  const [active, setActive] = useState(0);

  const prev = useCallback(() => setActive((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <div className="space-y-3">
      {/* ── Image principale ── */}
      <div
        className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 shadow-lg group"
        role="region"
        aria-label={`Galerie photo — ${vehicleName}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <Image
          key={active}
          src={images[active]}
          alt={`${vehicleName} — photo ${active + 1} sur ${images.length}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority={active === 0}
        />

        {/* Overlay subtle + zoom hint */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          <ZoomIn size={16} className="text-white" />
        </div>

        {/* Compteur */}
        {images.length > 1 && (
          <div
            className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full"
            aria-live="polite"
            aria-atomic="true"
          >
            {active + 1} / {images.length}
          </div>
        )}

        {/* Flèches navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Photo précédente"
            >
              <ChevronLeft size={18} className="text-[#0f172a]" aria-hidden="true" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Photo suivante"
            >
              <ChevronRight size={18} className="text-[#0f172a]" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)` }}
          role="list"
          aria-label="Vignettes"
        >
          {images.map((src, idx) => (
            <button
              key={src}
              role="listitem"
              onClick={() => setActive(idx)}
              aria-label={`Voir photo ${idx + 1}`}
              aria-pressed={active === idx}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                active === idx
                  ? "ring-2 ring-brand-500 ring-offset-2 scale-[0.97]"
                  : "hover:opacity-90 hover:scale-[0.97] opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${vehicleName} — vignette ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 13vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
