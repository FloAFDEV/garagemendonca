"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const brands = [
	{ name: "Volkswagen", file: "volkswagen-logo.png" },
	{ name: "BMW", file: "bmw-logo.png" },
	{ name: "Mercedes-Benz", file: "mercedes-benz-logo.png" },
	{ name: "Audi", file: "audi-logo.png" },
	{ name: "Renault", file: "renault-logo.png" },
	{ name: "Peugeot", file: "peugeot-logo.png" },
	{ name: "Citroën", file: "citroen-logo.png" },
	{ name: "Fiat", file: "fiat-logo.png" },
	{ name: "Alfa Romeo", file: "alfa-romeo-logo.png" },
	{ name: "Volvo", file: "volvo-logo.png" },
	{ name: "Seat", file: "seat-logo.png" },
	{ name: "Škoda", file: "skoda-logo.png" },
	{ name: "Opel", file: "opel-logo.png" },
	{ name: "Toyota", file: "toyota-logo.png" },
	{ name: "Ford", file: "ford-logo.png" },
	{ name: "Nissan", file: "nissan-logo.png" },
	{ name: "Hyundai", file: "hyundai-logo.png" },
	{ name: "Kia", file: "kia-logo.png" },
	{ name: "Suzuki", file: "suzuki-logo.png" },
	{ name: "Dacia", file: "dacia-logo.png" },
];

const doubled = [...brands, ...brands];

export default function BrandsStrip() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDown, setIsDown] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);

	const onMouseDown = (e: React.MouseEvent) => {
		if (!containerRef.current) return;
		setIsDown(true);
		setStartX(e.pageX - containerRef.current.offsetLeft);
		setScrollLeft(containerRef.current.scrollLeft);
	};

	const onMouseLeave = () => setIsDown(false);
	const onMouseUp = () => setIsDown(false);

	const onMouseMove = (e: React.MouseEvent) => {
		if (!isDown || !containerRef.current) return;
		e.preventDefault();
		const x = e.pageX - containerRef.current.offsetLeft;
		const walk = (x - startX) * 1.5; // vitesse drag
		containerRef.current.scrollLeft = scrollLeft - walk;
	};

	// scroll via wheel horizontal
	const onWheel = (e: React.WheelEvent) => {
		if (!containerRef.current) return;
		e.preventDefault();
		containerRef.current.scrollLeft += e.deltaY; // permet swipe souris vertical → horizontal
	};

	return (
		<div className="mt-16 pt-10">
			<p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
				Toutes marques · Cliquez pour voir le stock
			</p>

			<div className="relative overflow-hidden">
				{/* gloss */}
				<div
					className="pointer-events-none absolute inset-0 z-10 
          [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] 
         "
				/>

				<div
					ref={containerRef}
					onMouseDown={onMouseDown}
					onMouseLeave={onMouseLeave}
					onMouseUp={onMouseUp}
					onMouseMove={onMouseMove}
					onWheel={onWheel}
					className="
            flex gap-8 items-center whitespace-nowrap w-max
            animate-marquee hover:[animation-play-state:paused]
            overflow-x-auto md:overflow-hidden
            px-4
            snap-x snap-mandatory
            scroll-smooth
            cursor-grab active:cursor-grabbing
            touch-pan-x
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
				>
					{doubled.map(({ name, file }, i) => (
						<Link
							key={`${name}-${i}`}
							href={`/vehicules?brand=${encodeURIComponent(name)}`}
							className="
                snap-center flex-shrink-0 w-14 h-14
                flex items-center justify-center
                grayscale opacity-50
                hover:grayscale-0 hover:opacity-100 hover:scale-110
                active:scale-90
                transition-transform duration-300
              "
						>
							<Image
								src={`/images/brands/${file}`}
								alt={name}
								width={56}
								height={56}
								className="object-contain"
							/>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
