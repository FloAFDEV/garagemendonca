/**
 * Vehicle Repository — implémentation mock (in-memory).
 *
 * Toutes les méthodes exposent l'interface qu'on branchera sur Supabase
 * sans rien changer au-dessus. Voir les commentaires TODO: Supabase.
 *
 * Stockage : délègue entièrement à lib/vehicles.ts qui gère le _store
 * module-level et les Supabase stubs.
 *
 * ⚠️  Les mutations (create, update, delete) ne persistent pas entre
 *     les redémarrages du serveur Next.js — comportement mock intentionnel.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * CREATE TABLE vehicles (
 *   id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   garage_id     TEXT,
 *   brand         TEXT NOT NULL,
 *   model         TEXT NOT NULL,
 *   year          INTEGER NOT NULL,
 *   mileage       INTEGER NOT NULL,
 *   fuel          TEXT NOT NULL,
 *   price         NUMERIC NOT NULL,
 *   description   TEXT NOT NULL DEFAULT '',
 *   images        TEXT[] DEFAULT '{}',
 *   transmission  TEXT NOT NULL,
 *   power         INTEGER NOT NULL,
 *   color         TEXT NOT NULL,
 *   doors         INTEGER NOT NULL DEFAULT 5,
 *   crit_air      TEXT,
 *   status        TEXT NOT NULL DEFAULT 'draft',
 *   published_at  TIMESTAMPTZ,
 *   sold_at       TIMESTAMPTZ,
 *   featured      BOOLEAN NOT NULL DEFAULT false,
 *   featured_order INTEGER,
 *   features      JSONB DEFAULT '{}',
 *   options       JSONB DEFAULT '{}',
 *   created_at    TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at    TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX vehicles_status_idx ON vehicles(status);
 * CREATE INDEX vehicles_featured_idx ON vehicles(featured) WHERE featured = true;
 * --------------------------------------------------------------------------
 */

import type { Vehicle, VehicleCreateInput, VehicleUpdateInput } from "@/types";
import {
	getAllVehicles,
	getAllVehiclesAdmin,
	getVehicleById,
	getFeaturedVehicles,
	getRelatedVehicles,
	getVehicleStaticParams,
	createVehicle,
	updateVehicle,
	deleteVehicle,
} from "@/lib/vehicles";

export const vehicleRepository = {
	/** Public-facing list (published + sold + scheduled past). */
	getAll: (garageId?: string): Promise<Vehicle[]> =>
		// TODO: Supabase → supabase.from("vehicles").select("*").in("status",["published","sold"])...
		getAllVehicles(garageId),

	/** Admin list — all statuses. */
	getAllAdmin: (garageId?: string): Promise<Vehicle[]> =>
		// TODO: Supabase → supabase.from("vehicles").select("*").order("created_at",{ascending:false})
		getAllVehiclesAdmin(garageId),

	/** Single vehicle by id. */
	getById: (id: string): Promise<Vehicle | null> =>
		// TODO: Supabase → supabase.from("vehicles").select("*").eq("id",id).single()
		getVehicleById(id),

	/** Featured vehicles for homepage. */
	getFeatured: (limit = 3, garageId?: string): Promise<Vehicle[]> =>
		// TODO: Supabase → supabase.from("vehicles").select("*").eq("featured",true).limit(limit)
		getFeaturedVehicles(limit, garageId),

	/** Related vehicles excluding a given id. */
	getRelated: (excludeId: string, limit = 3, garageId?: string): Promise<Vehicle[]> =>
		// TODO: Supabase → supabase.from("vehicles").select("*").neq("id",excludeId).limit(limit)
		getRelatedVehicles(excludeId, limit, garageId),

	/** Static params for generateStaticParams. */
	getStaticParams: (): Promise<{ id: string }[]> =>
		getVehicleStaticParams(),

	/** Create a new vehicle. */
	create: (data: VehicleCreateInput & { id?: string }): Promise<Vehicle> =>
		// TODO: Supabase → supabase.from("vehicles").insert({...data}).select().single()
		createVehicle(data),

	/** Partial update. */
	update: (id: string, data: VehicleUpdateInput): Promise<Vehicle> =>
		// TODO: Supabase → supabase.from("vehicles").update({...data}).eq("id",id).select().single()
		updateVehicle(id, data),

	/** Delete. */
	delete: (id: string): Promise<void> =>
		// TODO: Supabase → supabase.from("vehicles").delete().eq("id",id)
		deleteVehicle(id),
};
