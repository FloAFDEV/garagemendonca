"use client";

import { useState } from "react";
import { User, Pencil, Check, X, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileWidgetProps {
  user: SupabaseUser;
  onUpdate?: (firstName: string) => void;
}

export default function ProfileWidget({ user, onUpdate }: ProfileWidgetProps) {
  const t = useAdminTokens();
  const currentFirst = (user.user_metadata?.first_name as string | undefined) ?? "";

  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState(currentFirst);
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    if (saving) return;
    const trimmed = value.trim();
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      data: { first_name: trimmed },
    });
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la mise à jour du profil.");
    } else {
      toast.success("Prénom mis à jour.");
      setEditing(false);
      onUpdate?.(trimmed);
    }
  };

  const handleCancel = () => {
    setValue(currentFirst);
    setEditing(false);
  };

  return (
    <div className={clsx("rounded-2xl border p-5", t.surface, t.border)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center bg-brand-500/10")}>
          <User size={16} className="text-brand-500" aria-hidden="true" />
        </div>
        <span className={clsx("text-sm font-medium", t.txt)}>Mon profil</span>
      </div>

      {/* Email — lecture seule */}
      <div className="mb-3">
        <p className={clsx("text-[11px] uppercase tracking-widest mb-1", t.txtSubtle)}>Email</p>
        <p className={clsx("text-sm truncate", t.txtMuted)}>{user.email}</p>
      </div>

      {/* Prénom — éditable */}
      <div>
        <p className={clsx("text-[11px] uppercase tracking-widest mb-1.5", t.txtSubtle)}>Prénom</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
              maxLength={40}
              placeholder="Votre prénom"
              className={clsx(
                "flex-1 min-w-0 border rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand-500 transition-colors",
                t.inputBg, t.inputBorder, t.inputText,
              )}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              aria-label="Enregistrer"
              className="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={handleCancel}
              aria-label="Annuler"
              className={clsx("p-1.5 rounded-lg transition-colors", t.hoverBgStrong, t.txtMuted)}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className={clsx("text-sm", currentFirst ? t.txt : t.txtFaint)}>
              {currentFirst || <span className="italic">Non défini</span>}
            </p>
            <button
              onClick={() => { setValue(currentFirst); setEditing(true); }}
              aria-label="Modifier le prénom"
              className={clsx("p-1.5 rounded-lg transition-colors", t.hoverBgStrong, t.txtMuted, "hover:text-brand-500")}
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
