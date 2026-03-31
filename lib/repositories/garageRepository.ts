/**
 * Garage Repository — implémentation mock (in-memory).
 *
 * -- SQL Supabase -----------------------------------------------------------
 * CREATE TABLE garages (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name       TEXT NOT NULL,
 *   slug       TEXT UNIQUE NOT NULL,
 *   address    TEXT,
 *   phone      TEXT,
 *   email      TEXT,
 *   plan       TEXT NOT NULL DEFAULT 'isolated',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * --------------------------------------------------------------------------
 */

import type { Garage } from "@/types";
import { garages as seedGarages } from "@/lib/data";

const _store: Garage[] = [...seedGarages];

export const garageRepository = {
	/** All garages. */
	getAll: async (): Promise<Garage[]> => {
		// TODO: Supabase → supabase.from("garages").select("*")
		return _store;
	},

	/** Find by id or slug. */
	getById: async (idOrSlug: string): Promise<Garage | null> => {
		// TODO: Supabase → supabase.from("garages").select("*").or(`id.eq.${id},slug.eq.${id}`).single()
		return (
			_store.find((g) => g.id === idOrSlug || g.slug === idOrSlug) ?? null
		);
	},
};
