/**
 * Service Repository — implémentation mock (in-memory).
 *
 * ⚠️  Les mutations (update) ne persistent pas entre les redémarrages.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * CREATE TABLE services (
 *   id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   slug        TEXT UNIQUE NOT NULL,
 *   title       TEXT NOT NULL,
 *   description TEXT NOT NULL DEFAULT '',
 *   icon        TEXT NOT NULL DEFAULT 'wrench',
 *   image       TEXT NOT NULL DEFAULT '',
 *   photo_url   TEXT,
 *   features    TEXT[] DEFAULT '{}',
 *   is_active   BOOLEAN NOT NULL DEFAULT true,
 *   updated_at  TIMESTAMPTZ DEFAULT NOW()
 * );
 * --------------------------------------------------------------------------
 */

import type { Service } from "@/types";
import { services as seedServices } from "@/lib/data";

/** In-memory store — initialisé depuis lib/data.ts */
let _store: Service[] = seedServices.map((s) => ({
	...s,
	slug: s.slug ?? (s.id as Service["slug"]),
	is_active: s.is_active ?? true,
	photo_url: s.photo_url ?? s.image,
}));

export const serviceRepository = {
	/** All services. */
	getAll: async (): Promise<Service[]> => {
		// TODO: Supabase → supabase.from("services").select("*").order("id")
		return _store;
	},

	/** Single service by slug. */
	getBySlug: async (slug: string): Promise<Service | null> => {
		// TODO: Supabase → supabase.from("services").select("*").eq("slug",slug).single()
		return _store.find((s) => (s.slug ?? s.id) === slug) ?? null;
	},

	/** Partial update by slug. */
	update: async (slug: string, data: Partial<Service>): Promise<Service> => {
		// TODO: Supabase → supabase.from("services").update(data).eq("slug",slug).select().single()
		const idx = _store.findIndex((s) => (s.slug ?? s.id) === slug);
		if (idx === -1) throw new Error(`Service "${slug}" not found`);
		const updated: Service = {
			..._store[idx],
			...data,
			// photo_url et image restent synchronisés
			...(data.photo_url ? { image: data.photo_url } : {}),
			...(data.image ? { photo_url: data.image } : {}),
		};
		_store = _store.map((s, i) => (i === idx ? updated : s));
		return updated;
	},
};
