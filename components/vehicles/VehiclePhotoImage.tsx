/**
 * VehiclePhotoImage
 * ─────────────────────────────────────────────────────────────────
 * Point d'entrée unique pour le rendu des photos véhicule.
 * Applique object-[center_60%] : léger décalage vers le bas qui :
 *   — améliore les photos intérieures (sièges/console mieux visibles)
 *   — n'altère pas sensiblement les photos extérieures
 *
 * Évolution V2 prévue : prop `photoType` (exterior/interior/detail)
 * avec colonne DB dédiée pour un smart crop par image.
 */

import Image from "next/image";

interface VehiclePhotoImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  /** Classes additionnelles — transitions, grayscale, scale… */
  className?: string;
}

export default function VehiclePhotoImage({
  src,
  alt,
  fill = true,
  sizes,
  priority = false,
  quality = 75,
  className = "",
}: VehiclePhotoImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={`object-cover object-[center_60%] ${className}`.trim()}
    />
  );
}
