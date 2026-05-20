import Image from "next/image";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Container from "@/components/ui/Container";
import { serviceRepository } from "@/lib/repositories";
import { getStoragePublicUrl } from "@/lib/utils/storage";

// Mise en page grille : première image grande, suivantes standards
const SPANS = [
	"lg:col-span-2 lg:row-span-2",
	"",
	"",
	"",
	"",
];

export default async function GalleryAtelier() {
	const services = await serviceRepository.getAll().catch(() => []);

	const allImages = services.flatMap((s) =>
		(s.images ?? []).map((img) => ({
			// service-images est un bucket public (migration 013)
			src: img.storage_path
				? getStoragePublicUrl("service-images", img.storage_path)
				: (img.url ?? undefined),
			alt:     img.alt ?? s.title,
			caption: s.title,
		})),
	);

	const selected = allImages.slice(0, 5).filter((img) => !!img.src);
	if (selected.length === 0) return null;

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
						{selected.map(({ src, alt, caption }, i) => (
							<div
								key={i}
								className={`relative overflow-hidden rounded-xl bg-dark-800 group min-h-[180px] ${SPANS[i] ?? ""}`}
							>
								<Image
									src={src!}
									alt={alt}
									fill
									sizes="(min-width: 1024px) 25vw, 50vw"
									className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
									loading="lazy"
									unoptimized
								/>

								<div
									className="absolute inset-0 bg-gradient-to-t from-dark-950/65 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-400"
									aria-hidden="true"
								/>

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
