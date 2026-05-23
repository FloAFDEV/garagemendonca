import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { mapVehicleCategory } from "@/lib/supabase/mappers";
import type { VehicleCategory } from "@/types";

type CreateInput = {
	slug: string;
	label: string;
	icon?: string;
	sort_order: number;
};

type UpdateInput = Partial<CreateInput & { is_active: boolean }>;

function db() {
	return createSupabaseAdminClient();
}

export const categoryDb = {
	async listAll(garageId: string): Promise<VehicleCategory[]> {
		const { data, error } = await db()
			.from("vehicle_categories")
			.select("*")
			.eq("garage_id", garageId)
			.order("sort_order");
		if (error) throw error;
		return (data ?? []).map(mapVehicleCategory);
	},

	async create(garageId: string, input: CreateInput): Promise<VehicleCategory> {
		const { data, error } = await db()
			.from("vehicle_categories")
			.insert({ garage_id: garageId, ...input, is_active: true })
			.select()
			.single();
		if (error) throw error;
		return mapVehicleCategory(data);
	},

	async update(id: string, input: UpdateInput): Promise<VehicleCategory> {
		const { data, error } = await db()
			.from("vehicle_categories")
			.update(input)
			.eq("id", id)
			.select()
			.single();
		if (error) throw error;
		return mapVehicleCategory(data);
	},
};
