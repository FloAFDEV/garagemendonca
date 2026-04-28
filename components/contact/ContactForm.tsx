"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { useCreateMessage } from "@/lib/mutations/useCreateMessage";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

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
    name: "",
    email: "",
    phone: "",
    subject: vehicule ? "Renseignement véhicule" : "",
    message: vehicule
      ? `Bonjour, je suis intéressé(e) par le véhicule : ${vehicule}. Pourriez-vous me recontacter ? Merci.`
      : "",
  });
  const [sent, setSent] = useState(false);

  const { mutate, isPending, isError } = useCreateMessage();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        garage_id:  GARAGE_ID || undefined,
        vehicle_id: vehicleId ?? undefined,
        name:       form.name,
        email:      form.email,
        phone:      form.phone || undefined,
        subject:    form.subject || undefined,
        message:    form.message,
      },
      {
        onSuccess: () => setSent(true),
      }
    );
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5" aria-hidden="true">
          <CheckCircle2 size={32} className="text-emerald-600" aria-hidden="true" />
        </div>
        <h3 className="ty-subheading text-[#0f172a] text-2xl mb-3">Message envoyé !</h3>
        <p className="text-[#475569] max-w-md mx-auto">
          Merci pour votre message. Notre équipe vous recontactera dans les plus
          brefs délais, généralement sous 24 heures ouvrables.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="label">
            Nom complet <span className="text-brand-600" aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jean Dupont"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">Téléphone</label>
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

      <div>
        <label htmlFor="email" className="label">
          Email <span className="text-brand-600" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jean.dupont@email.com"
          value={form.email}
          onChange={handleChange}
          className="input-field"
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="subject" className="label">
          Sujet <span className="text-brand-600" aria-hidden="true">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className="input-field"
          aria-required="true"
        >
          <option value="">Sélectionnez un sujet…</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="label">
          Message <span className="text-brand-600" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Décrivez votre demande…"
          value={form.message}
          onChange={handleChange}
          className="input-field resize-none"
          aria-required="true"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          required
          className="mt-1 w-4 h-4 accent-brand-600 cursor-pointer flex-shrink-0"
          aria-required="true"
        />
        <label htmlFor="consent" className="text-sm text-[#475569] cursor-pointer leading-relaxed">
          J&apos;accepte que mes données soient utilisées pour répondre à ma demande.
          Aucune donnée ne sera transmise à des tiers.{" "}
          <a href="/politique-confidentialite" className="text-brand-600 hover:underline">
            Politique de confidentialité
          </a>
        </label>
      </div>

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          Une erreur est survenue. Vérifiez votre email et réessayez.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full justify-center py-4 text-base"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
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
