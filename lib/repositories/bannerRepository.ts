/**
 * Banner Repository — implémentation mock (in-memory).
 *
 * Une seule bannière active à la fois (singleton).
 * ⚠️  La bannière ne persiste pas entre les redémarrages du serveur.
 *
 * -- SQL Supabase -----------------------------------------------------------
 * CREATE TABLE banners (
 *   id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   is_active        BOOLEAN NOT NULL DEFAULT false,
 *   message          TEXT NOT NULL DEFAULT '',
 *   sub_message      TEXT,
 *   image_url        TEXT,
 *   cta_label        TEXT,
 *   cta_url          TEXT,
 *   bg_color         TEXT NOT NULL DEFAULT '#DC2626',
 *   scheduled_start  TIMESTAMPTZ,
 *   scheduled_end    TIMESTAMPTZ,
 *   display_pages    TEXT NOT NULL DEFAULT 'all',
 *   is_dismissible   BOOLEAN NOT NULL DEFAULT true,
 *   updated_at       TIMESTAMPTZ DEFAULT NOW()
 * );
 * -- On utilise upsert avec un id fixe pour le singleton :
 * INSERT INTO banners (id, ...) VALUES ('singleton', ...)
 *   ON CONFLICT (id) DO UPDATE SET ...;
 * --------------------------------------------------------------------------
 */

import type { Banner } from "@/types";

const DEFAULT_BANNER: Banner = {
	id: "singleton",
	is_active: false,
	message: "",
	bg_color: "#DC2626",
	display_pages: "all",
	is_dismissible: true,
};

let _banner: Banner = { ...DEFAULT_BANNER };

export const bannerRepository = {
	/** Récupère la bannière courante. Retourne null si jamais configurée. */
	get: async (): Promise<Banner | null> => {
		// TODO: Supabase → supabase.from("banners").select("*").eq("id","singleton").single()
		return _banner.message ? _banner : null;
	},

	/** Crée ou met à jour la bannière (singleton). */
	upsert: async (data: Partial<Banner>): Promise<Banner> => {
		// TODO: Supabase → supabase.from("banners").upsert({id:"singleton",...data}).select().single()
		_banner = { ..._banner, ...data, id: "singleton" };
		return _banner;
	},
};
