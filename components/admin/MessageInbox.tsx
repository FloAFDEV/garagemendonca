"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/lib/queries/useMessages";
import { InboxRowSkeleton } from "@/components/ui/Skeleton";
import { QueryErrorFallback } from "@/lib/ui/errorBoundary";
import { messageKeys } from "@/lib/queries/keys";
import { updateMessageStatusAction } from "@/lib/safe-actions/updateMessageStatus";
import { toast } from "@/lib/ui/toastManager";
import type { UIMessage } from "@/types/ui";

interface MessageInboxProps {
  garageId: string;
}

export function MessageInbox({ garageId }: MessageInboxProps) {
  const { data, isLoading, isError, error, refetch } = useMessages(garageId);

  if (isError) {
    return (
      <QueryErrorFallback
        error={error instanceof Error ? error : new Error("Erreur de chargement")}
        resetQuery={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <InboxRowSkeleton key={i} />)}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-gray-400">Aucun message pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((message) => (
        <MessageRow key={message.id} message={message} garageId={garageId} />
      ))}
    </div>
  );
}

function MessageRow({ message, garageId }: { message: UIMessage; garageId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: "new" | "read" | "archived") =>
      updateMessageStatusAction(message.id, garageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.list(garageId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.unread(garageId) });
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le statut.");
    },
  });

  const isNew      = message.status === "new";
  const isArchived = message.status === "archived";

  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${
        isNew
          ? "border-blue-200 bg-blue-50"
          : isArchived
          ? "border-gray-100 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-semibold text-gray-900">{message.name}</span>
            <span className="text-sm text-gray-500">{message.email}</span>
            {message.phone && (
              <span className="text-sm text-gray-400">{message.phone}</span>
            )}
            <span className="ml-auto text-xs text-gray-400">{message.formattedDate}</span>
          </div>

          {message.subject && (
            <p className="mt-1 text-sm font-medium text-gray-700">{message.subject}</p>
          )}

          <p className="mt-1 text-sm text-gray-600 line-clamp-3">{message.message}</p>
        </div>

        {isNew && (
          <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            Nouveau
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isNew && (
          <ActionButton
            onClick={() => mutation.mutate("read")}
            disabled={mutation.isPending}
            variant="neutral"
          >
            Marquer comme lu
          </ActionButton>
        )}
        {!isArchived && (
          <ActionButton
            onClick={() => mutation.mutate("archived")}
            disabled={mutation.isPending}
            variant="ghost"
          >
            Archiver
          </ActionButton>
        )}
        {isArchived && (
          <ActionButton
            onClick={() => mutation.mutate("new")}
            disabled={mutation.isPending}
            variant="ghost"
          >
            Restaurer
          </ActionButton>
        )}
        {message.isUnread === false && !isArchived && (
          <a
            href={`mailto:${message.email}?subject=Re: ${message.subject ?? "Votre message"}`}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Répondre
          </a>
        )}
      </div>
    </article>
  );
}

function ActionButton({
  onClick,
  disabled,
  variant,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  variant: "neutral" | "ghost";
  children: React.ReactNode;
}) {
  const cls =
    variant === "neutral"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      : "border border-transparent text-gray-400 hover:text-gray-600";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}
