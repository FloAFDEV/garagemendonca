"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { Clock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import type { GarageOpeningHours, GarageDay } from "@/types";
import { getGarageAction, updateOpeningHoursAction } from "./actions";

const DAYS: { key: GarageDay; label: string; short: string }[] = [
	{ key: "lundi", label: "Lundi", short: "Lun" },
	{ key: "mardi", label: "Mardi", short: "Mar" },
	{ key: "mercredi", label: "Mercredi", short: "Mer" },
	{ key: "jeudi", label: "Jeudi", short: "Jeu" },
	{ key: "vendredi", label: "Vendredi", short: "Ven" },
	{ key: "samedi", label: "Samedi", short: "Sam" },
	{ key: "dimanche", label: "Dimanche", short: "Dim" },
];

const DEFAULT_HOURS: GarageOpeningHours = {
	lundi: { open: "08:00", close: "19:00" },
	mardi: { open: "08:00", close: "19:00" },
	mercredi: { open: "08:00", close: "19:00" },
	jeudi: { open: "08:00", close: "19:00" },
	vendredi: { open: "08:00", close: "18:00" },
	samedi: null,
	dimanche: null,
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AdminHorairesPage() {
	const t = useAdminTokens();

	const [hours, setHours] = useState<GarageOpeningHours>(DEFAULT_HOURS);

	const [loading, setLoading] = useState(true);

	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

	useEffect(() => {
		getGarageAction()
			.then((garage) => {
				if (garage?.opening_hours) {
					setHours(garage.opening_hours);
				}

				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const isOpen = (day: GarageDay) =>
		hours[day] !== null && hours[day] !== undefined;

	const toggleDay = (day: GarageDay) => {
		setHours((prev) => ({
			...prev,
			[day]: isOpen(day)
				? null
				: {
						open: "08:00",
						close: "18:00",
					},
		}));
	};

	const setTime = (
		day: GarageDay,
		field: "open" | "close",
		value: string,
	) => {
		setHours((prev) => ({
			...prev,
			[day]: {
				...(prev[day] ?? {
					open: "08:00",
					close: "18:00",
				}),
				[field]: value,
			},
		}));
	};

	const handleSave = async () => {
		setSaveStatus("saving");

		const result = await updateOpeningHoursAction(hours);

		setSaveStatus(result.ok ? "saved" : "error");

		if (result.ok) {
			setTimeout(() => {
				setSaveStatus("idle");
			}, 2500);
		}
	};

	return (
		<AdminLayout>
			<div className="mx-auto max-w-4xl space-y-6">
				{/* Header */}
				<div>
					<h2
						className={clsx(
							"font-heading text-2xl font-medium tracking-tight",
							t.txt,
						)}
					>
						Horaires d&apos;ouverture
					</h2>

					<p className={clsx("mt-1 text-sm", t.txtMuted)}>
						Ces horaires sont affichés automatiquement dans le
						footer et sur la page contact.
					</p>
				</div>

				{/* Card */}
				<div
					className={clsx(
						"rounded-3xl border p-4 sm:p-5 lg:p-6",
						"space-y-4 shadow-sm",
						t.surface,
						t.border,
					)}
				>
					{/* Title */}
					<div className="flex items-center gap-2">
						<Clock
							size={18}
							className="text-brand-500"
							aria-hidden="true"
						/>

						<h3
							className={clsx(
								"font-heading text-sm font-semibold uppercase tracking-[0.2em]",
								t.txt,
							)}
						>
							Planning hebdomadaire
						</h3>
					</div>

					{/* Loading */}
					{loading ? (
						<div className="flex items-center justify-center gap-2 py-10">
							<Loader2
								size={18}
								className="animate-spin text-brand-500 motion-safe:animate-spin"
							/>

							<span className={clsx("text-sm", t.txtMuted)}>
								Chargement…
							</span>
						</div>
					) : (
						<div className="space-y-3">
							{DAYS.map(({ key, label }) => {
								const open = isOpen(key);

								const dayHours = hours[key];

								return (
									<div
										key={key}
										className={clsx(
											"grid grid-cols-1 gap-4 rounded-2xl border px-4 py-4 transition-all",
											"lg:grid-cols-[220px_1fr_auto]",
											open ? "opacity-100" : "opacity-70",
											t.surface,
											t.border,
										)}
									>
										{/* Left */}
										<div className="flex min-w-0 items-center gap-3">
											{/* Toggle */}
											<button
												type="button"
												onClick={() => toggleDay(key)}
												className={clsx(
													"relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
													"focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
													open
														? "bg-brand-500"
														: "bg-slate-300 dark:bg-slate-600",
												)}
												aria-checked={open}
												role="switch"
												aria-label={`${label} : ${
													open ? "ouvert" : "fermé"
												}`}
											>
												<span
													className={clsx(
														"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out",
														open
															? "translate-x-5"
															: "translate-x-0",
													)}
												/>
											</button>

											{/* Label */}
											<div className="min-w-0">
												<p
													className={clsx(
														"truncate text-sm font-semibold",
														t.txt,
													)}
												>
													{label}
												</p>

												<p
													className={clsx(
														"mt-0.5 text-xs",
														t.txtMuted,
													)}
												>
													{open ? "Ouvert" : "Fermé"}
												</p>
											</div>
										</div>

										{/* Hours */}
										{open && dayHours ? (
											<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
												<div className="flex flex-1 items-center gap-2">
													<input
														type="time"
														value={dayHours.open}
														onChange={(e) =>
															setTime(
																key,
																"open",
																e.target.value,
															)
														}
														className={clsx(
															"w-full rounded-xl border px-3 py-2 text-sm transition-shadow",
															"sm:w-[140px]",
															"focus:outline-none focus:ring-2 focus:ring-brand-500",
															t.inputClass,
														)}
														aria-label={`${label} — heure d'ouverture`}
													/>

													<span
														className={clsx(
															"flex-shrink-0 text-xs",
															t.txtSubtle,
														)}
														aria-hidden="true"
													>
														→
													</span>

													<input
														type="time"
														value={dayHours.close}
														onChange={(e) =>
															setTime(
																key,
																"close",
																e.target.value,
															)
														}
														className={clsx(
															"w-full rounded-xl border px-3 py-2 text-sm transition-shadow",
															"sm:w-[140px]",
															"focus:outline-none focus:ring-2 focus:ring-brand-500",
															t.inputClass,
														)}
														aria-label={`${label} — heure de fermeture`}
													/>
												</div>

												{/* Warning */}
												{dayHours.open >=
													dayHours.close && (
													<div className="flex items-center gap-1 text-xs font-medium text-amber-500">
														<AlertCircle
															size={12}
															aria-hidden="true"
														/>

														<span>
															Vérifier les
															horaires
														</span>
													</div>
												)}
											</div>
										) : (
											<div className="hidden lg:block" />
										)}

										{/* Closed badge desktop */}
										{!open && (
											<div className="hidden items-center justify-end lg:flex">
												<span
													className={clsx(
														"rounded-full px-3 py-1 text-xs font-medium",
														"bg-slate-100 dark:bg-slate-700",
														t.txtSubtle,
													)}
												>
													Fermé
												</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Sticky Save */}
				<div className="sticky bottom-4 z-20 flex justify-end pb-2">
					<button
						type="button"
						onClick={handleSave}
						disabled={saveStatus !== "idle" || loading}
						className={clsx(
							"btn-primary flex items-center gap-2 rounded-2xl px-6 py-3 text-sm",
							"shadow-xl shadow-brand-500/20 backdrop-blur-sm",
							"transition-transform hover:-translate-y-0.5",
							"disabled:cursor-not-allowed disabled:opacity-70",
						)}
					>
						{saveStatus === "saving" ? (
							<>
								<Loader2
									size={16}
									className="animate-spin motion-safe:animate-spin"
								/>
								Enregistrement…
							</>
						) : saveStatus === "saved" ? (
							<>
								<CheckCircle2 size={16} />
								Enregistré !
							</>
						) : saveStatus === "error" ? (
							<>
								<AlertCircle size={16} />
								Erreur
							</>
						) : (
							<>
								<Save size={16} />
								Enregistrer les horaires
							</>
						)}
					</button>
				</div>
			</div>
		</AdminLayout>
	);
}
