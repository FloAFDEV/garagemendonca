import { ArrowLeft } from "lucide-react";
import { fetchGarageByIdAction } from "@/lib/safe-actions/fetchGarage";
import type { GarageOpeningHours } from "@/types";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

// Jours d'ouverture triés
const DAY_ORDER = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
const DAY_SHORT: Record<string, string> = {
  lundi: "Lun", mardi: "Mar", mercredi: "Mer", jeudi: "Jeu",
  vendredi: "Ven", samedi: "Sam", dimanche: "Dim",
};

function formatHours(h: string) {
  return h.replace(":00", "h").replace(/:(\d{2})$/, "h$1");
}

function formatOpeningHours(hours: GarageOpeningHours): string {
  // Groupe les jours consécutifs avec les mêmes horaires
  const segments: string[] = [];
  let groupStart: string | null = null;
  let groupEnd: string | null = null;
  let groupSlot: string | null = null;

  for (const day of DAY_ORDER) {
    const slot = hours[day];
    const slotStr = slot ? `${formatHours(slot.open)}–${formatHours(slot.close)}` : null;

    if (slotStr === groupSlot) {
      groupEnd = day;
    } else {
      if (groupStart && groupSlot) {
        const label = groupEnd && groupEnd !== groupStart
          ? `${DAY_SHORT[groupStart]}–${DAY_SHORT[groupEnd]}`
          : DAY_SHORT[groupStart];
        segments.push(`${label} ${groupSlot}`);
      }
      groupStart = slotStr ? day : null;
      groupEnd   = slotStr ? day : null;
      groupSlot  = slotStr;
    }
  }
  // flush dernier groupe
  if (groupStart && groupSlot) {
    const label = groupEnd && groupEnd !== groupStart
      ? `${DAY_SHORT[groupStart]}–${DAY_SHORT[groupEnd]}`
      : DAY_SHORT[groupStart];
    segments.push(`${label} ${groupSlot}`);
  }
  return segments.join(" · ") || "Nous contacter pour les horaires";
}

export default async function GarageAddressBlock() {
  const garage = GARAGE_ID ? await fetchGarageByIdAction(GARAGE_ID).catch(() => null) : null;

  const name    = garage?.name    ?? "Garage Mendonca";
  const address = garage?.address ?? "6 Avenue de la Mouyssaguese";
  const city    = garage
    ? `${garage.postalCode ?? "31280"} ${garage.city ?? "Drémil-Lafage"}`
    : "31280 Drémil-Lafage";
  const mapsUrl = garage?.googleMapsUrl ?? "https://maps.google.com/maps?q=Garage+Auto+Mendonca+Dr%C3%A9mil-Lafage";
  const hoursStr = garage?.openingHours
    ? formatOpeningHours(garage.openingHours)
    : "Lun–Jeu 8h–19h · Ven 8h–18h";

  return (
    <div className="bg-[#0f172a] rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
        <ArrowLeft size={80} className="rotate-135" />
      </div>
      <div className="ty-label text-brand-400 mb-4 text-base">{name}</div>
      <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
        {address}<br />
        {city}<br />
        {hoursStr}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-brand-400 hover:text-red-500 text-xs font-medium transition-colors uppercase tracking-widest"
      >
        Itinéraire Maps{" "}
        <ArrowLeft size={12} className="rotate-180" />
      </a>
    </div>
  );
}
