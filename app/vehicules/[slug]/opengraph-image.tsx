import { ImageResponse } from "next/og";
import { vehicleDb } from "@/lib/db/vehicle.repository";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

export const runtime = "nodejs";
export const alt = "Garage Mendonça — annonce véhicule";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const vehicle = await vehicleDb.getBySlug(GARAGE_ID, slug).catch(() => null);

	if (!vehicle) {
		return new ImageResponse(
			(
				<div
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "#0f172a",
						fontFamily: "sans-serif",
					}}
				>
					<span style={{ color: "#94a3b8", fontSize: 32 }}>
						Garage Mendonça
					</span>
				</div>
			),
			{ width: 1200, height: 630 },
		);
	}

	const price = vehicle.price.toLocaleString("fr-FR");
	const mileage = vehicle.mileage.toLocaleString("fr-FR");

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					background: "#0f172a",
					fontFamily: "sans-serif",
					padding: "60px 72px",
					position: "relative",
				}}
			>
				{/* Top accent bar */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						height: 6,
						background: "#f97316",
					}}
				/>

				{/* Logo / brand */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						marginBottom: 40,
					}}
				>
					<div
						style={{
							width: 10,
							height: 10,
							borderRadius: "50%",
							background: "#f97316",
						}}
					/>
					<span style={{ color: "#94a3b8", fontSize: 18, letterSpacing: 2 }}>
						GARAGE MENDONÇA · DRÉMIL-LAFAGE
					</span>
				</div>

				{/* Vehicle name */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						justifyContent: "center",
					}}
				>
					<div
						style={{
							color: "#f1f5f9",
							fontSize: 72,
							fontWeight: 700,
							lineHeight: 1.1,
							marginBottom: 16,
						}}
					>
						{vehicle.brand} {vehicle.model}
					</div>
					<div
						style={{
							color: "#94a3b8",
							fontSize: 36,
							marginBottom: 40,
						}}
					>
						{vehicle.year} · {vehicle.color}
					</div>

					{/* Specs row */}
					<div style={{ display: "flex", gap: 24 }}>
						{[
							{ label: "Kilométrage", value: `${mileage} km` },
							{ label: "Énergie", value: vehicle.fuel },
							{ label: "Boîte", value: vehicle.transmission },
							{ label: "Puissance", value: `${vehicle.power} ch` },
						].map(({ label, value }) => (
							<div
								key={label}
								style={{
									display: "flex",
									flexDirection: "column",
									background: "#1e293b",
									borderRadius: 12,
									padding: "14px 20px",
									minWidth: 160,
								}}
							>
								<span
									style={{
										color: "#64748b",
										fontSize: 13,
										textTransform: "uppercase",
										letterSpacing: 1.5,
										marginBottom: 6,
									}}
								>
									{label}
								</span>
								<span
									style={{
										color: "#e2e8f0",
										fontSize: 20,
										fontWeight: 600,
									}}
								>
									{value}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Price */}
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						justifyContent: "space-between",
						marginTop: 40,
					}}
				>
					<div
						style={{
							color: "#f97316",
							fontSize: 64,
							fontWeight: 700,
							lineHeight: 1,
						}}
					>
						{price} €
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-end",
							color: "#64748b",
							fontSize: 16,
						}}
					>
						<span>05 32 00 20 38</span>
						<span>garagemendonca.com</span>
					</div>
				</div>
			</div>
		),
		{ width: 1200, height: 630 },
	);
}
