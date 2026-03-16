import Link from "next/link";
import Image from "next/image";
import { Fuel, Gauge, Calendar, ArrowRight, Zap } from "lucide-react";
import { Vehicle } from "@/types";
import Badge from "@/components/ui/Badge";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const fuelVariants: Record<string, "orange" | "green" | "blue" | "gray"> = {
  Essence: "orange",
  Diesel: "gray",
  Hybride: "green",
  Électrique: "green",
  GPL: "blue",
};

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehicules/${vehicle.id}`} className="card group block">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-100">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-dark-900/90 backdrop-blur-sm text-white font-heading font-black text-lg px-3 py-1.5 rounded-xl">
          {vehicle.price.toLocaleString("fr-FR")} €
        </div>
        {vehicle.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="orange">⭐ À la une</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-heading font-bold text-dark-900 text-xl leading-tight">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-dark-400 text-sm mt-1">{vehicle.color}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col items-center bg-dark-50 rounded-xl py-3 px-2">
            <Calendar size={15} className="text-brand-500 mb-1" />
            <span className="text-xs font-semibold text-dark-700">{vehicle.year}</span>
          </div>
          <div className="flex flex-col items-center bg-dark-50 rounded-xl py-3 px-2">
            <Gauge size={15} className="text-brand-500 mb-1" />
            <span className="text-xs font-semibold text-dark-700">
              {vehicle.mileage.toLocaleString("fr-FR")} km
            </span>
          </div>
          <div className="flex flex-col items-center bg-dark-50 rounded-xl py-3 px-2">
            <Fuel size={15} className="text-brand-500 mb-1" />
            <span className="text-xs font-semibold text-dark-700">{vehicle.fuel}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant={fuelVariants[vehicle.fuel] ?? "gray"}>
            {vehicle.fuel}
          </Badge>
          <Badge variant="gray">{vehicle.transmission}</Badge>
          <Badge variant="gray">{vehicle.power} ch</Badge>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-100">
          <span className="font-heading font-black text-2xl text-dark-900">
            {vehicle.price.toLocaleString("fr-FR")} €
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
            Voir le détail
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
