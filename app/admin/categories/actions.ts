"use server";

import { requireAdminForGarage } from "@/lib/auth/getSession";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { getActiveGarageId } from "@/lib/config/garage";
import { categoryDb } from "@/lib/db/category.repository";
import { revalidatePath } from "next/cache";
import type { VehicleCategory } from "@/types";

const GARAGE_ID = getActiveGarageId();

async function assertAdmin() {
	await assertSameOrigin();
	const err = await requireAdminForGarage(GARAGE_ID);
	if (err) throw new Error(err.message);
}

export async function getCategoriesAdminAction(): Promise<VehicleCategory[]> {
	await assertAdmin();
	return categoryDb.listAll(GARAGE_ID);
}

export async function createCategoryAction(input: {
	slug: string;
	label: string;
	icon?: string;
	sort_order: number;
}): Promise<VehicleCategory> {
	await assertAdmin();
	const cat = await categoryDb.create(GARAGE_ID, input);
	revalidatePath("/admin/categories");
	revalidatePath("/occasions");
	return cat;
}

export async function updateCategoryAction(
	id: string,
	input: { label?: string; icon?: string; sort_order?: number; is_active?: boolean },
): Promise<VehicleCategory> {
	await assertAdmin();
	const cat = await categoryDb.update(id, input);
	revalidatePath("/admin/categories");
	revalidatePath("/occasions");
	revalidatePath(`/occasions/${cat.slug}`);
	return cat;
}
