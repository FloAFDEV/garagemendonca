"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

// ─────────────────────────────────────────────────────────────────
//  Configuration globale React Query
//
//  On crée le QueryClient dans useState pour que chaque session
//  Next.js ait son propre client (évite le partage entre requêtes).
// ─────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Pas de refetch automatique sur focus window (contenu catalogue stable)
        refetchOnWindowFocus: false,
        // Retry 1 fois avant d'afficher l'erreur
        retry: 1,
        // Données jamais considérées comme "fresh" par défaut (override par hook)
        staleTime: 0,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
