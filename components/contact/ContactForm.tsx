"use client";

import { useState } from "react";
import { z } from "zod";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useCreateMessage } from "@/lib/mutations/useCreateMessage";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea";

// ─── Schéma de validation client-side ────────────────────────────────────────
const schema = z.object({
	firstname: z
		.string()
		.min(2, "Prénom requis (2 caractères minimum)")
		.max(100)
		.trim(),
	lastname: z
		.string()
		.min(2, "Nom requis (2 caractères minimum)")
		.max(100)
		.trim(),
	email: z.string().email("Email invalide").max(254).toLowerCase().trim(),
	phone: z.string().max(20).optional(),
	subject: z.string().min(1, "Veuillez sélectionner un sujet").max(200),
	message: z
		.string()
		.min(10, "Message trop court (10 caractères minimum)")
		.max(3000),
	website: z.string().max(0, "Spam détecté").optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

const subjects = [
	"Demande de devis réparation",
	"Renseignement véhicule",
	"Prise de rendez-vous",
	"Demande d'information",
	"Autre",
];

export default function ContactForm({
	vehicule,
	vehicleId,
}: {
	vehicule?: string;
	vehicleId?: string;
}) {
	const [form, setForm] = useState({
		firstname: "",
		lastname: "",
		email: "",
		phone: "",
		subject: vehicule ? "Renseignement véhicule" : "",
		message: vehicule
			? `Bonjour, je suis intéressé(e) par le véhicule ${vehicule}. Pourriez-vous me recontacter ? Merci.`
			: "",
		website: "", // honeypot — doit rester vide
	});
	const [sent, setSent] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

	const { mutate, isPending, isError } = useCreateMessage();

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFieldErrors({});

		// ── Guard : garage_id doit être configuré ──────────────────────────────
		// GARAGE_ID est la constante build-time NEXT_PUBLIC_GARAGE_ID.
		// Si elle est vide (env var absente), le message serait sauvé sans garage_id
		// → invisible dans le dashboard admin et notification Edge Function cassée.
		if (!GARAGE_ID) {
			console.error(
				"[ContactForm] NEXT_PUBLIC_GARAGE_ID non configuré — envoi bloqué.",
			);
			setFieldErrors({
				message:
					"Erreur de configuration. Contactez-nous par téléphone.",
			});
			return;
		}

		// ── Validation Zod client-side ─────────────────────────────────────────
		const parsed = schema.safeParse({
			firstname: form.firstname,
			lastname: form.lastname,
			email: form.email,
			phone: form.phone || undefined,
			subject: form.subject,
			message: form.message,
			website: form.website || undefined,
		});

		if (!parsed.success) {
			const errs: FormErrors = {};
			for (const [field, issues] of Object.entries(
				parsed.error.flatten().fieldErrors,
			)) {
				errs[field as keyof FormErrors] = issues?.[0];
			}
			setFieldErrors(errs);
			return;
		}

		mutate(
			{
				garage_id: GARAGE_ID,
				vehicle_id: vehicleId ?? undefined,
				firstname: parsed.data.firstname,
				lastname: parsed.data.lastname,
				email: parsed.data.email,
				phone: parsed.data.phone || undefined,
				subject: parsed.data.subject,
				message: parsed.data.message,
				website: parsed.data.website,
			},
			{
				onSuccess: () => setSent(true),
			},
		);
	};

	if (sent) {
		return (
			<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
				<div
					className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5"
					aria-hidden="true"
				>
					<CheckCircle2
						size={32}
						className="text-emerald-600"
						aria-hidden="true"
					/>
				</div>
				<h3 className="ty-subheading text-[#0f172a] text-2xl mb-3">
					Message envoyé !
				</h3>
				<p className="text-[#475569] max-w-md mx-auto">
					Merci {form.firstname} ! Notre équipe vous recontactera dans
					les plus brefs délais, généralement sous 24 heures
					ouvrables.
				</p>
				<button
					onClick={() => {
						setSent(false);
						setForm({
							firstname: "",
							lastname: "",
							email: "",
							phone: "",
							subject: "",
							message: "",
							website: "",
						});
					}}
					className="mt-6 text-brand-600 font-normal hover:text-brand-700 transition-colors text-sm"
				>
					Envoyer un autre message
				</button>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
			noValidate
			aria-label="Formulaire de contact"
		>
			{/* Honeypot — caché visuellement et des lecteurs d'écran */}
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					left: "-9999px",
					opacity: 0,
					height: 0,
					overflow: "hidden",
				}}
			>
				<label htmlFor="website">Ne pas remplir</label>
				<input
					id="website"
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
					value={form.website}
					onChange={handleChange}
				/>
			</div>

			{/* Prénom / Nom */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label htmlFor="firstname" className="label">
						Prénom{" "}
						<span className="text-brand-600" aria-hidden="true">
							*
						</span>
					</label>
					<input
						id="firstname"
						name="firstname"
						type="text"
						autoComplete="given-name"
						placeholder="John"
						value={form.firstname}
						onChange={handleChange}
						className={`input-field ${fieldErrors.firstname ? "border-red-300 focus:ring-red-200" : ""}`}
						aria-required="true"
						aria-invalid={!!fieldErrors.firstname}
					/>
					{fieldErrors.firstname && (
						<p
							className="mt-1 text-xs text-red-600 flex items-center gap-1"
							role="alert"
						>
							<AlertCircle size={12} aria-hidden="true" />{" "}
							{fieldErrors.firstname}
						</p>
					)}
				</div>
				<div>
					<label htmlFor="lastname" className="label">
						Nom{" "}
						<span className="text-brand-600" aria-hidden="true">
							*
						</span>
					</label>
					<input
						id="lastname"
						name="lastname"
						type="text"
						autoComplete="family-name"
						placeholder="Doe"
						value={form.lastname}
						onChange={handleChange}
						className={`input-field ${fieldErrors.lastname ? "border-red-300 focus:ring-red-200" : ""}`}
						aria-required="true"
						aria-invalid={!!fieldErrors.lastname}
					/>
					{fieldErrors.lastname && (
						<p
							className="mt-1 text-xs text-red-600 flex items-center gap-1"
							role="alert"
						>
							<AlertCircle size={12} aria-hidden="true" />{" "}
							{fieldErrors.lastname}
						</p>
					)}
				</div>
			</div>

			{/* Email / Téléphone */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label htmlFor="email" className="label">
						Email{" "}
						<span className="text-brand-600" aria-hidden="true">
							*
						</span>
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="john.doe@email.com"
						value={form.email}
						onChange={handleChange}
						className={`input-field ${fieldErrors.email ? "border-red-300 focus:ring-red-200" : ""}`}
						aria-required="true"
						aria-invalid={!!fieldErrors.email}
					/>
					{fieldErrors.email && (
						<p
							className="mt-1 text-xs text-red-600 flex items-center gap-1"
							role="alert"
						>
							<AlertCircle size={12} aria-hidden="true" />{" "}
							{fieldErrors.email}
						</p>
					)}
				</div>
				<div>
					<label htmlFor="phone" className="label">
						Téléphone
					</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						autoComplete="tel"
						placeholder="06 12 34 56 78"
						value={form.phone}
						onChange={handleChange}
						className="input-field"
					/>
				</div>
			</div>

			{/* Sujet */}
			<div>
				<label htmlFor="subject" className="label">
					Sujet{" "}
					<span className="text-brand-600" aria-hidden="true">
						*
					</span>
				</label>
				<select
					id="subject"
					name="subject"
					value={form.subject}
					onChange={handleChange}
					className={`input-field ${fieldErrors.subject ? "border-red-300 focus:ring-red-200" : ""}`}
					aria-required="true"
					aria-invalid={!!fieldErrors.subject}
				>
					<option value="">Sélectionnez un sujet…</option>
					{subjects.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>
				{fieldErrors.subject && (
					<p
						className="mt-1 text-xs text-red-600 flex items-center gap-1"
						role="alert"
					>
						<AlertCircle size={12} aria-hidden="true" />{" "}
						{fieldErrors.subject}
					</p>
				)}
			</div>

			{/* Message */}
			<div>
				<label htmlFor="message" className="label">
					Message{" "}
					<span className="text-brand-600" aria-hidden="true">
						*
					</span>
				</label>
				<AutoResizeTextarea
					id="message"
					name="message"
					minRows={5}
					maxRows={22}
					placeholder="Décrivez votre demande…"
					value={form.message}
					onChange={handleChange}
					error={!!fieldErrors.message}
					aria-required="true"
					aria-invalid={!!fieldErrors.message}
				/>
				{fieldErrors.message && (
					<p
						className="mt-1 text-xs text-red-600 flex items-center gap-1"
						role="alert"
					>
						<AlertCircle size={12} aria-hidden="true" />{" "}
						{fieldErrors.message}
					</p>
				)}
			</div>

			{/* Consentement RGPD */}
			<div className="flex items-start gap-3">
				<input
					type="checkbox"
					id="consent"
					required
					className="mt-1 w-4 h-4 accent-brand-600 cursor-pointer flex-shrink-0"
					aria-required="true"
				/>
				<label
					htmlFor="consent"
					className="text-sm text-[#475569] cursor-pointer leading-relaxed"
				>
					J&apos;accepte que mes données soient utilisées pour
					répondre à ma demande. Aucune donnée ne sera transmise à des
					tiers.{" "}
					<a
						href="/politique-confidentialite"
						className="text-brand-600 hover:underline"
					>
						Politique de confidentialité
					</a>
				</label>
			</div>

			{isError && (
				<div
					role="alert"
					className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl"
				>
					<AlertCircle
						size={16}
						className="text-red-500 mt-0.5 flex-shrink-0"
						aria-hidden="true"
					/>
					<p className="text-sm text-red-700 leading-snug">
						L&apos;envoi a échoué. Vérifiez votre connexion et
						réessayez, ou appelez-nous directement au{" "}
						<a
							href="tel:0532002038"
							className="font-semibold underline"
						>
							05 32 00 20 38
						</a>
						.
					</p>
				</div>
			)}

			<button
				type="submit"
				disabled={isPending}
				className="btn-primary w-full justify-center py-4 text-base"
				aria-busy={isPending}
			>
				{isPending ? (
					<>
						<Loader2
							size={18}
							className="animate-spin"
							aria-hidden="true"
						/>
						Envoi en cours…
					</>
				) : (
					<>
						<Send size={18} aria-hidden="true" />
						Envoyer le message
					</>
				)}
			</button>
		</form>
	);
}
