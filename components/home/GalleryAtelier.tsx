import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";
import { serviceRepository } from "@/lib/repositories";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { extractStoragePath } from "@/lib/utils/storage";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";

// Mise en page grille : première image grande, suivantes standards
const SPANS = [
	"lg:col-span-2 lg:row-span-2",
	"",
	"",
	"",
	"",
];

async function signServiceImage(
	url: string | undefined,
	storagePath: string | undefined,
): Promise<string | undefined> {
	if (!SUPABASE_ENABLED) return url;
	const path = storagePath ?? (url ? extractStoragePath(url) : undefined);
	if (path) {
		try {
			const { data } = await createSupabaseAdminClient()
				.storage.from("service-images")
				.createSignedUrl(path, 3600);
			if (data?.signedUrl) return data.signedUrl;
		} catch {
			// silencieux — fallback vers url legacy
		}
	}
	return url ?? undefined;
}

export default async function GalleryAtelier() {
	const services = await serviceRepository.getAll().catch(() => []);

	// Collecter toutes les images de tous les services actifs
	const allImages = services.flatMap((s) =>
		(s.images ?? []).map((img) => ({
			url:          img.url,
			storage_path: img.storage_path ?? undefined,
			alt:          img.alt ?? s.title,
			caption:      s.title,
		})),
	);

	const selected = allImages.slice(0, 5);
	if (selected.length === 0) return null;

	// Signature server-side en parallèle
	const photos = await Promise.all(
		selected.map(async (img, i) => ({
			src:     await signServiceImage(img.url, img.storage_path),
			alt:     img.alt,
			caption: img.caption,
			span:    SPANS[i] ?? "",
		})),
	);

	const visible = photos.filter((p) => !!p.src);
	if (visible.length === 0) return null;

	return (
		<section className="py-28 bg-dark-950">
			<Container>
				{/* ── Header ── */}
				<AnimateOnScroll>
					<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
						<div>
							<div className="section-divider" />
							<span className="eyebrow-light">Notre atelier</span>
							<h2 className="section-title-light">
								Un équipement
								<br />
								professionnel
							</h2>
						</div>
						<p className="font-light text-slate-200 text-sm leading-relaxed max-w-sm mt-4 lg:mt-0">
							Des outils de dernière génération, un atelier
							organisé avec soin. La précision de notre travail se
							voit dès le premier regard.
						</p>
					</div>
				</AnimateOnScroll>

				{/* ── Grille photo ── */}
				<AnimateOnScroll delay={100}>
					<div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:h-[520px]">
						{visible.map(({ src, alt, caption, span }, i) => (
							<div
								key={i}
								className={`relative overflow-hidden rounded-xl bg-dark-800 group min-h-[180px] ${span}`}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={src}
									alt={alt}
									className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-107"
									loading="lazy"
									decoding="async"
								/>

								<div
									className="absolute inset-0 bg-gradient-to-t from-dark-950/65 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-400"
									aria-hidden="true"
								/>

								{/* Caption au hover */}
								<div className="absolute bottom-3 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
									<span className="font-light text-white/90 text-xs tracking-wide">
										{caption}
									</span>
								</div>
							</div>
						))}
					</div>
				</AnimateOnScroll>
			</Container>
		</section>
	);
}
