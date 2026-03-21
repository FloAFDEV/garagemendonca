"use client";

import { OPTION_CATEGORIES, countActiveOptions } from "@/lib/vehicleOptions";
import type { VehicleOptions } from "@/types";

interface Props {
  value: VehicleOptions;
  onChange: (opts: VehicleOptions) => void;
}

export default function VehicleOptionsForm({ value, onChange }: Props) {
  const activeCount = countActiveOptions(value);

  function toggle(key: keyof VehicleOptions, checked: boolean) {
    onChange({ ...value, [key]: checked || undefined });
  }

  function setExtra(key: keyof VehicleOptions, val: string) {
    const num = parseInt(val, 10);
    onChange({ ...value, [key]: isNaN(num) ? undefined : num });
  }

  function setAutresOptions(text: string) {
    onChange({ ...value, autres_options: text || undefined });
  }

  return (
    <div className="space-y-8">
      {/* Compteur d'options actives */}
      {activeCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
          <span className="text-brand-400 font-medium text-sm">
            {activeCount} option{activeCount > 1 ? "s" : ""} sélectionnée{activeCount > 1 ? "s" : ""}
          </span>
          {activeCount > 25 && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">
              Full options
            </span>
          )}
          {activeCount > 15 && activeCount <= 25 && (
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
              Très bien équipé
            </span>
          )}
        </div>
      )}

      {/* Catégories */}
      {OPTION_CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.id} className="space-y-4">
            {/* Titre catégorie */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-brand-400" />
              </div>
              <h4 className="font-heading font-normal text-white text-sm tracking-widest">
                {category.label}
              </h4>
              <div className="flex-1 h-px bg-dark-700" />
            </div>

            {/* Grille d'options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {category.options.map((opt) => {
                const isChecked = !!value[opt.key];
                return (
                  <div key={opt.key} className="space-y-2">
                    {/* Checkbox ligne */}
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                        isChecked
                          ? "bg-brand-500/10 border-brand-500/30 text-white"
                          : "bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600 hover:text-dark-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={(e) => toggle(opt.key, e.target.checked)}
                      />
                      {/* Custom checkbox */}
                      <span
                        className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-brand-500 border-brand-500"
                            : "border-dark-500"
                        }`}
                        aria-hidden="true"
                      >
                        {isChecked && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path
                              d="M1 3.5L3.5 6L8 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-xs font-medium leading-snug">
                        {opt.label}
                      </span>
                    </label>

                    {/* Champ extra (ex: taille jantes) */}
                    {isChecked && opt.extraField && (
                      <div className="ml-3 flex items-center gap-2">
                        <label className="text-xs text-dark-400 font-medium whitespace-nowrap">
                          {opt.extraField.label} :
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={opt.extraField.min}
                            max={opt.extraField.max}
                            value={
                              (value[opt.extraField.key] as number | undefined) ?? ""
                            }
                            onChange={(e) =>
                              setExtra(opt.extraField!.key, e.target.value)
                            }
                            className="w-20 bg-dark-800 border border-dark-600 focus:border-brand-500 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none transition-colors"
                            placeholder={opt.extraField.min?.toString()}
                          />
                          {opt.extraField.unit && (
                            <span className="text-xs text-dark-500 font-medium">
                              {opt.extraField.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Options libres */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 text-sm font-medium">+</span>
          </div>
          <h4 className="font-heading font-normal text-white text-sm tracking-widest">
            Options non répertoriées
          </h4>
          <div className="flex-1 h-px bg-dark-700" />
        </div>
        <textarea
          rows={3}
          placeholder="Ex : Pack hiver, échappement sport, peinture métallisée Midnight Blue…"
          value={value.autres_options ?? ""}
          onChange={(e) => setAutresOptions(e.target.value)}
          className="w-full bg-dark-800 border border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm resize-none"
        />
        <p className="text-dark-500 text-xs">
          Séparez plusieurs options par une virgule ou un saut de ligne.
        </p>
      </div>
    </div>
  );
}
