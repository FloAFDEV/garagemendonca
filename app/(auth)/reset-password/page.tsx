"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 10,          label: "10 caractères minimum" },
  { test: (p: string) => /[A-Z]/.test(p),         label: "1 majuscule" },
  { test: (p: string) => /[0-9]/.test(p),         label: "1 chiffre" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "1 caractère spécial" },
];

function validatePassword(p: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(p)) return `Mot de passe requis : ${rule.label}.`;
  }
  return null;
}

type PageState = "verifying" | "ready" | "invalid" | "submitting" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const submittingRef = useRef(false);

  useEffect(() => {
    // La session a été établie server-side par /auth/callback.
    // On vérifie simplement qu'une session active existe dans les cookies.
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState("ready");
      } else {
        setPageState("invalid");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || pageState !== "ready") return;

    const pwError = validatePassword(password);
    if (pwError) { setFieldError(pwError); return; }
    if (password !== confirm) { setFieldError("Les mots de passe ne correspondent pas."); return; }

    submittingRef.current = true;
    setFieldError("");
    setPageState("submitting");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      submittingRef.current = false;
      setFieldError(error.message);
      setPageState("ready");
    } else {
      setPageState("success");
      setTimeout(() => {
        supabase.auth.signOut().finally(() => router.push("/login"));
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20 shadow-xl">
            <Image
              src="/images/logo-gm.webp"
              alt="Garage Mendonça"
              fill
              sizes="64px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Vérification */}
          {pageState === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 size={32} className="animate-spin text-brand-500" />
              <p className="text-sm text-slate-500">Vérification du lien…</p>
            </div>
          )}

          {/* Lien invalide / session absente */}
          {pageState === "invalid" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle size={40} className="text-red-500" />
              <h1 className="text-lg font-semibold text-slate-800">Lien invalide</h1>
              <p className="text-sm text-slate-500">
                Lien expiré ou déjà utilisé. Demandez un nouvel email de réinitialisation.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="btn-primary w-full py-3 mt-2"
              >
                Retour à la connexion
              </button>
            </div>
          )}

          {/* Succès */}
          {pageState === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle size={40} className="text-green-500" />
              <h1 className="text-lg font-semibold text-slate-800">Mot de passe mis à jour</h1>
              <p className="text-sm text-slate-500">Vous allez être redirigé vers la connexion…</p>
            </div>
          )}

          {/* Formulaire */}
          {(pageState === "ready" || pageState === "submitting") && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-800 mb-1">
                  Nouveau mot de passe
                </h1>
                <p className="text-sm text-slate-500">
                  10 caractères min., 1 majuscule, 1 chiffre, 1 caractère spécial.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldError(""); }}
                      required
                      autoComplete="new-password"
                      disabled={pageState === "submitting"}
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setFieldError(""); }}
                      required
                      autoComplete="new-password"
                      disabled={pageState === "submitting"}
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showConfirm ? "Masquer" : "Afficher"}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {fieldError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {fieldError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pageState === "submitting"}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pageState === "submitting" && <Loader2 size={16} className="animate-spin" />}
                  {pageState === "submitting" ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
