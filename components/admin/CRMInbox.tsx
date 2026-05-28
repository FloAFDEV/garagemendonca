"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import {
	Mail,
	Search,
	MailOpen,
	Archive,
	Trash2,
	ArrowLeft,
	Send,
	Phone,
	Car,
	Clock,
	CheckCircle,
	AlertCircle,
	RefreshCw,
	StickyNote,
	ChevronDown,
	X,
	Inbox,
	ExternalLink,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { toast } from "sonner";

import { messageKeys } from "@/lib/queries/keys";
import {
	fetchMessagesAction,
	fetchMessageWithRepliesAction,
} from "@/lib/safe-actions/fetchMessages";
import {
	updateMessageStatusAction,
	updateMessageNotesAction,
	deleteMessageAction,
} from "@/lib/safe-actions/updateMessageStatus";
import { replyToMessageAction } from "@/lib/safe-actions/replyToMessage";
import type { UIMessage } from "@/types/ui";
import type { MessageStatusInput } from "@/lib/validation/message.schema";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAdminTokens } from "@/contexts/AdminThemeContext";

// ─────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<
	string,
	{
		label: string;
		color: string;
		icon: React.ComponentType<{ size?: number; className?: string }>;
	}
> = {
	new: { label: "Nouveau", color: "bg-blue-100 text-blue-700", icon: Mail },
	in_progress: {
		label: "En cours",
		color: "bg-amber-100 text-amber-700",
		icon: AlertCircle,
	},
	answered: {
		label: "Répondu",
		color: "bg-emerald-100 text-emerald-700",
		icon: CheckCircle,
	},
	archived: {
		label: "Archivé",
		color: "bg-slate-100 text-slate-500",
		icon: Archive,
	},
};

const FILTERS = [
	{ key: "all", label: "Tous" },
	{ key: "new", label: "Nouveaux" },
	{ key: "in_progress", label: "En cours" },
	{ key: "answered", label: "Répondus" },
	{ key: "archived", label: "Archivés" },
] as const;

// ─────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────

function initials(firstname: string, lastname: string) {
	return `${firstname[0] ?? "?"}${lastname[0] ?? ""}`.toUpperCase();
}

function avatarColor(id: string) {
	const colors = [
		"bg-blue-500",
		"bg-violet-500",
		"bg-emerald-500",
		"bg-amber-500",
		"bg-rose-500",
		"bg-cyan-500",
	];
	const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
	return colors[hash % colors.length];
}

// ─────────────────────────────────────────────────────────────────
//  StatusBadge
// ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
	const cfg = STATUS_LABELS[status] ?? STATUS_LABELS.new;
	const Icon = cfg.icon;
	return (
		<span
			className={clsx(
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 whitespace-nowrap",
				cfg.color,
			)}
		>
			<Icon size={10} className="shrink-0" />
			{cfg.label}
		</span>
	);
}

// ─────────────────────────────────────────────────────────────────
//  MessageListItem
// ─────────────────────────────────────────────────────────────────

function MessageListItem({
	message,
	isSelected,
	onClick,
}: {
	message: UIMessage;
	isSelected: boolean;
	onClick: () => void;
}) {
	const { isDark } = useAdminTokens();

	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"w-full text-left px-4 py-3 border-b transition-colors",
				isDark ? "border-dark-800" : "border-slate-100",
				isSelected
					? isDark
						? "bg-dark-800 border-l-2 border-l-brand-500"
						: "bg-rose-50 border-l-2 border-l-brand-500"
					: !message.is_read
						? isDark
							? "bg-dark-850 hover:bg-dark-800"
							: "bg-blue-50 hover:bg-blue-100/80"
						: isDark
							? "hover:bg-dark-800/50"
							: "hover:bg-slate-50",
			)}
		>
			<div className="flex items-start gap-3">
				{/* Avatar */}
				<div
					className={clsx(
						"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0",
						avatarColor(message.id),
					)}
				>
					{initials(message.firstname, message.lastname)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2 mb-0.5">
						<span
							className={clsx(
								"text-sm font-semibold truncate",
								!message.is_read
									? isDark ? "text-slate-100" : "text-slate-900"
									: isDark ? "text-dark-400" : "text-slate-600",
							)}
						>
							{message.firstname} {message.lastname}
						</span>
						<span className={clsx(
							"text-xs shrink-0",
							isDark ? "text-slate-500" : "text-slate-400",
						)}>
							{message.formattedDate}
						</span>
					</div>

					<div className="flex items-center gap-2 mb-1">
						{!message.is_read && (
							<span
								className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
								aria-label="Non lu"
							/>
						)}
						<span className={clsx(
							"text-xs truncate",
							isDark ? "text-slate-400" : "text-slate-500",
						)}>
							{message.subject ?? "Sans sujet"}
						</span>
					</div>

					{/* Véhicule concerné — visible directement dans la liste */}
					{message.vehicleName && (
						<div className="flex items-center gap-1 mb-1">
							<Car size={11} className={clsx(isDark ? "text-brand-400" : "text-brand-600", "flex-shrink-0")} />
							<span className={clsx("text-xs truncate font-medium", isDark ? "text-brand-400" : "text-brand-600")}>
								{message.vehicleName}
							</span>
						</div>
					)}

					<p className={clsx(
						"text-xs truncate leading-relaxed",
						isDark ? "text-slate-500" : "text-slate-400",
					)}>
						{message.message}
					</p>
				</div>
			</div>
		</button>
	);
}

