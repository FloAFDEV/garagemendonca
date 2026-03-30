"use server";

import { revalidatePath } from "next/cache";
import { serviceRepository } from "@/lib/repositories";
import type { Service } from "@/types";

export async function updateServiceAction(
  slug: string,
  data: Partial<Service>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await serviceRepository.update(slug, data);
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
