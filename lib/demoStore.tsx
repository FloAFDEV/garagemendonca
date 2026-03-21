"use client";

/**
 * Demo Store — Context React partagé entre toutes les pages admin.
 * Remplace les Server Actions pour la démo locale.
 * État initialisé depuis lib/data.ts, mutations 100% client-side.
 * Toast intégré : affiché sur toute mutation.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { vehicles as mockVehicles } from "@/lib/data";
import type {
  Vehicle,
  VehicleCreateInput,
  VehicleUpdateInput,
} from "@/types";

// ── Toast ──────────────────────────────────────────────────────────

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let _toastId = 0;

// ── Store ──────────────────────────────────────────────────────────

export interface DemoStore {
  vehicles: Vehicle[];
  getVehicle: (id: string) => Vehicle | undefined;
  addVehicle: (input: VehicleCreateInput) => Vehicle;
  updateVehicle: (id: string, input: VehicleUpdateInput) => Vehicle;
  deleteVehicle: (id: string) => void;
  showToast: (message: string, type?: ToastItem["type"]) => void;
}

const Ctx = createContext<DemoStore | null>(null);

export function useDemoStore(): DemoStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemoStore must be inside DemoStoreProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([...mockVehicles]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastItem["type"] = "success") => {
      const id = ++_toastId;
      setToasts((p) => [...p.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );

  const getVehicle = useCallback(
    (id: string) => vehicles.find((v) => v.id === id),
    [vehicles],
  );

  const addVehicle = useCallback(
    (input: VehicleCreateInput): Vehicle => {
      const v: Vehicle = {
        ...input,
        id: `demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVehicles((p) => [v, ...p]);
      showToast("Véhicule ajouté — données sauvegardées localement");
      return v;
    },
    [showToast],
  );

  const updateVehicle = useCallback(
    (id: string, input: VehicleUpdateInput): Vehicle => {
      let result!: Vehicle;
      setVehicles((p) =>
        p.map((v) => {
          if (v.id !== id) return v;
          result = { ...v, ...input, updatedAt: new Date().toISOString() };
          return result;
        }),
      );
      showToast("Modifications sauvegardées — mode démo");
      return result;
    },
    [showToast],
  );

  const deleteVehicle = useCallback(
    (id: string) => {
      setVehicles((p) => p.filter((v) => v.id !== id));
      showToast("Véhicule supprimé", "info");
    },
    [showToast],
  );

  return (
    <Ctx.Provider
      value={{
        vehicles,
        getVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        showToast,
      }}
    >
      {children}

      {/* ── Toast stack ──────────────────────────────────────── */}
      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <DemoToast key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

// ── Toast component ────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastItem["type"], string> = {
  success: "bg-emerald-600 border-emerald-500/50",
  error: "bg-red-600 border-red-500/50",
  info: "bg-slate-700 border-slate-600/50",
};

function DemoToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className={[
        "pointer-events-auto flex items-start gap-3",
        TOAST_STYLES[toast.type],
        "border text-white text-sm px-4 py-3 rounded-2xl shadow-2xl",
        "max-w-[340px] min-w-[200px]",
      ].join(" ")}
      role="status"
    >
      {/* Icon */}
      <span className="mt-0.5 w-4 h-4 flex-shrink-0 opacity-80">
        {toast.type === "success" ? (
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <circle cx="8" cy="8" r="7" stroke="white" strokeOpacity=".25" strokeWidth="1.5" />
            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : toast.type === "error" ? (
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <circle cx="8" cy="8" r="7" stroke="white" strokeOpacity=".25" strokeWidth="1.5" />
            <path d="M6 6l4 4M10 6l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <circle cx="8" cy="8" r="7" stroke="white" strokeOpacity=".25" strokeWidth="1.5" />
            <path d="M8 7.5v4M8 5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="flex-1 font-medium leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/40 hover:text-white transition-colors flex-shrink-0 mt-0.5"
        aria-label="Fermer"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
