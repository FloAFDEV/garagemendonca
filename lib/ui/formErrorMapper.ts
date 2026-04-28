/**
 * Utilitaires pour mapper les erreurs (Zod + AppError) vers les composants UI.
 *
 * Compatible avec react-hook-form setError() et les messages inline.
 */

import type { AppError } from "@/lib/errors/supabaseErrorParser";

// ─── Type union des erreurs retournées par les safe-actions ──────

type ZodLike = {
  _errors?: string[];
  [key: string]: unknown;
};

type AnyError = AppError | ZodLike | string | null | undefined;

// ─────────────────────────────────────────────────────────────────
//  extractGlobalError — message d'erreur racine pour toast / alert
// ─────────────────────────────────────────────────────────────────

export function extractGlobalError(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;

  // AppError (code + message)
  if (typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message;
  }

  // ZodFormattedError (_errors à la racine)
  if (typeof err === "object" && "_errors" in err) {
    const root = (err as ZodLike)._errors;
    if (Array.isArray(root) && root.length > 0) return root[0];
  }

  return "Une erreur inattendue est survenue.";
}

// ─────────────────────────────────────────────────────────────────
//  extractFieldErrors — dictionnaire field → message pour react-hook-form
// ─────────────────────────────────────────────────────────────────

export function extractFieldErrors(err: AnyError): Record<string, string> {
  if (!err || typeof err !== "object") return {};

  // AppError avec field ciblé
  if ("code" in err && "field" in err && typeof err.field === "string") {
    const e = err as AppError;
    return e.field ? { [e.field]: e.message } : {};
  }

  // ZodFormattedError — parcours récursif premier niveau
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(err)) {
    if (key === "_errors") continue;
    if (
      value &&
      typeof value === "object" &&
      "_errors" in value &&
      Array.isArray((value as ZodLike)._errors) &&
      (value as ZodLike)._errors!.length > 0
    ) {
      result[key] = (value as ZodLike)._errors![0];
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
//  getFieldError — accès direct à l'erreur d'un champ précis
// ─────────────────────────────────────────────────────────────────

export function getFieldError(err: AnyError, field: string): string | undefined {
  if (!err || typeof err !== "object") return undefined;

  const nested = (err as Record<string, unknown>)[field];
  if (
    nested &&
    typeof nested === "object" &&
    "_errors" in nested &&
    Array.isArray((nested as ZodLike)._errors)
  ) {
    return (nested as ZodLike)._errors![0];
  }

  return undefined;
}

// ─────────────────────────────────────────────────────────────────
//  zodResolver minimal — compatible Zod v4 + react-hook-form
// ─────────────────────────────────────────────────────────────────

import type { Resolver, FieldValues } from "react-hook-form";
import type { ZodType } from "zod";

export function buildZodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (async (values: T): Promise<any> => {
    const result = schema.safeParse(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors };
  }) as Resolver<T>;
}
