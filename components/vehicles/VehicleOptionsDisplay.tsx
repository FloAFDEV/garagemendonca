import { OPTION_CATEGORIES, countActiveOptions, getEquipmentLabel } from "@/lib/vehicleOptions";
import type { VehicleOptions } from "@/types";
import type { LucideIcon } from "lucide-react";

interface Props {
  options: VehicleOptions;
}

function CategorySection({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <div className="space-y-3">
      {/* En-tête catégorie */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-brand-50 border border-brand-100 rounded-md flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-brand-600" strokeWidth={2} />
        </div>
        <span className="ty-label text-slate-400">
          {label}
        </span>
      </div>

      {/* Badges options */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VehicleOptionsDisplay({ options }: Props) {
  const equipmentLabel = getEquipmentLabel(options);
  const totalActive = countActiveOptions(options);

  // Construire la liste des catégories actives avec leurs options actives
  const activeCategories = OPTION_CATEGORIES.map((cat) => {
    const activeItems = cat.options
      .filter((opt) => options[opt.key] === true)
      .map((opt) => {
        // Cas spécial : jantes_alliage → afficher la taille si présente
        if (opt.key === "jantes_alliage" && options.taille_jantes) {
          return `${opt.label} (${options.taille_jantes}")`;
        }
        return opt.label;
      });
    return { ...cat, activeItems };
  }).filter((cat) => cat.activeItems.length > 0);

  if (activeCategories.length === 0 && !options.autres_options) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 md:p-10">
      {/* En-tête section */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <h2 className="ty-subheading text-[#0f172a] text-xl">
          Équipements &amp; Options
        </h2>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {equipmentLabel && (
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                equipmentLabel === "Full options"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              {equipmentLabel}
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">
            {totalActive} option{totalActive > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grille par catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            items={cat.activeItems}
          />
        ))}
      </div>

      {/* Options libres — toujours en dernier */}
      {options.autres_options && (
        <div className="mt-8 pt-8 border-t border-slate-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="ty-label text-slate-400">
              Autres équipements
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {options.autres_options}
          </p>
        </div>
      )}
    </div>
  );
}
