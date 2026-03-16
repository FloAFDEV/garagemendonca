"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

const subjects = [
  "Demande de devis réparation",
  "Renseignement véhicule",
  "Prise de rendez-vous",
  "Demande d'information",
  "Autre",
];

export default function ContactForm({ vehicule }: { vehicule?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: vehicule ? "Renseignement véhicule" : "",
    message: vehicule ? `Bonjour, je suis intéressé(e) par le véhicule : ${vehicule}. Pourriez-vous me recontacter ? Merci.` : "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h3 className="font-heading font-bold text-dark-900 text-2xl mb-3">
          Message envoyé !
        </h3>
        <p className="text-dark-500 max-w-md mx-auto">
          Merci pour votre message. Notre équipe vous recontactera dans les plus
          brefs délais, généralement sous 24 heures ouvrables.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
          }}
          className="mt-6 text-brand-600 font-semibold hover:text-brand-700 transition-colors text-sm"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dark-100 shadow-sm p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="label">
            Nom complet <span className="text-brand-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jean Dupont"
            value={form.name}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={form.phone}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email <span className="text-brand-600">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jean.dupont@email.com"
          value={form.email}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="subject" className="label">
          Sujet <span className="text-brand-600">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Sélectionnez un sujet…</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="label">
          Message <span className="text-brand-600">*</span>
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
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          required
          className="mt-1 w-4 h-4 accent-brand-600 cursor-pointer"
        />
        <label htmlFor="consent" className="text-sm text-dark-500 cursor-pointer">
          J&apos;accepte que mes données soient utilisées pour répondre à ma demande.
          Aucune donnée ne sera transmise à des tiers.
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {status === "sending" ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send size={18} />
            Envoyer le message
          </>
        )}
      </button>
    </form>
  );
}
