"use client";

import { useForm } from "react-hook-form";
import { buildZodResolver } from "@/lib/ui/formErrorMapper";
import { messageCreateSchema, type MessageCreateInput } from "@/lib/validation/message.schema";
import { useCreateMessage } from "@/lib/mutations/useCreateMessage";

interface MessageFormProps {
  garageId:  string;
  vehicleId?: string;
  onSuccess?: () => void;
}

export function MessageForm({ garageId, vehicleId, onSuccess }: MessageFormProps) {
  const mutation  = useCreateMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageCreateInput>({
    resolver: buildZodResolver(messageCreateSchema),
    defaultValues: {
      garage_id:  garageId,
      vehicle_id: vehicleId,
    },
  });

  async function onSubmit(data: MessageCreateInput) {
    mutation.mutate(data, {
      onSuccess: () => {
        reset({ garage_id: garageId, vehicle_id: vehicleId });
        onSuccess?.();
      },
    });
  }

  const err = (name: keyof MessageCreateInput) =>
    errors[name]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("garage_id")} />
      {vehicleId && <input type="hidden" {...register("vehicle_id")} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Prénom *" error={err("firstname")}>
          <input
            {...register("firstname")}
            autoComplete="given-name"
            placeholder="Jean"
            className={inputCls(err("firstname"))}
          />
        </Field>
        <Field label="Nom *" error={err("lastname")}>
          <input
            {...register("lastname")}
            autoComplete="family-name"
            placeholder="Dupont"
            className={inputCls(err("lastname"))}
          />
        </Field>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email *" error={err("email")}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="jean@exemple.fr"
            className={inputCls(err("email"))}
          />
        </Field>
        <Field label="Téléphone" error={err("phone")}>
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
            className={inputCls(err("phone"))}
          />
        </Field>
      </section>

      <Field label="Sujet" error={err("subject")}>
        <input
          {...register("subject")}
          placeholder="Demande de renseignement"
          className={inputCls(err("subject"))}
        />
      </Field>

      <Field label="Message *" error={err("message")}>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="Votre message…"
          className={inputCls(err("message"))}
        />
      </Field>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}>
        <input {...register("website")} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Envoi…" : "Envoyer le message"}
        </button>

        {mutation.isError && (
          <p className="text-sm text-red-600">
            Une erreur est survenue. Veuillez réessayer.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return [
    "rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
    error
      ? "border-red-400 focus:ring-red-400"
      : "border-gray-300 focus:ring-blue-500",
  ].join(" ");
}
