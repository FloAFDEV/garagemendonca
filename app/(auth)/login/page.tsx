"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import Image from "next/image";
import { signInAction } from "@/lib/auth/actions";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? undefined;
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signInAction(email, password, from, turnstileToken);
    if (result?.error) {
      setError(result.error);
      if (result.requireTurnstile) setShowTurnstile(true);
      setTurnstileToken(undefined);
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl p-8">
      <h2 className="font-heading font-medium text-white text-xl mb-6">
        Se connecter
      </h2>

      {isUnauthorized && (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl p-4 mb-5 text-sm flex items-center gap-2">
          <Lock size={15} className="flex-shrink-0" />
          Accès refusé — vous n&apos;avez pas les droits admin.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-5 text-sm flex items-center gap-2">
          <Lock size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-dark-300 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"
            />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-10 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-dark-300 mb-2"
          >
            Mot de passe
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-10 pr-12 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {showTurnstile && (
          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(undefined)}
          />
        )}

        <button
          type="submit"
          disabled={loading || (showTurnstile && !turnstileToken)}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-normal py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-brand-600/20"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src="/images/logo-gm.webp"
              alt="Garage Mendonça"
              fill
              sizes="80px"
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>
          <h1 className="font-heading font-light text-white text-2xl tracking-tight">
            Garage Mendonca
          </h1>
          <p className="text-dark-400 text-sm mt-1">Espace d&apos;administration</p>
        </div>

        <Suspense
          fallback={
            <div className="bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl p-8 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-dark-500 text-xs mt-6">
          Espace réservé aux administrateurs du garage.
        </p>
      </div>
    </div>
  );
}
