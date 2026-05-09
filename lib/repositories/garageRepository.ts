import type { Garage } from "@/types";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { garageDb } from "@/lib/db/garage.repository";

export const garageRepository = {
  getAll: async (): Promise<Garage[]> => {
    if (SUPABASE_ENABLED) return garageDb.list();
    throw new Error("[garageRepository] Aucune source de données : configurer Supabase");
  },

  getById: async (idOrSlug: string): Promise<Garage | null> => {
    if (SUPABASE_ENABLED) {
      const byId = await garageDb.getById(idOrSlug);
      if (byId) return byId;
      return garageDb.getBySlug(idOrSlug);
    }
    throw new Error("[garageRepository] Aucune source de données");
  },
};
