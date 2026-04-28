/**
 * Wrapper typé pour appeler des server actions depuis les mutations React Query.
 *
 * Normalise les réponses { data } | { error } en un format uniforme.
 * Isole les composants de la structure interne des actions.
 *
 * Usage dans un mutation hook :
 *   const result = await callAction(() => createVehicleAction(input));
 *   if (result.error) throw new Error(result.error);
 *   return result.data;
 */

import type { AppError } from "@/lib/errors/supabaseErrorParser";

// ─── Type de retour normalisé ─────────────────────────────────────

export type ActionResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ─── callAction — wrapper universel ──────────────────────────────

export async function callAction<T>(
  action: () => Promise<{ data: T } | { error: AppError | Record<string, unknown> }>,
): Promise<ActionResponse<T>> {
  try {
    const result = await action();

    if ("error" in result && result.error) {
      const err = result.error as AppError;
      return { error: err.message ?? "Une erreur inattendue est survenue." };
    }

    return { data: (result as { data: T }).data };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Une erreur inattendue est survenue." };
  }
}

// ─── isActionError — type guard ───────────────────────────────────

export function isActionError<T>(
  result: ActionResponse<T>,
): result is { error: string } {
  return "error" in result && !!result.error;
}

// ─── throwOnError — pour useMutation mutationFn ──────────────────

export async function throwOnError<T>(
  action: () => Promise<{ data: T } | { error: AppError | Record<string, unknown> }>,
): Promise<T> {
  const result = await callAction(action);
  if (isActionError(result)) throw new Error(result.error);
  return result.data;
}
