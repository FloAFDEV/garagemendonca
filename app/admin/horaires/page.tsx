"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { Clock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import type { GarageOpeningHours, GarageDay } from "@/types";
import { getGarageAction, updateOpeningHoursAction } from "./actions";

const DAYS: { key: GarageDay; label: string; short: string }[] = [
  { key: "lundi",    label: "Lundi",    short: "Lun" },
  { key: "mardi",    label: "Mardi",    short: "Mar" },
  { key: "mercredi", label: "Mercredi", short: "Mer" },
  { key: "jeudi",    label: "Jeudi",    short: "Jeu" },
  { key: "vendredi", label: "Vendredi", short: "Ven" },
  { key: "samedi",   label: "Samedi",   short: "Sam" },
  { key: "dimanche", label: "Dimanche", short: "Dim" },
];

const DEFAULT_HOURS: GarageOpeningHours = {
  lundi:    { open: "08:00", close: "19:00" },
  mardi:    { open: "08:00", close: "19:00" },
  mercredi: { open: "08:00", close: "19:00" },
  jeudi:    { open: "08:00", close: "19:00" },
  vendredi: { open: "08:00", close: "18:00" },
  samedi:   null,
  dimanche: null,
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AdminHorairesPage() {
  const t = useAdminTokens();
  const [hours, setHours] = useState<GarageOpeningHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    getGarageAction().then((garage) => {
      if (garage?.opening_hours) setHours(garage.opening_hours);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const isOpen = (day: GarageDay) => hours[day] !== null && hours[day] !== undefined;

  const toggleDay = (day: GarageDay) => {
    setHours((prev) => ({
      ...prev,
      [day]: isOpen(day) ? null : { open: "08:00", close: "18:00" },
    }));
  };

  const setTime = (day: GarageDay, field: "open" | "close", value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? { open: "08:00", close: "18:00" }), [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    const result = await updateOpeningHoursAction(hours);
    setSaveStatus(result.ok ? "saved" : "error");
    if (result.ok) setTimeout(() => setSaveStatus("idle"), 2500);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>
            Horaires d&apos;ouverture
          </h2>
          <p className={clsx("text-sm mt-1", t.txtMuted)}>
            Affiché dans le footer et la page contact.
          </p>
        </div>

        <div className={clsx("rounded-2xl border p-6 space-y-4", t.surface, t.border)}>
          <h3 className={clsx("font-heading font-normal mb-2 tracking-widest flex items-center gap-2", t.txt)}>
            <Clock size={16} />
            Planning hebdomadaire
          </h3>

          {loading ? (
            <div className="flex items-center gap-2 py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-brand-500" />
              <span className={clsx("text-sm", t.txtMuted)}>Chargement…</span>
            </div>
          ) : (
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => {
                const open = isOpen(key);
                const dayHours = hours[key];
                return (
                  <div
                    key={key}
                    className={clsx(
                      "flex items-center gap-4 rounded-xl px-4 py-3 transition-colors",
                      open ? t.surface : "opacity-60",
                      t.border,
                      "border",
                    )}
                  >
                    {/* Toggle ouvert/fermé */}
                    <button
                      type="button"
                      onClick={() => toggleDay(key)}
                      className={clsx(
                        "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                        open ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600",
                      )}
                      aria-checked={open}
                      role="switch"
                      aria-label={`${label} : ${open ? "ouvert" : "fermé"}`}
                    >
                      <span
                        className={clsx(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          open ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </button>

                    {/* Nom du jour */}
                    <span className={clsx("w-24 text-sm font-medium flex-shrink-0", t.txt)}>
                      {label}
                    </span>

                    {/* Horaires ou badge Fermé */}
                    {open && dayHours ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={dayHours.open}
                          onChange={(e) => setTime(key, "open", e.target.value)}
                          className={clsx(
                            "text-sm rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-brand-500",
                            t.inputClass,
                          )}
                          aria-label={`${label} — heure d'ouverture`}
                        />
                        <span className={clsx("text-xs", t.txtSubtle)}>→</span>
                        <input
                          type="time"
                          value={dayHours.close}
                          onChange={(e) => setTime(key, "close", e.target.value)}
                          className={clsx(
                            "text-sm rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-brand-500",
                            t.inputClass,
                          )}
                          aria-label={`${label} — heure de fermeture`}
                        />
                        {dayHours.open >= dayHours.close && (
                          <span className="text-xs text-amber-500 flex items-center gap-1 ml-1">
                            <AlertCircle size={11} />
                            Vérifier
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", t.txtSubtle, "bg-slate-100 dark:bg-slate-700")}>
                        Fermé
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus !== "idle" || loading}
            className="btn-primary text-sm py-3 px-8"
          >
            {saveStatus === "saving" ? (
              <><Loader2 size={16} className="animate-spin" />Enregistrement…</>
            ) : saveStatus === "saved" ? (
              <><CheckCircle2 size={16} />Enregistré !</>
            ) : saveStatus === "error" ? (
              <><AlertCircle size={16} />Erreur</>
            ) : (
              <><Save size={16} />Enregistrer les horaires</>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
