"use client";
import type { VehicleStatus } from "@/types";
import { adminUI } from "@/lib/admin-ui";

const STATUS_CONFIG: Record<VehicleStatus, { label: string; className: string }> = {
	published:  { label: "Publié",     className: adminUI.badgePublished },
	draft:      { label: "Brouillon",  className: adminUI.badgeDraft },
	scheduled:  { label: "Programmé", className: adminUI.badgeScheduled },
	sold:       { label: "Vendue",     className: adminUI.badgeSold },
};

export function VehicleStatusBadge({ status }: { status: VehicleStatus | null | undefined }) {
	const cfg = STATUS_CONFIG[status ?? "draft"];
	return <span className={cfg.className}>{cfg.label}</span>;
}
