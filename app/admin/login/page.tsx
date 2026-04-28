"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
	const router = useRouter();
	const [form, setForm] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		await new Promise((r) => setTimeout(r, 1200));

		// Demo credentials
		if (
			form.email === "admin@garagemendonca.com" &&
			form.password === "admin123"
		) {
			router.push("/admin/dashboard");
		} else {
			setError("Email ou mot de passe incorrect.");
			setLoading(false);
		}
	};

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
					<div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-600/30">
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
							<rect x="9" y="11" width="14" height="10" rx="2" />
							<circle cx="12" cy="21" r="1" />
							<circle cx="20" cy="21" r="1" />
						</svg>
					</div>
					<h1 className="font-heading font-light text-white text-2xl tracking-tight">
						Garage Mendonca
					</h1>
					<p className="text-dark-400 text-sm mt-1">
						Espace d&apos;administration
					</p>
				</div>

				{/* Card */}
				<div className="bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl p-8">
					<h2 className="font-heading font-medium text-white text-xl mb-6">
						Se connecter
					</h2>

					{error && (
						<div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-5 text-sm flex items-center gap-2">
							<Lock size={15} className="flex-shrink-0" />
							{error}
						</div>
					)}

					{/* Demo hint */}
					<div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 mb-6 text-xs text-brand-400">
						<strong>Demo :</strong> admin@garagemendonca.com /
						admin123
					</div>

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
									placeholder="admin@garagemendonca.com"
									value={form.email}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											email: e.target.value,
										}))
									}
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
									placeholder="••••••••"
									value={form.password}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											password: e.target.value,
										}))
									}
									className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-10 pr-12 py-3 text-white placeholder-dark-500 outline-none transition-all text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
								>
									{showPassword ? (
										<EyeOff size={16} />
									) : (
										<Eye size={16} />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-brand-600 hover:bg-brand-700 text-white font-normal py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-brand-600/20"
						>
							{loading ? (
								<>
									<Loader2
										size={17}
										className="animate-spin"
									/>
									Connexion…
								</>
							) : (
								"Se connecter"
							)}
						</button>
					</form>
				</div>

				<p className="text-center text-dark-500 text-xs mt-6">
					Espace réservé aux administrateurs du garage.
				</p>
			</div>
		</div>
	);
}
