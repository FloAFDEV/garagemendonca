import Link from "next/link";
import Image from "next/image";
import { Fuel, Gauge, Calendar, ArrowRight, Star } from "lucide-react";
import { Vehicle } from "@/types";
import Badge from "@/components/ui/Badge";

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
}

const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
  Essence: "orange",
  Diesel: "gray",
  Hybride: "green",
  Électrique: "green",
  GPL: "blue",
};

export default function VehicleCard({ vehicle, priority = false }: VehicleCardProps) {
  const altText = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.color} — ${vehicle.mileage.toLocaleString("fr-FR")} km`;
  const priceLabel = `${vehicle.price.toLocaleString("fr-FR")} euros`;

  return (
    <Link
      href={`/vehicules/${vehicle.id}`}
      className="card group block focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl"
      aria-label={`Voir le détail : ${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${priceLabel}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <Image
          src={vehicle.images[0]}
          alt={altText}
          fill
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Prix */}
        <div
          className="absolute top-3 right-3 bg-[#0f172a]/90 backdrop-blur-sm text-white font-heading font-black text-lg px-3 py-1.5 rounded-xl"
          aria-hidden="true"
        >
          {vehicle.price.toLocaleString("fr-FR")} €
        </div>
        {vehicle.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="orange">
              <Star size={11} className="fill-current" aria-hidden="true" />
              À la une
            </Badge>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-heading font-bold text-[#0f172a] text-xl leading-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-[#64748b] text-sm mt-1">{vehicle.color} · {vehicle.year}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col items-center bg-[#f8fafc] rounded-xl py-3 px-2">
            <Calendar size={15} className="text-brand-500 mb-1" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#334155]">{vehicle.year}</span>
          </div>
          <div className="flex flex-col items-center bg-[#f8fafc] rounded-xl py-3 px-2">
            <Gauge size={15} className="text-brand-500 mb-1" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#334155]">
              {vehicle.mileage.toLocaleString("fr-FR")} km
            </span>
          </div>
          <div className="flex flex-col items-center bg-[#f8fafc] rounded-xl py-3 px-2">
            <Fuel size={15} className="text-brand-500 mb-1" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#334155]">{vehicle.fuel}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant={fuelVariants[vehicle.fuel] ?? "gray"}>{vehicle.fuel}</Badge>
          <Badge variant="gray">{vehicle.transmission}</Badge>
          <Badge variant="gray">{vehicle.power} ch</Badge>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span
            className="font-heading font-black text-2xl text-[#0f172a]"
            aria-label={priceLabel}
          >
            {vehicle.price.toLocaleString("fr-FR")} €
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:text-brand-700 group-hover:gap-2.5 transition-all duration-200" aria-hidden="true">
            Voir le détail
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
