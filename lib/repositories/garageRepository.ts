/**
 * Garage Repository — source de vérité unique.
 *
 * DEMO_MODE=true  → données statiques (lib/data.ts).
 * SUPABASE_ENABLED → garageDb exclusif, aucun fallback silencieux.
 */

import type { Garage } from "@/types";
import { garages as demoGarages } from "@/lib/data";
import { DEMO_MODE, SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { garageDb } from "@/lib/db/garage.repository";

export const garageRepository = {
  getAll: async (): Promise<Garage[]> => {
    if (SUPABASE_ENABLED) return garageDb.list();
    if (DEMO_MODE)        return [...demoGarages];
    throw new Error("[garageRepository] Aucune source de données : configurer Supabase ou NEXT_PUBLIC_DEMO_MODE=true");
  },

  getById: async (idOrSlug: string): Promise<Garage | null> => {
    if (SUPABASE_ENABLED) {
      const byId = await garageDb.getById(idOrSlug);
      if (byId) return byId;
      return garageDb.getBySlug(idOrSlug);
    }
    if (DEMO_MODE) {
      return demoGarages.find((g) => g.id === idOrSlug || g.slug === idOrSlug) ?? null;
    }
    throw new Error("[garageRepository] Aucune source de données");
  },
};
