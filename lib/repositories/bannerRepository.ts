import type { Banner } from "@/types";
import { SUPABASE_ENABLED, getReadClient } from "@/lib/supabase/readClient";
import { mapBanner } from "@/lib/supabase/mappers";

async function getActiveSupabase(garageId: string): Promise<Banner | null> {
  const { data, error } = await getReadClient()
    .from("banners")
    .select("*")
    .eq("garage_id", garageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBanner(data) : null;
}

export const bannerRepository = {
  get: async (): Promise<Banner | null> => {
    if (SUPABASE_ENABLED) {
      const garageId = process.env.NEXT_PUBLIC_GARAGE_ID;
      if (!garageId) return null;
      return getActiveSupabase(garageId);
    }
    return null;
  },
};
