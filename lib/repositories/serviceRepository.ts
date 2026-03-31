/**
 * Service Repository — implémentation mock (in-memory).
 *
 * ⚠️  Les mutations (update) ne persistent pas entre les redémarrages.
 *
 * -- SQL Supabase (services) -------------------------------------------------
 * CREATE TABLE services (
 *   id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   slug              TEXT UNIQUE NOT NULL,
 *   title             TEXT NOT NULL,
 *   short_description TEXT NOT NULL DEFAULT '',
 *   long_description  TEXT NOT NULL DEFAULT '',
 *   icon              TEXT NOT NULL DEFAULT 'wrench',
 *   features          TEXT[] DEFAULT '{}',
 *   is_active         BOOLEAN NOT NULL DEFAULT true,
 *   updated_at        TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- SQL Supabase (service_images) -------------------------------------------
 * CREATE TABLE service_images (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
 *   garage_id  UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
 *   url        TEXT NOT NULL,
 *   alt        TEXT,
 *   "order"    INTEGER NOT NULL DEFAULT 1,
 *   is_primary BOOLEAN NOT NULL DEFAULT false,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX ON service_images(service_id);
 * ---------------------------------------------------------------------------
 */

import type { Service } from "@/types";
import { services as seedServices } from "@/lib/data";

/**
 * Transforme une ligne Supabase (snake_case) en type Service.
 * TODO: utiliser lors du switch Supabase.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapServiceFromDB(row: any, images: any[] = []): Service {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		icon: row.icon ?? "wrench",
		short_description: row.short_description ?? "",
		long_description: row.long_description ?? "",
		features: row.features ?? [],
		is_active: row.is_active ?? true,
		images: images.map((img) => ({
			id: img.id,
			service_id: img.service_id,
			garage_id: img.garage_id,
			url: img.url,
			alt: img.alt ?? undefined,
			order: img.order,
			is_primary: img.is_primary,
		})),
	};
}

/** In-memory store — initialisé depuis lib/data.ts */
let _store: Service[] = seedServices.map((s) => ({ ...s }));

export const serviceRepository = {
	/** All services. */
	getAll: async (): Promise<Service[]> => {
		// TODO: Supabase → supabase.from("services").select("*, service_images(*)").order("id")
		return _store;
	},

	/** Single service by slug. */
	getBySlug: async (slug: string): Promise<Service | null> => {
		// TODO: Supabase → supabase.from("services").select("*, service_images(*)").eq("slug",slug).single()
		return _store.find((s) => s.slug === slug) ?? null;
	},

	/** Partial update by slug. */
	update: async (slug: string, data: Partial<Service>): Promise<Service> => {
		// TODO: Supabase → supabase.from("services").update(data).eq("slug",slug).select().single()
		const idx = _store.findIndex((s) => s.slug === slug);
		if (idx === -1) throw new Error(`Service "${slug}" not found`);
		const updated: Service = { ..._store[idx], ...data };
		_store = _store.map((s, i) => (i === idx ? updated : s));
		return updated;
	},
};
