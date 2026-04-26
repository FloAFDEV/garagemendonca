/**
 * Abstraction centralisée des toasts.
 *
 * Utilise sonner en interne. Si la lib change, seul ce fichier est mis à jour.
 * Les composants n'importent jamais directement depuis "sonner".
 */

import { toast as sonnerToast } from "sonner";
import type { AppError } from "@/lib/errors/supabaseErrorParser";

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  loading: (message: string) =>
    sonnerToast.loading(message),

  dismiss: (id?: string | number) =>
    sonnerToast.dismiss(id),

  // Helpers métier
  vehicleCreated: (label: string) =>
    sonnerToast.success(`${label} ajouté avec succès.`),

  vehicleUpdated: () =>
    sonnerToast.success("Véhicule mis à jour."),

  vehicleDeleted: () =>
    sonnerToast.success("Véhicule supprimé."),

  messageSent: () =>
    sonnerToast.success("Message envoyé.", {
      description: "Nous vous répondrons dans les plus brefs délais.",
    }),

  actionError: (err: AppError | unknown) => {
    if (err && typeof err === "object" && "message" in err) {
      sonnerToast.error((err as AppError).message);
    } else {
      sonnerToast.error("Une erreur inattendue est survenue.");
    }
  },
};
