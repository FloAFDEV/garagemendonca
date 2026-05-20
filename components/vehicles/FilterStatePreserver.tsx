"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "lastVehicleListingUrl";

/** Saves the current listing URL (with active filters) to sessionStorage. */
export function FilterStatePreserver() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		const qs = searchParams.toString();
		sessionStorage.setItem(
			SESSION_KEY,
			qs ? `${pathname}?${qs}` : pathname,
		);
	}, [pathname, searchParams]);

	return null;
}

export { SESSION_KEY as FILTER_SESSION_KEY };
