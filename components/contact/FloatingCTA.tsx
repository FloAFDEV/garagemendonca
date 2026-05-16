"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, X, MessageCircle, Mail } from "lucide-react";

const PHONE = "0532002038";
const PHONE_DISPLAY = "05 32 00 20 38";

export default function FloatingCTA() {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3"
			aria-label="Boutons de contact rapide"
		>
			{/* Actions expandées */}
			<div
				className={`flex flex-col items-end gap-3 transition-all duration-200 ${
					open
						? "opacity-100 translate-y-0 pointer-events-auto"
						: "opacity-0 translate-y-4 pointer-events-none"
				}`}
				aria-hidden={!open}
			>
				{/* Formulaire de contact */}
				<Link
					href="/contact"
					onClick={() => setOpen(false)}
					className="flex items-center gap-3 bg-slate-800 text-white rounded-full shadow-lg px-4 py-3 font-medium text-sm hover:bg-slate-700 transition-colors active:scale-95"
					aria-label="Accéder au formulaire de contact"
				>
					<span className="hidden sm:inline">Contactez-nous</span>
					<Mail
						size={20}
						className="flex-shrink-0"
						aria-hidden="true"
					/>
				</Link>

				{/* Appel téléphonique */}
				<a
					href={`tel:${PHONE}`}
					className="flex items-center gap-3 bg-brand-600 text-white rounded-full shadow-lg px-4 py-3 font-medium text-sm hover:bg-brand-700 transition-colors active:scale-95"
					aria-label={`Appeler le ${PHONE_DISPLAY}`}
				>
					<span className="hidden sm:inline">{PHONE_DISPLAY}</span>
					<Phone
						size={20}
						className="flex-shrink-0"
						aria-hidden="true"
					/>
				</a>
			</div>

			{/* Bouton principal */}
			<button
				onClick={() => setOpen((v) => !v)}
				className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
					open
						? "bg-slate-700 hover:bg-slate-600"
						: "bg-brand-600 hover:bg-brand-700 animate-bounce-slow"
				}`}
				aria-label={
					open
						? "Fermer les options de contact"
						: "Contacter le garage"
				}
				aria-expanded={open}
			>
				{open ? (
					<X size={24} className="text-white" aria-hidden="true" />
				) : (
					<MessageCircle
						size={24}
						className="text-white"
						aria-hidden="true"
					/>
				)}
			</button>
		</div>
	);
}
