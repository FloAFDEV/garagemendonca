/**
 * Transforme les erreurs brutes Supabase / PostgreSQL en messages UI propres.
 *
 * Usage dans une safe-action :
 *   } catch (err) {
 *     return { error: parseSupabaseError(err) };
 *   }
 */

// ─────────────────────────────────────────────────────────────────
//  Type normalisé retourné par toutes les actions
// ─────────────────────────────────────────────────────────────────

export interface AppError {
  code: string;
  message: string;
  field?: string;   // champ concerné si erreur de validation DB
  raw?: unknown;    // erreur originale (dev/debug uniquement)
}

// ─────────────────────────────────────────────────────────────────
//  Codes PostgreSQL → messages UI
// ─────────────────────────────────────────────────────────────────

const PG_ERROR_MAP: Record<string, { code: string; message: string }> = {
  // Unicité
  "23505": { code: "CONFLICT",     message: "Cette valeur existe déjà." },
  // Clé étrangère invalide
  "23503": { code: "REF_INVALID",  message: "Référence invalide ou introuvable." },
  // Violation de contrainte CHECK
  "23514": { code: "CONSTRAINT",   message: "Valeur non autorisée." },
  // NOT NULL manquant
  "23502": { code: "REQUIRED",     message: "Un champ obligatoire est manquant." },
  // Deadlock
  "40P01": { code: "DEADLOCK",     message: "Conflit de transaction, réessayez." },
  // Timeout
  "57014": { code: "TIMEOUT",      message: "Requête trop longue, réessayez." },
  // RLS / permission refusée
  "42501": { code: "FORBIDDEN",    message: "Action non autorisée." },
  // Objet introuvable
  "42P01": { code: "NOT_FOUND",    message: "Ressource introuvable." },
};

// Contraintes nommées → champ et message ciblé
const NAMED_CONSTRAINT_MAP: Record<string, { field: string; message: string }> = {
  uniq_vehicle_slug_per_garage_ci: { field: "slug",     message: "Ce slug est déjà utilisé pour ce garage." },
  uniq_category_slug_per_garage:   { field: "slug",     message: "Ce slug de catégorie existe déjà." },
  uniq_service_slug_per_garage:    { field: "slug",     message: "Ce slug de service existe déjà." },
  uniq_primary_image_per_vehicle:  { field: "is_primary", message: "Ce véhicule a déjà une image principale." },
};

// ─────────────────────────────────────────────────────────────────
//  Parser principal
// ─────────────────────────────────────────────────────────────────

export function parseSupabaseError(err: unknown): AppError {
  if (!err || typeof err !== "object") {
    return { code: "UNKNOWN", message: "Une erreur inattendue est survenue.", raw: err };
  }

  const e = err as Record<string, unknown>;
  const code    = (e.code    ?? e.error_code ?? "") as string;
  const message = (e.message ?? e.error      ?? "") as string;
  const details = (e.details ?? "") as string;

  // 1. Contrainte nommée (unicité, trigger, etc.)
  if (code === "23505" || code === "23514") {
    for (const [constraint, meta] of Object.entries(NAMED_CONSTRAINT_MAP)) {
      if (details.includes(constraint) || message.includes(constraint)) {
        return { code: "CONFLICT", message: meta.message, field: meta.field, raw: err };
      }
    }
  }

  // 2. Code PostgreSQL connu
  if (code && PG_ERROR_MAP[code]) {
    const mapped = PG_ERROR_MAP[code];
    return { code: mapped.code, message: mapped.message, raw: err };
  }

  // 3. Codes HTTP Supabase REST
  const status = (e.status ?? e.statusCode ?? 0) as number;
  if (status === 401) return { code: "UNAUTHORIZED", message: "Session expirée, reconnectez-vous.", raw: err };
  if (status === 403) return { code: "FORBIDDEN",    message: "Action non autorisée.",              raw: err };
  if (status === 404) return { code: "NOT_FOUND",    message: "Ressource introuvable.",             raw: err };
  if (status === 409) return { code: "CONFLICT",     message: "Conflit de données.",                raw: err };
  if (status >= 500)  return { code: "SERVER_ERROR", message: "Erreur serveur, réessayez.",         raw: err };

  // 4. Trigger custom (RAISE EXCEPTION)
  if (message.includes("vehicle_id and garage_id mismatch")) {
    return { code: "CONSTRAINT", message: "L'image n'appartient pas au véhicule spécifié.", raw: err };
  }

  // 5. Fallback
  return {
    code: "UNKNOWN",
    message: message || "Une erreur inattendue est survenue.",
    raw: err,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Helper : vérifier si une AppError est une erreur de conflit
// ─────────────────────────────────────────────────────────────────

export function isConflictError(err: AppError): boolean {
  return err.code === "CONFLICT";
}

export function isForbiddenError(err: AppError): boolean {
  return err.code === "FORBIDDEN" || err.code === "UNAUTHORIZED";
}
