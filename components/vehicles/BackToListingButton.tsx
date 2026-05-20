"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FILTER_SESSION_KEY } from "./FilterStatePreserver";

interface BackToListingButtonProps {
	className?: string;
}

/**
 * Reads the last visited listing URL from sessionStorage so active filters
 * are restored when the user navigates back from a vehicle detail page.
 * Falls back to /vehicules when no session entry exists.
 */
export default function BackToListingButton({ className }: BackToListingButtonProps) {
	const [href, setHref] = useState("/vehicules");

	useEffect(() => {
		const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
		if (saved) setHref(saved);
	}, []);

	return (
		<Link
			href={href}
			className={className}
		>
			<ArrowLeft size={15} aria-hidden="true" />
			Retour aux annonces
		</Link>
	);
}