// ─────────────────────────────────────────────────────────────────
//  MessageDetail
// ─────────────────────────────────────────────────────────────────

function MessageDetail({
	message,
	garageId,
	onClose,
}: {
	message: UIMessage;
	garageId: string;
	onClose: () => void;
}) {
	const qc = useQueryClient();
	const [replyText, setReplyText] = useState("");
	const [notes, setNotes] = useState(message.admin_notes ?? "");
	const [notesDirty, setNotesDirty] = useState(false);
	const [showNotes, setShowNotes] = useState(!!message.admin_notes);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Charger le détail complet avec réponses
	const { data: fullMessage, isLoading: loadingDetail } = useQuery({
		queryKey: messageKeys.detail(message.id),
		queryFn: () => fetchMessageWithRepliesAction(message.id, garageId),
	});

	const displayed = fullMessage ?? message;

	// 1 seule invalidation en cascade (couvre list, detail, unread, stats)
	const invalidate = useCallback(() => {
		qc.invalidateQueries({ queryKey: messageKeys.all() });
	}, [qc]);

	// Status mutation
	const statusMut = useMutation({
		mutationFn: (s: MessageStatusInput) =>
			updateMessageStatusAction(message.id, garageId, s),
		onSuccess: () => {
			invalidate();
			toast.success("Statut mis à jour.");
		},
		onError: () => toast.error("Impossible de mettre à jour le statut."),
	});

	// Delete mutation
	const deleteMut = useMutation({
		mutationFn: () => deleteMessageAction(message.id, garageId),
		onSuccess: () => {
			setDeleteOpen(false);
			invalidate();
			onClose();
			toast.success("Message supprimé.");
		},
		onError: () => {
			setDeleteOpen(false);
			toast.error("Impossible de supprimer le message.");
		},
	});

	// Reply mutation
	const replyMut = useMutation({
		mutationFn: () =>
			replyToMessageAction(
				{
					message_id: message.id,
					garage_id: garageId,
					sender_type: "admin",
					content: replyText.trim(),
				},
				garageId,
			),
		onSuccess: () => {
			setReplyText("");
			invalidate();
			toast.success("Réponse envoyée par email.");
		},
		onError: () => toast.error("Erreur lors de l'envoi de la réponse."),
	});

	// Notes save
	const saveNotes = useCallback(async () => {
		if (!notesDirty) return;
		await updateMessageNotesAction(message.id, garageId, notes || null);
		setNotesDirty(false);
		toast.success("Notes enregistrées.");
	}, [message.id, garageId, notes, notesDirty]);

	// Auto-mark as read on open
	useEffect(() => {
		if (!message.is_read) {
			updateMessageStatusAction(message.id, garageId, "in_progress")
				.then(() => invalidate())
				.catch(() => {});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message.id]);

	const replies = displayed.replies ?? [];

	return (
		<div className="flex flex-col h-full bg-dark-950">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 py-3 border-b border-dark-800 bg-dark-900 shrink-0">
				<button
					onClick={onClose}
					className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-slate-400"
					aria-label="Retour à la liste"
				>
					<ArrowLeft size={18} />
				</button>

				<div
					className={clsx(
						"w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0",
						avatarColor(message.id),
					)}
				>
					{initials(message.firstname, message.lastname)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 min-w-0">
						<h2 className="font-semibold text-dark-300 truncate text-sm">
							{message.firstname} {message.lastname}
						</h2>
						<StatusBadge status={displayed.status} />
					</div>
					<div className="flex items-center gap-3 text-xs text-dark-500">
						<a
							href={`mailto:${message.email}`}
							className="hover:text-brand-400 truncate"
						>
							{message.email}
						</a>
						{message.phone && (
							<a
								href={`tel:${message.phone}`}
								className="hover:text-brand-400 flex items-center gap-1 shrink-0"
							>
								<Phone size={11} />
								{message.phone}
							</a>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					{displayed.status !== "archived" ? (
						<button
							onClick={() => statusMut.mutate("archived")}
							disabled={statusMut.isPending}
							className="p-2 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-slate-200 transition-colors"
							title="Archiver"
						>
							<Archive size={16} />
						</button>
					) : (
						<button
							onClick={() => statusMut.mutate("new")}
							disabled={statusMut.isPending}
							className="p-2 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-slate-200 transition-colors"
							title="Restaurer"
						>
							<Inbox size={16} />
						</button>
					)}

					<button
						onClick={() => setDeleteOpen(true)}
						disabled={deleteMut.isPending}
						className="p-2 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"
						title="Supprimer"
						aria-label="Supprimer ce message"
					>
						<Trash2 size={16} />
					</button>

					<ConfirmModal
						isOpen={deleteOpen}
						onCancel={() => setDeleteOpen(false)}
						onConfirm={() => deleteMut.mutate()}
						isLoading={deleteMut.isPending}
						title="Supprimer ce message ?"
						description={
							<>
								Le message de{" "}
								<strong className="text-dark-300">
									{message.firstname} {message.lastname}
								</strong>{" "}
								sera définitivement supprimé. Cette action est
								irréversible.
							</>
						}
						confirmLabel="Supprimer définitivement"
					/>
				</div>
			</div>

			{/* Corps scrollable */}
			<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
				{/* Méta */}
				<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
					<span className="flex items-center gap-1">
						<Clock size={12} />
						{message.formattedDate}
					</span>
					{message.subject && (
						<span className="text-slate-400 font-medium">
							{message.subject}
						</span>
					)}
				</div>

				{/* Message original */}
				<div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
					{message.vehicleId && (
						<div className="flex items-center gap-2 px-4 py-2.5 border-b border-dark-800 bg-dark-900/60">
							<Car size={12} className="text-brand-400 flex-shrink-0" />
							{message.vehicleHref ? (
								<Link
									href={message.vehicleHref}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
								>
									{message.vehicleName ?? "Véhicule lié"}
									<ExternalLink size={10} />
								</Link>
							) : (
								<span className="text-xs text-brand-400 font-medium">
									{message.vehicleName ?? "Véhicule lié"}
								</span>
							)}
						</div>
					)}
					<p className="text-sm text-dark-400 leading-relaxed whitespace-pre-wrap break-words overflow-hidden px-4 py-4">
						{message.message}
					</p>
				</div>

				{/* Changement de statut manuel */}
				<div className="flex flex-wrap gap-2">
					{(
						[
							"new",
							"in_progress",
							"answered",
						] as MessageStatusInput[]
					).map((s) => (
						<button
							key={s}
							onClick={() => statusMut.mutate(s)}
							disabled={
								statusMut.isPending || displayed.status === s
							}
							className={clsx(
								"px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
								displayed.status === s
									? "border-brand-500 text-brand-400 bg-brand-500/10"
									: "border-dark-700 text-slate-400 hover:border-dark-600 hover:text-slate-300",
							)}
						>
							{STATUS_LABELS[s]?.label}
						</button>
					))}
				</div>

				{/* Fil des réponses */}
				{loadingDetail && (
					<div className="flex justify-center py-4">
						<RefreshCw
							size={16}
							className="animate-spin text-slate-500"
						/>
					</div>
				)}

				{replies.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
							Historique
						</h3>
						{replies.map((reply) => (
							<div
								key={reply.id}
								className={clsx(
									"flex gap-3",
									reply.sender_type === "admin"
										? "justify-end"
										: "justify-start",
								)}
							>
								<div
									className={clsx(
										"max-w-[80%] rounded-xl px-4 py-3 text-sm",
										reply.sender_type === "admin"
											? "bg-brand-600 text-white rounded-br-sm"
											: "bg-dark-800 text-slate-300 border border-dark-700 rounded-bl-sm",
									)}
								>
									<p className="leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
										{reply.content}
									</p>
									<p
										className={clsx(
											"text-xs mt-1.5",
											reply.sender_type === "admin"
												? "text-brand-200"
												: "text-slate-500",
										)}
									>
										{reply.sender_type === "admin"
											? "Vous"
											: `${message.firstname}`}{" "}
										· {reply.formattedDate}
									</p>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Notes internes */}
				<div className="border border-dark-700 rounded-xl overflow-hidden">
					<button
						onClick={() => setShowNotes((v) => !v)}
						className="w-full flex items-center justify-between px-4 py-3 bg-dark-900 text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-dark-800 transition-colors"
					>
						<span className="flex items-center gap-2">
							<StickyNote size={13} />
							Notes internes {notes && "(renseignées)"}
						</span>
						<ChevronDown
							size={14}
							className={clsx(
								"transition-transform",
								showNotes && "rotate-180",
							)}
						/>
					</button>
					{showNotes && (
						<div className="p-3 bg-dark-950">
							<textarea
								rows={4}
								value={notes}
								onChange={(e) => {
									setNotes(e.target.value);
									setNotesDirty(true);
								}}
								onBlur={saveNotes}
								placeholder="Notes privées (non visibles par le client)…"
								className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-brand-500 transition-colors"
							/>
							{notesDirty && (
								<button
									onClick={saveNotes}
									className="mt-2 text-xs text-brand-400 hover:text-brand-300"
								>
									Enregistrer les notes
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Zone de réponse */}
			{displayed.status !== "archived" && (
				<div className="shrink-0 border-t border-dark-800 bg-dark-900 p-4">
					<label htmlFor={`reply-${message.id}`} className="sr-only">
						Répondre au client
					</label>
					<textarea
						id={`reply-${message.id}`}
						ref={textareaRef}
						rows={3}
						value={replyText}
						onChange={(e) => setReplyText(e.target.value)}
						onKeyDown={(e) => {
							if (
								e.key === "Enter" &&
								(e.metaKey || e.ctrlKey) &&
								replyText.trim().length >= 5
							) {
								replyMut.mutate();
							}
						}}
						placeholder="Répondre au client (envoyé par email)…"
						className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-brand-500 transition-colors"
					/>
					<div className="flex items-center justify-between mt-2">
						<span className="hidden sm:block text-xs text-slate-600">
							⌘/Ctrl + Entrée pour envoyer
						</span>
						<span className="sm:hidden text-xs text-slate-600" aria-hidden="true" />
						<button
							onClick={() => replyMut.mutate()}
							disabled={
								replyMut.isPending ||
								replyText.trim().length < 5
							}
							className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
						>
							{replyMut.isPending ? (
								<RefreshCw size={14} className="animate-spin" />
							) : (
								<Send size={14} />
							)}
							Envoyer
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────
//  CRMInbox (composant principal)
// ─────────────────────────────────────────────────────────────────

interface CRMInboxProps {
	garageId: string;
}

export function CRMInbox({ garageId }: CRMInboxProps) {
	const searchParams  = useSearchParams();
	const [filter, setFilter] = useState<
		"all" | "new" | "in_progress" | "answered" | "archived"
	>("all");
	const [search,      setSearch]      = useState("");
	const [vehicleOnly, setVehicleOnly] = useState(false);
	// Initialise la sélection depuis ?id= (lien direct depuis email de notification)
	const [selectedId, setSelectedId]   = useState<string | null>(
		searchParams.get("id"),
	);
	const qc = useQueryClient();

	// Liste messages — fetch unique, filtrage côté client
	const {
		data: messages = [],
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: messageKeys.list(garageId),
		queryFn: () => fetchMessagesAction(garageId),
		staleTime: 2 * 60 * 1000,
	});

	// Realtime Supabase
	useEffect(() => {
		const supabase = createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		);

		const channel = supabase
			.channel("crm-messages")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "messages",
					filter: `garage_id=eq.${garageId}`,
				},
				() => {
					qc.invalidateQueries({ queryKey: messageKeys.all() });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [garageId, qc]);

	const selectedMessage = messages.find((m) => m.id === selectedId) ?? null;

	const unreadCount = messages.filter(
		(m) => !m.is_read && m.status !== "archived",
	).length;

	// Filtrage 100% client — statut, recherche, filtre véhicule
	const displayed = useMemo(() => messages.filter((m) => {
		if (filter !== "all" && m.status !== filter) return false;
		if (vehicleOnly && !m.vehicleId) return false;
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			m.firstname.toLowerCase().includes(q) ||
			m.lastname.toLowerCase().includes(q) ||
			m.email.toLowerCase().includes(q) ||
			m.subject?.toLowerCase().includes(q) ||
			m.message.toLowerCase().includes(q) ||
			(m.vehicleName?.toLowerCase().includes(q) ?? false)
		);
	}), [messages, filter, vehicleOnly, search]);

	// dvh = dynamic viewport height — adapts when mobile browser chrome shows/hides
	return (
	<div className="flex h-[calc(100dvh-80px)] bg-dark-950 rounded-xl overflow-hidden border border-dark-800">
			{/* ── Panneau gauche : liste ─────────────────────────────── */}
			<div
				className={clsx(
					"flex flex-col bg-dark-900 border-r border-dark-800 transition-all",
					selectedId
						? "hidden lg:flex lg:w-80 xl:w-96"
						: "flex w-full lg:w-80 xl:w-96",
				)}
			>
				{/* En-tête liste */}
				<div className="px-4 pt-4 pb-3 border-b border-dark-800 space-y-3">
					<div className="flex items-center justify-between">
						<h1 className="font-semibold text-dark-300 flex items-center gap-2">
							<Mail size={18} className="text-brand-400" />
							Messages
							{unreadCount > 0 && (
								<span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
									{unreadCount}
								</span>
							)}
						</h1>
						<button
							onClick={() => refetch()}
							className="p-1.5 rounded-lg hover:bg-dark-800 text-slate-500 hover:text-slate-300 transition-colors"
							title="Actualiser"
						>
							<RefreshCw size={15} />
						</button>
					</div>

					{/* Recherche */}
					<div className="relative">
						<Search
							size={15}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
						/>
						<input
							type="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Rechercher…"
							className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
						/>
						{search && (
							<button
								onClick={() => setSearch("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
							>
								<X size={14} />
							</button>
						)}
					</div>

					{/* Filtres statut */}
					<div className="flex gap-1 flex-wrap">
						{FILTERS.map((f) => (
							<button
								key={f.key}
								onClick={() => setFilter(f.key)}
								className={clsx(
									"px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
									filter === f.key
										? "bg-brand-600 text-white"
										: "bg-dark-800 text-slate-400 hover:text-slate-200 hover:bg-dark-700",
								)}
							>
								{f.label}
							</button>
						))}
					</div>

					{/* Filtre véhicule */}
					<button
						onClick={() => setVehicleOnly((v) => !v)}
						className={clsx(
							"flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
							vehicleOnly
								? "bg-brand-600/20 border-brand-500 text-brand-300"
								: "bg-dark-800 border-dark-700 text-slate-500 hover:text-slate-300 hover:border-dark-600",
						)}
					>
						<Car size={12} />
						Avec véhicule
					</button>
				</div>

				{/* Liste */}
				<div className="flex-1 overflow-y-auto">
					{isLoading && (
						<div className="space-y-0">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="px-4 py-3 border-b border-dark-800 animate-pulse"
								>
									<div className="flex gap-3">
										<div className="w-10 h-10 rounded-full bg-dark-700" />
										<div className="flex-1 space-y-2">
											<div className="h-3 bg-dark-700 rounded w-3/4" />
											<div className="h-2.5 bg-dark-800 rounded w-full" />
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{isError && (
						<div className="flex flex-col items-center gap-3 py-12 text-center px-4">
							<p className="text-slate-400 text-sm">
								Erreur de chargement
							</p>
							<button
								onClick={() => refetch()}
								className="text-brand-400 text-sm hover:text-brand-300"
							>
								Réessayer
							</button>
						</div>
					)}

					{!isLoading && !isError && displayed.length === 0 && (
						<div className="flex flex-col items-center gap-3 py-16 text-center px-4">
							<MailOpen size={32} className="text-slate-600" />
							<p className="text-slate-500 text-sm">
								{search
									? "Aucun résultat pour cette recherche."
									: "Aucun message dans cette catégorie."}
							</p>
						</div>
					)}

					{displayed.map((msg) => (
						<MessageListItem
							key={msg.id}
							message={msg}
							isSelected={selectedId === msg.id}
							onClick={() => setSelectedId(msg.id)}
						/>
					))}
				</div>
			</div>

			{/* ── Panneau droit : détail ─────────────────────────────── */}
			<div
				className={clsx(
					"flex-1 min-w-0",
					!selectedId
						? "hidden lg:flex lg:items-center lg:justify-center"
						: "flex flex-col",
				)}
			>
				{!selectedId ? (
					<div className="text-center space-y-2 px-8">
						<MailOpen
							size={40}
							className="text-slate-600 mx-auto"
						/>
						<p className="text-slate-500 text-sm">
							Sélectionnez un message pour le lire
						</p>
					</div>
				) : selectedMessage ? (
					<MessageDetail
						key={selectedId}
						message={selectedMessage}
						garageId={garageId}
						onClose={() => setSelectedId(null)}
					/>
				) : null}
			</div>
		</div>
	);
}
