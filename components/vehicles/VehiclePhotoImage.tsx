/**
 * VehiclePhotoImage
 * ─────────────────────────────────────────────────────────────────
 * Composant Image centralisé pour les photos véhicule.
 * Applique le bon object-position selon le type de photo :
 *   exterior → object-center        (carrosserie bien cadrée)
 *   interior → object-[center_65%]  (focus bas pour sièges/console)
 *   detail   → object-center        (neutre)
 *   null     → object-center        (défaut — préserve le comportement actuel)
 *
 * Règle : c'est le SEUL endroit où la logique de crop est définie.
 * Ne pas dupliquer object-position ailleurs dans les composants image.
 */

import Image from "next/image";
import type { PhotoType } from "@/types";

// ── Stratégie de cadrage par type ──────────────────────────────────
const POSITION_BY_TYPE: Record<NonNullable<PhotoType>, string> = {
  exterior: "object-center",       // 50% 50% — carrosserie centrée
  interior: "object-[center_65%]", // 50% 65% — sièges et console visibles
  detail:   "object-center",       // neutre — zoom sur pièce/détail
};

function resolvePosition(photoType: PhotoType | undefined): string {
  if (!photoType) return "object-center";
  return POSITION_BY_TYPE[photoType];
}

// ── Props ──────────────────────────────────────────────────────────
interface VehiclePhotoImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  /** Classes additionnelles — ne pas y mettre object-cover ni object-position */
  className?: string;
  /** Type de photo — détermine le cadrage CSS */
  photoType?: PhotoType;
}

// ── Composant ──────────────────────────────────────────────────────
export default function VehiclePhotoImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes,
  priority = false,
  quality = 75,
  className = "",
  photoType,
}: VehiclePhotoImageProps) {
  const position = resolvePosition(photoType);

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={`object-cover ${position} ${className}`.trim()}
    />
  );
}
