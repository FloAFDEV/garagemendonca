"use server";

import { garageDb } from "@/lib/db/garage.repository";
import { toUIGarage } from "@/types/ui";
import type { UIGarage } from "@/types/ui";

export async function fetchGarageByIdAction(id: string): Promise<UIGarage | null> {
  const garage = await garageDb.getById(id);
  return garage ? toUIGarage(garage) : null;
}

export async function fetchGarageBySlugAction(slug: string): Promise<UIGarage | null> {
  const garage = await garageDb.getBySlug(slug);
  return garage ? toUIGarage(garage) : null;
}
