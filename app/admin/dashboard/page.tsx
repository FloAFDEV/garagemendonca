import AdminLayout from "@/components/admin/AdminLayout";
import { vehicles } from "@/lib/data";
import { Car, Eye, TrendingUp, Phone, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

/* Stats dynamiques depuis les vraies données */
const stockCount = vehicles.filter((v) => v.status !== "sold").length;
const soldCount = vehicles.filter((v) => v.status === "sold").length;
const publishedCount = vehicles.filter((v) => v.status === "published").length;

const stats = [
	{
		label: "Véhicules en stock",
		value: stockCount.toString(),
		change: `${publishedCount} publiés`,
		icon: Car,
		color: "text-brand-500",
		bg: "bg-brand-500/10",
	},
	{
		label: "Vues ce mois",
		value: "1 284",
		change: "+18%",
		icon: Eye,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
	{
		label: "Demandes recues",
		value: "23",
		change: "+5 cette semaine",
		icon: Phone,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
	},
	{
		label: "Véhicules vendus",
		value: soldCount.toString(),
		change: "au total",
		icon: TrendingUp,
		color: "text-violet-500",
		bg: "bg-violet-500/10",
	},
];

const recentMessages = [
	{
		name: "Marc Leblanc",
		subject: "Renseignement Peugeot 308 SW",
		time: "Il y a 2h",
	},
	{
		name: "Sophie Durand",
		subject: "Demande de devis freinage",
		time: "Il y a 5h",
	},
	{ name: "Thomas Martin", subject: "Intéressé BMW Série 1", time: "Hier" },
	{ name: "Julie Fontaine", subject: "Rendez-vous révision", time: "Hier" },
];

export default function DashboardPage() {
	return (
		<AdminLayout>
			<div className="space-y-6">
				{/* Welcome */}
				<div className="flex items-center justify-between">
					<div>
						<h2 className="font-heading font-bold text-white text-2xl">
							Bonjour 👋
						</h2>
						<p className="text-dark-400 mt-1 text-sm">
							Voici un apercu de votre activité aujourd&apos;hui.
						</p>
					</div>
					<Link
						href="/admin/vehicules/nouveau"
						className="btn-primary text-sm"
					>
						<Plus size={16} />
						Ajouter un véhicule
					</Link>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
					{stats.map(
						({ label, value, change, icon: Icon, color, bg }) => (
							<div
								key={label}
								className="bg-dark-900 rounded-2xl border border-dark-800 p-6"
							>
								<div className="flex items-center justify-between mb-4">
									<div
										className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}
									>
										<Icon size={20} className={color} />
									</div>
								</div>
								<div className="font-heading font-black text-white text-3xl mb-1">
									{value}
								</div>
								<div className="text-dark-400 text-sm">
									{label}
								</div>
								<div className="text-dark-500 text-xs mt-1">
									{change}
								</div>
							</div>
						),
					)}
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					{/* Recent vehicles */}
					<div className="xl:col-span-2 bg-dark-900 rounded-2xl border border-dark-800 p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="font-heading font-semibold text-white">
								Véhicules en stock
							</h3>
							<Link
								href="/admin/vehicules"
								className="text-brand-400 text-sm font-medium flex items-center gap-1 hover:text-brand-300 transition-colors"
							>
								Gérer
								<ArrowRight size={14} />
							</Link>
						</div>
						<div className="space-y-3">
							{vehicles.slice(0, 5).map((v) => (
								<div
									key={v.id}
									className="flex items-center justify-between py-3 border-b border-dark-800 last:border-0"
								>
									<div>
										<div className="text-white font-medium text-sm">
											{v.brand} {v.model}
										</div>
										<div className="text-dark-500 text-xs mt-0.5">
											{v.year} ·{" "}
											{v.mileage.toLocaleString("fr-FR")}{" "}
											km · {v.fuel}
										</div>
									</div>
									<div className="flex items-center gap-4">
										<span className="font-heading font-bold text-brand-400">
											{v.price.toLocaleString("fr-FR")} €
										</span>
										<Link
											href={`/admin/vehicules`}
											className="text-dark-500 hover:text-white transition-colors"
										>
											<ArrowRight size={14} />
										</Link>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Recent messages */}
					<div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
						<h3 className="font-heading font-semibold text-white mb-6">
							Derniers messages
						</h3>
						<div className="space-y-4">
							{recentMessages.map(({ name, subject, time }) => (
								<div
									key={name}
									className="flex items-start gap-3 py-3 border-b border-dark-800 last:border-0"
								>
									<div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-dark-300 text-xs font-bold">
											{name[0]}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-white text-sm font-medium truncate">
											{name}
										</div>
										<div className="text-dark-500 text-xs mt-0.5 truncate">
											{subject}
										</div>
										<div className="text-dark-600 text-xs mt-1">
											{time}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
