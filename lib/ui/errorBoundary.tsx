"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─────────────────────────────────────────────────────────────────
//  ErrorBoundary — classe (obligatoire pour componentDidCatch)
// ─────────────────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <DefaultErrorFallback error={this.state.error} onReset={() => this.reset()} />;
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────
//  Fallback par défaut
// ─────────────────────────────────────────────────────────────────

function DefaultErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">
        Une erreur inattendue est survenue.
      </p>
      {process.env.NODE_ENV === "development" && error && (
        <pre className="max-w-sm overflow-auto rounded bg-red-100 p-3 text-left text-xs text-red-800">
          {error.message}
        </pre>
      )}
      <button
        onClick={onReset}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Réessayer
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  QueryErrorBoundary — spécialisé React Query (reset sur retry)
// ─────────────────────────────────────────────────────────────────

export function QueryErrorFallback({
  error,
  resetQuery,
}: {
  error: Error;
  resetQuery: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-gray-500">
        {error.message || "Erreur de chargement des données."}
      </p>
      <button
        onClick={resetQuery}
        className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
      >
        Réessayer
      </button>
    </div>
  );
}
