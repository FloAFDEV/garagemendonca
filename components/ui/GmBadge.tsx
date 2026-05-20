import Image from "next/image";

/*
  GmBadge — emblème GM laurier, réutilisable dans les hero sections
  Tailles disponibles : "sm" (64px) | "md" (80px) | "lg" (96px)
  Toujours aria-hidden : rôle purement décoratif, le nom du garage
  est déjà annoncé par le h1 adjacent.
*/
interface GmBadgeProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeMap = {
	sm: { px: 64,  cls: "w-16 h-16" },
	md: { px: 80,  cls: "w-20 h-20" },
	lg: { px: 96,  cls: "w-24 h-24" },
};

export default function GmBadge({ size = "md", className = "" }: GmBadgeProps) {
	const { px, cls } = sizeMap[size];
	return (
		<div
			className={`relative ${cls} rounded-full overflow-hidden ring-2 ring-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.45)] flex-shrink-0 ${className}`}
			aria-hidden="true"
		>
			<Image
				src="/images/logo-gm.webp"
				alt=""
				fill
				sizes={`${px}px`}
				className="object-cover"
				unoptimized
			/>
		</div>
	);
}
