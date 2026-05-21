"use client";

/**
 * VehicleContactForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Formulaire de contact inline sur la fiche véhicule.
 * Pré-remplit sujet + message avec les infos du véhicule.
 * Envoie vehicle_id → DB → Edge Function enrichit l'email Resend.
 * Pattern : validation manuelle Zod (cohérent avec ContactForm.tsx existant).
 */

import { useState, type FormEvent } from "react";
import {
	MessageSquare,
	Phone,
	Send,
	CheckCircle,
	AlertCircle,
	User,
	Mail,
	PhoneCall,
} from "lucide-react";
import { z } from "zod";
import AutoResizeTextarea from "@/components/ui/AutoResizeTextarea";
import { useCreateMessage } from "@/lib/mutations/useCreateMessage";

// ─── Schéma de validation ────────────────────────────────────────────────────

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
	message: z
		.string()
		.min(10, "Message trop court (10 caractères minimum)")
		.max(3000),
	website: z.string().max(0, "Spam détecté").optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface VehicleContactFormProps {
	vehicleId: string;
	vehicleName: string; // ex: "Toyota Yaris 2019"
	vehicleLabel: string; // ex: "Toyota Yaris 2019 · 12 500 €"
	garageId: string;
	isAvailable: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function VehicleContactForm({
	vehicleId,
	vehicleName,
	vehicleLabel,
	garageId,
	isAvailable,
}: VehicleContactFormProps) {
	const [success, setSuccess] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const mutation = useCreateMessage();

	const defaultMessage = isAvailable
		? `Bonjour,\n\nJe suis intéressé(e) par le véhicule ${vehicleName} et souhaiterais obtenir plus d'informations.\n\nPuis-je organiser un essai ?\n\nMerci d'avance.`
		: `Bonjour,\n\nJe suis intéressé(e) par le véhicule ${vehicleName} (affiché comme vendu).\nSi un véhicule similaire est disponible, merci de me contacter.\n\nMerci.`;

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrors({});

		const data = Object.fromEntries(new FormData(e.currentTarget));

		// Validation Zod client-side — évite un aller-retour serveur pour les erreurs de saisie
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			const fieldErrors: FormErrors = {};
			for (const [field, issues] of Object.entries(
				parsed.error.flatten().fieldErrors,
			)) {
				fieldErrors[field as keyof FormErrors] = issues?.[0];
			}
			setErrors(fieldErrors);
			return;
		}

		try {
			await mutation.mutateAsync({
				garage_id: garageId || undefined,
				vehicle_id: vehicleId || undefined,
				subject: `Renseignement — ${vehicleName}`,
				firstname: parsed.data.firstname,
				lastname: parsed.data.lastname,
				email: parsed.data.email,
				phone: parsed.data.phone || undefined,
				message: parsed.data.message,
				website: parsed.data.website,
			});
			setSuccess(true);
		} catch {
			// L'erreur est déjà gérée par useCreateMessage.onError (toast).
			// Ce catch vide est intentionnel : sans lui, mutateAsync re-throw après onError
			// → "Uncaught (in promise)" dans la console même si le toast s'est affiché.
		}
	}

	// ── État succès ─────────────────────────────────────────────────────────────
	if (success) {
		return (
			<div className="flex flex-col items-center text-center py-10 px-6">
				<div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4">
					<CheckCircle className="text-emerald-500" size={26} />
				</div>
				<h3 className="text-lg font-semibold text-[#0f172a] mb-2">
					Message envoyé !
				</h3>
				<p className="text-slate-500 text-sm max-w-xs leading-relaxed">
					Nous avons bien reçu votre demande concernant le{" "}
					<strong className="text-[#0f172a]">{vehicleName}</strong>.
					Nous vous répondrons dans les plus brefs délais —
					généralement sous 24 h.
				</p>
				<a
					href="tel:0532002038"
					className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
				>
					<Phone size={15} /> 05 32 00 20 38
				</a>
			</div>
		);
	}

	// ── Formulaire ──────────────────────────────────────────────────────────────
	return (
		<form onSubmit={handleSubmit} noValidate className="space-y-5">
			{/* Contexte véhicule */}
			<div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
				<div className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
					<MessageSquare size={16} className="text-brand-500" />
				</div>
				<div className="min-w-0">
					<p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
						Votre demande concerne
					</p>
					<p className="text-sm font-medium text-[#0f172a] truncate">
						{vehicleLabel}
					</p>
				</div>
			</div>

			{/* Honeypot anti-spam */}
			<input
				type="text"
				name="website"
				className="hidden"
				tabIndex={-1}
				autoComplete="off"
			/>

			{/* Prénom + Nom */}
			<div className="grid grid-cols-2 gap-3">
				<Field
					id="vcf-firstname"
					name="firstname"
					label="Prénom"
					required
					autoComplete="given-name"
					placeholder="John"
					icon={<User size={15} />}
					error={errors.firstname}
				/>
				<Field
					id="vcf-lastname"
					name="lastname"
					label="Nom"
					required
					autoComplete="family-name"
					placeholder="Doe"
					icon={<User size={15} />}
					error={errors.lastname}
				/>
			</div>

			{/* Email */}
			<Field
				id="vcf-email"
				name="email"
				type="email"
				label="Email"
				required
				autoComplete="email"
				placeholder="john.doe@email.com"
				icon={<Mail size={15} />}
				error={errors.email}
			/>

			{/* Téléphone */}
			<Field
				id="vcf-phone"
				name="phone"
				type="tel"
				label="Téléphone"
				autoComplete="tel"
				placeholder="06 12 34 56 78"
				icon={<PhoneCall size={15} />}
				optional
			/>

			{/* Message */}
			<div>
				<label
					htmlFor="vcf-message"
					className="block text-sm font-medium text-slate-700 mb-1.5"
				>
					Votre message <span className="text-red-500">*</span>
				</label>
				<AutoResizeTextarea
					id="vcf-message"
					name="message"
					minRows={5}
					maxRows={20}
					defaultValue={defaultMessage}
					error={!!errors.message}
				/>
				{errors.message && (
					<p className="mt-1 text-xs text-red-500 flex items-center gap-1">
						<AlertCircle size={12} /> {errors.message}
					</p>
				)}
			</div>

			{/* Erreur serveur — affichée uniquement si la mutation a échoué (hors erreurs Zod) */}
			{mutation.isError && (
				<div
					role="alert"
					className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl"
				>
					<AlertCircle
						size={16}
						className="text-red-500 mt-0.5 flex-shrink-0"
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

			{/* Submit */}
			<button
				type="submit"
				disabled={mutation.isPending}
				className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
			>
				{mutation.isPending ? (
					<>
						<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						Envoi en cours…
					</>
				) : (
					<>
						<Send size={16} />
						Envoyer ma demande
					</>
				)}
			</button>

			<p className="text-center text-xs text-slate-400">
				Réponse sous 24 h · Ou appelez le{" "}
				<a
					href="tel:0532002038"
					className="text-brand-600 font-medium hover:underline"
				>
					05 32 00 20 38
				</a>
			</p>
		</form>
	);
}

// ─── Composant champ réutilisable ─────────────────────────────────────────────

function Field({
	id,
	name,
	label,
	type = "text",
	required,
	optional,
	autoComplete,
	placeholder,
	icon,
	error,
}: {
	id: string;
	name: string;
	label: string;
	type?: string;
	required?: boolean;
	optional?: boolean;
	autoComplete?: string;
	placeholder?: string;
	icon?: React.ReactNode;
	error?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-sm font-medium text-slate-700 mb-1.5"
			>
				{label} {required && <span className="text-red-500">*</span>}
				{optional && (
					<span className="text-slate-400 font-normal">
						(optionnel)
					</span>
				)}
			</label>
			<div className="relative">
				{icon && (
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
						{icon}
					</span>
				)}
				<input
					id={id}
					name={name}
					type={type}
					autoComplete={autoComplete}
					placeholder={placeholder}
					className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
						error
							? "border-red-300 focus:ring-red-200"
							: "border-slate-200 focus:ring-brand-100 focus:border-brand-400"
					}`}
				/>
			</div>
			{error && (
				<p className="mt-1 text-xs text-red-500 flex items-center gap-1">
					<AlertCircle size={12} /> {error}
				</p>
			)}
		</div>
	);
}
