"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { messageKeys } from "@/lib/queries/keys";
import { createMessageAction } from "@/lib/safe-actions/createMessage";
import { extractGlobalError } from "@/lib/ui/formErrorMapper";
import type { MessageCreateInput } from "@/lib/validation/message.schema";

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MessageCreateInput) => {
      const result = await createMessageAction(input);
      if ("error" in result && result.error) throw result.error;
      return result.data;
    },

    onSuccess: (_data, vars) => {
      if (vars.garage_id) {
        // Invalider TOUTES les listes du garage (via préfixe lists) + unread.
        queryClient.invalidateQueries({ queryKey: messageKeys.lists(vars.garage_id) });
        queryClient.invalidateQueries({ queryKey: messageKeys.unread(vars.garage_id) });
      }
      toast.success("Votre message a bien été envoyé. Nous vous répondrons rapidement.");
    },

    onError: (err: unknown) => {
      const msg = extractGlobalError(err) ?? "Erreur lors de l'envoi du message.";
      toast.error(msg);
    },
  });
}
