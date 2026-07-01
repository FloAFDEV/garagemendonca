"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
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
import { STALE_TIMES } from "@/lib/queries/config";
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
	new:         { label: "Nouveau",  color: "bg-blue-50 text-blue-600",     icon: Mail },
	in_progress: { label: "En cours", color: "bg-amber-50 text-amber-700",   icon: AlertCircle },
	answered:    { label: "Répondu",  color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
	archived:    { label: "Archivé",  color: "bg-slate-100 text-slate-500",  icon: Archive },
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

function formatRelativeTime(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 5)  return "à l'instant";
	if (seconds < 60) return `il y a ${seconds} s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `il y a ${minutes} min`;
	return `à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
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
				"inline-flex items-center gap-1 rounded-full px-1.5 py-px text-xs font-medium shrink-0 whitespace-nowrap",
				cfg.color,
			)}
		>
			<Icon size={10} className="shrink-0" />
			{cfg.label}
		</span>
	);
}

// ─────────────────────────────────────────────────────────────────
//  MessageHoverPreview — popup fixe (hors overflow), 800 ms delay
// ─────────────────────────────────────────────────────────────────

function MessageHoverPreview({ message, rect }: { message: UIMessage; rect: DOMRect }) {
	const { isDark } = useAdminTokens();
	const POPUP_W = 288;
	const topPx  = Math.max(8, Math.min(rect.top, window.innerHeight - 220));
	const leftPx = rect.right + 10 + POPUP_W > window.innerWidth
		? rect.left - POPUP_W - 10
		: rect.right + 10;

	return (
		<div
			className={clsx(
				"fixed z-50 rounded-xl border shadow-2xl p-4 space-y-2.5 pointer-events-none",
				isDark
					? "bg-dark-900 border-dark-700"
					: "bg-white border-slate-200",
			)}
			style={{ top: topPx, left: leftPx, width: POPUP_W }}
		>
			{/* Expéditeur */}
			<div className="flex items-center gap-2">
				<div className={clsx(
					"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
					avatarColor(message.id),
				)}>
					{initials(message.firstname, message.lastname)}
				</div>
				<div className="min-w-0">
					<p className={clsx(
						"text-sm font-semibold truncate",
						isDark ? "text-slate-100" : "text-slate-900",
					)}>
						{message.firstname} {message.lastname}
					</p>
					<p className={clsx(
						"text-xs truncate",
						isDark ? "text-slate-400" : "text-slate-500",
					)}>
						{message.email}
					</p>
				</div>
			</div>

			{/* Badges */}
			<div className="flex items-center gap-2 flex-wrap">
				<StatusBadge status={message.status} />
				{!message.is_read && (
					<span className="text-xs text-blue-500 font-medium">● Non lu</span>
				)}
				<span className={clsx(
					"text-xs ml-auto",
					isDark ? "text-slate-400" : "text-slate-500",
				)}>
					{message.formattedDate}
				</span>
			</div>

			{/* Sujet */}
			{message.subject && (
				<p className={clsx(
					"text-xs font-medium truncate border-t pt-2",
					isDark ? "text-slate-300 border-dark-800" : "text-slate-700 border-slate-100",
				)}>
					{message.subject}
				</p>
			)}

			{/* Véhicule */}
			{message.vehicleName && (
				<div className="flex items-center gap-1.5">
					<Car size={11} className={clsx("flex-shrink-0", isDark ? "text-brand-400" : "text-brand-600")} />
					<span className={clsx("text-xs truncate", isDark ? "text-brand-400" : "text-brand-600")}>
						{message.vehicleName}
					</span>
				</div>
			)}

			{/* Aperçu du message */}
			<p className={clsx(
				"text-xs line-clamp-3 leading-relaxed",
				isDark ? "text-slate-400" : "text-slate-600",
			)}>
				{message.message}
			</p>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────────
//  MessageListItem
// ─────────────────────────────────────────────────────────────────

// React.memo : seuls les items dont les props changent re-rendent.
// Quand on sélectionne un message, seuls les 2 items concernés (l'ancien et le
// nouveau selectedId) voient isSelected changer → N-2 re-renders économisés.
const MessageListItem = memo(function MessageListItem({
	message,
	isSelected,
	onSelect,
	onPrefetch,
	onHoverStart,
	onHoverEnd,
}: {
	message: UIMessage;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onPrefetch?: (id: string) => void;
	onHoverStart?: (msg: UIMessage, rect: DOMRect) => void;
	onHoverEnd?: () => void;
}) {
	const { isDark } = useAdminTokens();
	const handleClick = useCallback(() => onSelect(message.id), [onSelect, message.id]);
	const buttonRef  = useRef<HTMLButtonElement>(null);
	const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleMouseEnter = useCallback(() => {
		onPrefetch?.(message.id);
		if (onHoverStart) {
			hoverTimer.current = setTimeout(() => {
				if (buttonRef.current) {
					onHoverStart(message, buttonRef.current.getBoundingClientRect());
				}
			}, 800);
		}
	}, [message, onPrefetch, onHoverStart]);

	const handleMouseLeave = useCallback(() => {
		if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
		onHoverEnd?.();
	}, [onHoverEnd]);

	useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

	return (
		<button
			ref={buttonRef}
			type="button"
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={clsx(
				"w-full text-left px-4 py-3.5 border-b transition-colors",
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
								"text-sm truncate",
								!message.is_read
									? `font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`
									: `font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`,
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
							"text-xs truncate flex-1 min-w-0",
							isDark ? "text-slate-400" : "text-slate-500",
						)}>
							{message.subject ?? "Sans sujet"}
						</span>
						<StatusBadge status={message.status} />
					</div>

					{/* Véhicule concerné — visible directement dans la liste */}
					{message.vehicleName && (
						<div className={clsx(
							"inline-flex items-center gap-1 mb-1 rounded px-1.5 py-0.5 max-w-full",
							isDark ? "bg-transparent" : "bg-brand-50 border border-brand-200",
						)}>
							<Car size={10} className={clsx(isDark ? "text-brand-400" : "text-brand-500", "flex-shrink-0")} />
							<span className={clsx("text-xs truncate", isDark ? "text-brand-400" : "text-brand-600")}>
								{message.vehicleName}
							</span>
						</div>
					)}

					<p className={clsx(
						"text-xs line-clamp-2 leading-relaxed",
						isDark ? "text-slate-500" : "text-slate-500",
					)}>
						{message.message}
					</p>
				</div>
			</div>
		</button>
	);
});

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
	const { isDark } = useAdminTokens();
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
		// staleTime calé sur ADMIN : évite un re-fetch systématique à chaque focus/remount
		// tout en restant cohérent avec la fréquence de polling de la liste.
		staleTime: STALE_TIMES.ADMIN,
	});

	const displayed = fullMessage ?? message;

	// Invalidation ciblée : seuls list + detail sont concernés après une action.
	// unread et stats sont maintenus à jour par le polling de useMessageStats (60s)
	// et par le canal Realtime du composant parent.
	const invalidate = useCallback(() => {
		// lists() invalide toutes les pages de toutes les combinaisons de filtres pour ce garage.
		qc.invalidateQueries({ queryKey: messageKeys.lists(garageId) });
		qc.invalidateQueries({ queryKey: messageKeys.detail(message.id) });
	}, [qc, garageId, message.id]);

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

	// Auto-mark as read on open — déclenché uniquement quand l'id du message change.
	// invalidate est stable (useCallback + deps stables) donc son inclusion est sûre.
	useEffect(() => {
		if (!message.is_read) {
			updateMessageStatusAction(message.id, garageId, "in_progress")
				.then(() => invalidate())
				.catch(() => {});
		}
	}, [message.id, message.is_read, garageId, invalidate]);

	const replies: import("@/types/ui").UIContactReply[] = displayed.replies ?? [];

	return (
		<div className={clsx("flex flex-col h-full", isDark ? "bg-dark-950" : "bg-slate-50")}>
			{/* Header */}
			<div className={clsx("flex items-center gap-3 px-4 py-3 border-b shrink-0", isDark ? "bg-dark-900 border-dark-800" : "bg-white border-slate-200")}>
				<button
					onClick={onClose}
					className={clsx("lg:hidden p-2 rounded-lg text-slate-400", isDark ? "hover:bg-dark-800" : "hover:bg-slate-100")}
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
					<h2 className={clsx("font-semibold truncate text-sm", isDark ? "text-dark-300" : "text-slate-800")}>
						{message.firstname} {message.lastname}
					</h2>
					<div className={clsx("flex items-center flex-wrap gap-x-3 gap-y-1 text-xs mt-0.5", isDark ? "text-dark-400" : "text-slate-600")}>
						<StatusBadge status={displayed.status} />
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
							className={clsx("p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors", isDark ? "hover:bg-dark-800" : "hover:bg-slate-100")}
							title="Archiver"
						>
							<Archive size={16} />
						</button>
					) : (
						<button
							onClick={() => statusMut.mutate("new")}
							disabled={statusMut.isPending}
							className={clsx("p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors", isDark ? "hover:bg-dark-800" : "hover:bg-slate-100")}
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
				<div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
					<span className="flex items-center gap-1">
						<Clock size={12} />
						{message.formattedDate}
					</span>
					{message.subject && (
						<span className="text-slate-400">
							{message.subject}
						</span>
					)}
				</div>

				{/* Message original */}
				<div className={clsx("rounded-xl border overflow-hidden", isDark ? "bg-dark-900 border-dark-800" : "bg-white border-slate-200")}>
					{message.vehicleId && (
						<div className={clsx("flex items-center gap-2 px-4 py-2.5 border-b", isDark ? "border-dark-800 bg-dark-900/60" : "border-brand-100 bg-brand-50")}>
							<Car size={12} className={clsx("flex-shrink-0", isDark ? "text-brand-400" : "text-brand-600")} />
							{message.vehicleHref ? (
								<Link
									href={message.vehicleHref}
									target="_blank"
									rel="noreferrer"
									className={clsx("flex items-center gap-1 text-xs font-medium transition-colors", isDark ? "text-brand-400 hover:text-brand-300" : "text-brand-600 hover:text-brand-700")}
								>
									{message.vehicleName ?? "Véhicule lié"}
									<ExternalLink size={10} />
								</Link>
							) : (
								<span className={clsx("text-xs font-medium", isDark ? "text-brand-400" : "text-brand-600")}>
									{message.vehicleName ?? "Véhicule lié"}
								</span>
							)}
						</div>
					)}
					<p className={clsx("text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden px-4 py-4", isDark ? "text-dark-400" : "text-slate-700")}>
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
									? STATUS_LABELS[s]?.color
									: isDark
										? "border-dark-700 text-slate-400 hover:border-dark-600 hover:text-slate-300"
										: "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700",
							)}
						>
							{STATUS_LABELS[s]?.label}
						</button>
					))}
				</div>

				{/* Fil des réponses — skeleton pendant le chargement */}
				{loadingDetail && (
					<div className="space-y-3">
						<div className="h-2.5 bg-dark-800 rounded animate-pulse w-20" />
						{[0, 1].map((i) => (
							<div key={i} className={clsx("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
								<div className="max-w-[75%] h-16 bg-dark-800 rounded-xl animate-pulse w-56" />
							</div>
						))}
					</div>
				)}

				{replies.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
											: isDark
												? "bg-dark-800 text-slate-300 border border-dark-700 rounded-bl-sm"
												: "bg-slate-100 text-slate-700 border border-slate-200 rounded-bl-sm",
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
												: "text-slate-400",
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
				<div className={clsx("border rounded-xl overflow-hidden", isDark ? "border-dark-700" : "border-slate-200")}>
					<button
						onClick={() => setShowNotes((v) => !v)}
						className={clsx("w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors", isDark ? "bg-dark-900 text-slate-400 hover:text-slate-300 hover:bg-dark-800" : "bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100")}
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
						<div className={clsx("p-3", isDark ? "bg-dark-950" : "bg-white")}>
							<textarea
								rows={4}
								value={notes}
								onChange={(e) => {
									setNotes(e.target.value);
									setNotesDirty(true);
								}}
								onBlur={saveNotes}
								placeholder="Notes privées (non visibles par le client)…"
								className={clsx("w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors", isDark ? "bg-dark-900 border-dark-700 text-slate-300 placeholder-slate-600" : "bg-white border-slate-200 text-slate-700 placeholder-slate-400")}
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
				<div className={clsx("shrink-0 border-t p-4", isDark ? "border-dark-800 bg-dark-900" : "border-slate-200 bg-white")}>
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
						className={clsx("w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-brand-500 transition-colors", isDark ? "bg-dark-800 border-dark-700 text-slate-200 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400")}
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

/** Nombre de messages par page — clé du LIMIT serveur. */
const CRM_PAGE_SIZE = 50;

export function CRMInbox({ garageId }: CRMInboxProps) {
	const searchParams  = useSearchParams();
	const [filter, setFilter] = useState<
		"all" | "new" | "in_progress" | "answered" | "archived"
	>("all");
	const [search,      setSearch]      = useState("");
	// Initialise la sélection depuis ?id= (lien direct depuis email de notification)
	const [selectedId, setSelectedId]   = useState<string | null>(
		searchParams.get("id"),
	);
	const qc = useQueryClient();

	// ── P1 — Sync feedback ───────────────────────────────────────────
	const [syncState,  setSyncState]  = useState<"idle" | "syncing" | "synced">("idle");
	const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
	const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Force re-render toutes les 10 s pour garder "il y a X s" à jour.
	const [, forceTimeUpdate] = useState(0);
	useEffect(() => {
		const t = setInterval(() => forceTimeUpdate((n) => n + 1), 10_000);
		return () => clearInterval(t);
	}, []);
	useEffect(() => () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); }, []);

	// ── P5 — Largeur configurable ────────────────────────────────────
	const [widthMode, setWidthMode] = useState<"normal" | "large" | "full">(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("crm-width-mode");
			if (saved === "normal" || saved === "large" || saved === "full") return saved;
		}
		return "normal";
	});

	// ── P4 — Hover preview state ─────────────────────────────────────
	const [hoveredPreview, setHoveredPreview] = useState<{
		message: UIMessage;
		rect: DOMRect;
	} | null>(null);

	// ── Debounce recherche (300 ms) ──────────────────────────────────
	// Évite d'envoyer une requête serveur à chaque keystroke.
	const [debouncedSearch, setDebouncedSearch] = useState("");
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	// ── Filtres server-side (mémoïsés pour stabilité du queryKey) ───
	const queryFilters = useMemo(() => ({
		status: filter !== "all" ? filter : undefined,
		search: debouncedSearch || undefined,
	}), [filter, debouncedSearch]);

	// ── Infinite Query paginée ───────────────────────────────────────
	// Chaque page = 50 messages. Le curseur est le created_at du dernier item.
	// keepPreviousData : les anciennes données restent affichées pendant
	// le chargement d'une nouvelle combinaison de filtres.
	const {
		data,
		isLoading,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
	} = useInfiniteQuery({
		queryKey:     messageKeys.list(garageId, queryFilters),
		queryFn:      ({ pageParam }) => fetchMessagesAction(garageId, {
			limit:       CRM_PAGE_SIZE,
			cursor:      pageParam as string | undefined,
			status: queryFilters.status as "new" | "in_progress" | "answered" | "archived" | undefined,
			search: queryFilters.search,
		}),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
		staleTime:        60_000,
		placeholderData:  keepPreviousData,
	});

	// ── Données aplaties des pages chargées ─────────────────────────
	const allMessages = useMemo(
		() => data?.pages.flatMap((p) => p.messages) ?? [],
		[data],
	);

	// ── Realtime Supabase ────────────────────────────────────────────
	// lists() invalide TOUTES les combinaisons de filtres (prefix match React Query).
	useEffect(() => {
		const supabase = createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		);

		const channel = supabase
			.channel(`crm-messages-${garageId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "messages",
					filter: `garage_id=eq.${garageId}`,
				},
				() => {
					qc.invalidateQueries({ queryKey: messageKeys.lists(garageId) });
					qc.invalidateQueries({ queryKey: messageKeys.unread(garageId) });
				},
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
			supabase.removeChannel(channel);
		};
	}, [garageId, qc]);

	// ── P6 — Auto-refresh intelligent ───────────────────────────────
	// Actif uniquement si l'onglet est visible. Suspendu sinon.
	useEffect(() => {
		const INTERVAL = 60_000;
		let id: ReturnType<typeof setInterval> | null = null;
		const start = () => {
			id = setInterval(() => {
				if (document.visibilityState === "visible") {
					void refetch();
					setLastSyncAt(new Date());
				}
			}, INTERVAL);
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") { start(); }
			else { if (id) { clearInterval(id); id = null; } }
		};
		start();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			if (id) clearInterval(id);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [refetch]);

	// ── Callbacks stables ────────────────────────────────────────────
	const handleSelect = useCallback((id: string) => setSelectedId(id), []);

	// ── P1 — Refresh avec feedback ───────────────────────────────────
	const handleRefresh = useCallback(async () => {
		if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
		setSyncState("syncing");
		try {
			await refetch();
			setLastSyncAt(new Date());
			setSyncState("synced");
			syncTimerRef.current = setTimeout(() => setSyncState("idle"), 2000);
		} catch {
			setSyncState("idle");
		}
	}, [refetch]);

	// ── P7 — Prefetch au survol ──────────────────────────────────────
	const handlePrefetch = useCallback((messageId: string) => {
		void qc.prefetchQuery({
			queryKey: messageKeys.detail(messageId),
			queryFn:  () => fetchMessageWithRepliesAction(messageId, garageId),
			staleTime: STALE_TIMES.ADMIN,
		});
	}, [qc, garageId]);

	// ── P4 — Hover preview callbacks ─────────────────────────────────
	const handleHoverStart = useCallback((msg: UIMessage, rect: DOMRect) => {
		setHoveredPreview({ message: msg, rect });
	}, []);
	const handleHoverEnd = useCallback(() => setHoveredPreview(null), []);

	// ── P5 — Width mode ──────────────────────────────────────────────
	const handleWidthChange = useCallback((mode: "normal" | "large" | "full") => {
		setWidthMode(mode);
		localStorage.setItem("crm-width-mode", mode);
	}, []);
	const listPanelWidthClass = widthMode === "full"
		? "lg:w-[520px] xl:w-[580px]"
		: widthMode === "large"
		? "lg:w-96 xl:w-[440px]"
		: "lg:w-80 xl:w-96";

	const selectedMessage = useMemo(
		() => allMessages.find((m) => m.id === selectedId) ?? null,
		[allMessages, selectedId],
	);

	const unreadCount = useMemo(
		() => allMessages.filter((m) => !m.is_read && m.status !== "archived").length,
		[allMessages],
	);

	// ── Virtualisation ───────────────────────────────────────────────
	// Seuls ~20-30 items sont dans le DOM même avec 1 500 messages chargés.
	const listRef = useRef<HTMLDivElement>(null);
	const virtualCount = hasNextPage ? allMessages.length + 1 : allMessages.length;
	const virtualizer = useVirtualizer({
		count:            virtualCount,
		getScrollElement: () => listRef.current,
		estimateSize:     () => 92,
		overscan:         8,
	});

	// ── Auto-fetch page suivante ─────────────────────────────────────
	// Déclenche fetchNextPage quand l'utilisateur approche la fin de la liste.
	const virtualItems = virtualizer.getVirtualItems();
	useEffect(() => {
		const lastItem = virtualItems.at(-1);
		if (!lastItem) return;
		if (
			lastItem.index >= allMessages.length - 3 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			void fetchNextPage();
		}
	}, [virtualItems, allMessages.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

	// dvh = dynamic viewport height — adapts when mobile browser chrome shows/hides
	return (
	<div className="flex h-[calc(100dvh-80px)] bg-dark-950 rounded-xl overflow-hidden border border-dark-800">
			{/* ── Panneau gauche : liste ─────────────────────────────── */}
			<div
				className={clsx(
					"flex flex-col bg-dark-900 border-r border-dark-800 transition-all",
					selectedId
						? `hidden lg:flex ${listPanelWidthClass}`
						: `flex w-full ${listPanelWidthClass}`,
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
						<div className="flex items-center gap-2">
							{/* Indication dernière sync */}
							{lastSyncAt && syncState === "idle" && (
								<span className="text-xs text-slate-600 hidden sm:block" title={lastSyncAt.toLocaleTimeString("fr-FR")}>
									{formatRelativeTime(lastSyncAt)}
								</span>
							)}
							{syncState === "syncing" && (
								<span className="text-xs text-slate-400 hidden sm:block">Synchronisation…</span>
							)}
							{syncState === "synced" && (
								<span className="text-xs text-emerald-500 hidden sm:block">✓ Mis à jour</span>
							)}

							{/* Bouton refresh */}
							<button
								onClick={() => { void handleRefresh(); }}
								disabled={syncState === "syncing"}
								className="p-1.5 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
								title="Actualiser"
								aria-label="Actualiser"
							>
								<RefreshCw size={15} className={syncState === "syncing" || isFetching ? "animate-spin" : ""} />
							</button>

							{/* Sélecteur de largeur — P5 */}
							<div className="hidden lg:flex items-center gap-0.5 bg-dark-800 rounded-lg p-0.5">
								{(["normal", "large", "full"] as const).map((mode) => (
									<button
										key={mode}
										onClick={() => handleWidthChange(mode)}
										className={clsx(
											"px-2 py-0.5 rounded text-xs font-medium transition-colors",
											widthMode === mode
												? "bg-brand-600 text-white"
												: "text-slate-500 hover:text-slate-200 hover:bg-dark-700",
										)}
										title={{ normal: "Normale", large: "Large", full: "Maximale" }[mode]}
										aria-label={`Largeur ${mode}`}
									>
										{{ normal: "▥", large: "▤", full: "▣" }[mode]}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Recherche */}
					<div className="relative">
						<Search
							size={15}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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

				</div>

				{/* Liste virtualisée — seuls ~20-30 DOM nodes présents à tout moment */}
				<div ref={listRef} className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="space-y-0">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="px-4 py-3 border-b border-dark-800 animate-pulse">
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
					) : isError ? (
						<div className="flex flex-col items-center gap-3 py-12 text-center px-4">
							<p className="text-slate-300 text-sm">Erreur de chargement</p>
							<button onClick={() => refetch()} className="text-brand-400 text-sm hover:text-brand-300">
								Réessayer
							</button>
						</div>
					) : allMessages.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-16 text-center px-4">
							<MailOpen size={32} className="text-slate-600" />
							<p className="text-slate-500 text-sm">
								{search ? "Aucun résultat pour cette recherche." : "Aucun message dans cette catégorie."}
							</p>
						</div>
					) : (
						<div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
							{virtualizer.getVirtualItems().map((vItem) => {
								const isLoader = vItem.index > allMessages.length - 1;
								const msg = allMessages[vItem.index];
								return (
									<div
										key={vItem.key}
										data-index={vItem.index}
										ref={virtualizer.measureElement}
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											transform: `translateY(${vItem.start}px)`,
										}}
									>
										{isLoader ? (
											<div className="flex justify-center py-4">
												{isFetchingNextPage && (
													<RefreshCw size={15} className="animate-spin text-slate-500" />
												)}
											</div>
										) : (
											<MessageListItem
												message={msg}
												isSelected={selectedId === msg.id}
												onSelect={handleSelect}
												onPrefetch={handlePrefetch}
												onHoverStart={handleHoverStart}
												onHoverEnd={handleHoverEnd}
											/>
										)}
									</div>
								);
							})}
						</div>
					)}
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
						<p className="text-slate-400 text-sm">
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

			{/* ── P4 — Hover preview (portal fixe, hors overflow) ──── */}
			{hoveredPreview && (
				<MessageHoverPreview
					message={hoveredPreview.message}
					rect={hoveredPreview.rect}
				/>
			)}
		</div>
	);
}
