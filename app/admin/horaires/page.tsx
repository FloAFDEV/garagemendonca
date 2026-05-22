"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { Clock, Save, Loader2, CheckCircle2, AlertCircle, CalendarOff } from "lucide-react";
import clsx from "clsx";
import type { GarageOpeningHours, GarageDay, ClosureNotice } from "@/types";
import { getGarageAction, updateOpeningHoursAction, updateClosureAction } from "./actions";

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
  const [closure, setClosure] = useState<ClosureNotice>({ active: false, message: "", end_date: "" });
  const [closureStatus, setClosureStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    getGarageAction().then((garage) => {
      if (garage?.opening_hours) setHours(garage.opening_hours);
      if (garage?.closure_notice) setClosure(garage.closure_notice);
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

  const handleSaveClosure = async () => {
    setClosureStatus("saving");
    const result = await updateClosureAction(closure);
    setClosureStatus(result.ok ? "saved" : "error");
    if (result.ok) setTimeout(() => setClosureStatus("idle"), 2500);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className={clsx("font-heading font-medium text-xl", t.txt)}>
            Horaires d&apos;ouverture
          </h2>
          <p className={clsx("text-sm mt-1", t.txtMuted)}>
            Affiché dans le footer et la page contact.
          </p>
        </div>

        <div className={clsx("rounded-2xl border p-5 space-y-4", t.surface, t.border)}>
          <h3 className={clsx("font-heading font-normal mb-3 tracking-widest flex items-center gap-2", t.txt)}>
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
                      "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl px-4 py-3 transition-colors",
                      open ? t.surface : "opacity-60",
                      t.border,
                      "border",
                    )}
                  >
                    {/* Ligne 1 : toggle + nom du jour + badge Fermé (mobile) */}
                    <div className="flex items-center gap-3">
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
                      <span className={clsx("sm:w-24 text-sm font-medium flex-shrink-0 flex-1 sm:flex-none", t.txt)}>
                        {label}
                      </span>

                      {/* Badge Fermé — visible sur mobile inline, masqué quand open */}
                      {!open && (
                        <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full sm:hidden", t.txtSubtle, "bg-slate-100 dark:bg-slate-700")}>
                          Fermé
                        </span>
                      )}
                    </div>

                    {/* Horaires ou badge Fermé (desktop) */}
                    {open && dayHours ? (
                      <div className="flex items-center gap-2 flex-1 ml-8 sm:ml-0">
                        <input
                          type="time"
                          value={dayHours.open}
                          onChange={(e) => setTime(key, "open", e.target.value)}
                          className={clsx(
                            "flex-1 sm:flex-none text-sm rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-brand-500",
                            t.inputClass,
                          )}
                          aria-label={`${label} — heure d'ouverture`}
                        />
                        <span className={clsx("text-xs flex-shrink-0", t.txtSubtle)}>→</span>
                        <input
                          type="time"
                          value={dayHours.close}
                          onChange={(e) => setTime(key, "close", e.target.value)}
                          className={clsx(
                            "flex-1 sm:flex-none text-sm rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-brand-500",
                            t.inputClass,
                          )}
                          aria-label={`${label} — heure de fermeture`}
                        />
                        {dayHours.open >= dayHours.close && (
                          <span className="text-xs text-amber-500 flex items-center gap-1 flex-shrink-0">
                            <AlertCircle size={11} />
                            <span className="hidden sm:inline">Vérifier</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline-flex", t.txtSubtle, "bg-slate-100 dark:bg-slate-700")}>
                        Fermé
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Fermeture exceptionnelle ── */}
        <div className={clsx("rounded-2xl border p-5 space-y-4", t.surface, t.border)}>
          <div className="flex items-center justify-between">
            <h3 className={clsx("font-heading font-normal tracking-widest flex items-center gap-2", t.txt)}>
              <CalendarOff size={16} />
              Fermeture exceptionnelle
            </h3>
            <button
              type="button"
              onClick={() => setClosure((c) => ({ ...c, active: !c.active }))}
              className={clsx(
                "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                closure.active ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600",
              )}
              aria-checked={closure.active}
              role="switch"
              aria-label="Activer la fermeture exceptionnelle"
            >
              <span className={clsx(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                closure.active ? "translate-x-4" : "translate-x-0",
              )} />
            </button>
          </div>

          {closure.active && (
            <div className="space-y-3 pt-1">
              <div>
                <label className={clsx("block text-xs font-medium mb-1.5", t.txtMuted)}>
                  Message affiché dans le footer
                </label>
                <input
                  type="text"
                  value={closure.message}
                  onChange={(e) => setClosure((c) => ({ ...c, message: e.target.value }))}
                  placeholder="Ex : Fermés du 1er au 15 août pour congés estivaux"
                  className={clsx("w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-brand-500", t.inputClass)}
                />
              </div>
              <div>
                <label className={clsx("block text-xs font-medium mb-1.5", t.txtMuted)}>
                  Date de réouverture <span className={clsx("font-normal", t.txtSubtle)}>(optionnel)</span>
                </label>
                <input
                  type="date"
                  value={closure.end_date ?? ""}
                  onChange={(e) => setClosure((c) => ({ ...c, end_date: e.target.value }))}
                  className={clsx("text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-brand-500", t.inputClass)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveClosure}
              disabled={closureStatus !== "idle"}
              className="btn-primary text-sm py-2 px-5"
            >
              {closureStatus === "saving" ? (
                <><Loader2 size={14} className="animate-spin" />Enregistrement…</>
              ) : closureStatus === "saved" ? (
                <><CheckCircle2 size={14} />Enregistré !</>
              ) : closureStatus === "error" ? (
                <><AlertCircle size={14} />Erreur</>
              ) : (
                <><Save size={14} />Enregistrer</>
              )}
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus !== "idle" || loading}
            className="btn-primary text-sm py-2.5 px-7"
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
