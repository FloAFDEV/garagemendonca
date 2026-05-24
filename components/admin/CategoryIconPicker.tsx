"use client";

import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { CATEGORY_ICON_LIST } from "@/lib/data/categoryIcons";
import { X } from "lucide-react";
import clsx from "clsx";

interface Props {
  value: string;               // nom de l'icône sélectionnée (ou "")
  onChange: (name: string) => void;
}

export default function CategoryIconPicker({ value, onChange }: Props) {
  const t = useAdminTokens();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {CATEGORY_ICON_LIST.map(({ name, label, Icon }) => {
          const selected = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(selected ? "" : name)}
              title={label}
              aria-label={label}
              aria-pressed={selected}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all text-[10px] leading-tight",
                selected
                  ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                  : clsx(
                      t.surface,
                      t.isDark ? "border-dark-600 hover:border-brand-500" : "border-slate-200 hover:border-brand-400",
                      t.txtSubtle,
                      t.hoverTxt,
                    ),
              )}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="truncate w-full text-center leading-none">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Effacer la sélection */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={clsx(
            "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors",
            t.txtSubtle, t.hoverBgStrong, t.hoverTxt,
          )}
        >
          <X size={11} aria-hidden="true" />
          Sans icône
        </button>
      )}
    </div>
  );
}
