import Image from "next/image";
import type { Service, ServiceImage } from "@/types";

interface Props {
	service: Pick<Service, "slug" | "title" | "long_description" | "images">;
}

function getPrimaryImage(images: ServiceImage[]): ServiceImage | undefined {
	return images.find((i) => i.is_primary) ?? images[0];
}

export default function ServiceHero({ service }: Props) {
	const primary = getPrimaryImage(service.images);

	return (
		<div id={service.slug} className="scroll-mt-28">
			{/* Image principale */}
			{primary && (
				<div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden">
					<Image
						src={primary.url}
						alt={primary.alt ?? service.title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, 1280px"
						priority={false}
					/>
					{/* Overlay dégradé léger */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

					{/* Badge "Expertise depuis 2001" */}
					<div className="absolute top-4 left-4">
						<span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-sm">
							<span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
							Expertise depuis 2001
						</span>
					</div>
				</div>
			)}

			{/* Titre + description */}
			<div className="mt-8">
				<h2 className="ty-heading text-2xl sm:text-3xl text-slate-900 mb-4">
					{service.title}
				</h2>
				<p className="text-slate-600 leading-relaxed max-w-3xl text-sm sm:text-base">
					{service.long_description}
				</p>
			</div>
		</div>
	);
}
