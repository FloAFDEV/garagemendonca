"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Images, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useAdminTokens } from "@/contexts/AdminThemeContext";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

// ─── Types ────────────────────────────────────────────────────────

export type UploadType = "vehicle" | "service" | "banner";

interface UploadingFile {
  id: string;
  name: string;
  previewUrl: string;
  progress: "uploading" | "done" | "error";
  error?: string;
}

interface ImageUploadZoneProps {
  entityId: string;
  type: UploadType;
  onUploaded: (url: string, storagePath: string) => void;
  maxFiles?: number;
  currentCount?: number;
  disabled?: boolean;
  className?: string;
}

// ─── Composant ────────────────────────────────────────────────────

export default function ImageUploadZone({
  entityId,
  type,
  onUploaded,
  maxFiles = 10,
  currentCount = 0,
  disabled = false,
  className = "",
}: ImageUploadZoneProps) {
  const t = useAdminTokens();
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const remaining = maxFiles - currentCount;

  // ── Upload d'un fichier individuel ────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const id = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);

    setUploading((prev) => [
      ...prev,
      { id, name: file.name, previewUrl, progress: "uploading" },
    ]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("entityId", entityId);
    formData.append("garageId", GARAGE_ID);

    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Upload échoué");

      // Succès : notifie le parent avec l'URL réelle
      onUploaded(json.url, json.storagePath);
      setUploading((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setUploading((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, progress: "error", error: (err as Error).message }
            : f,
        ),
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  }, [entityId, type, onUploaded]);

  // ── Gestion des fichiers (multi) ──────────────────────────────

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const available = remaining - uploading.filter((f) => f.progress === "uploading").length;
    const toUpload = Array.from(files).slice(0, Math.max(0, available));
    toUpload.forEach(uploadFile);
  }, [remaining, uploading, uploadFile]);

  // ── Drag & drop ───────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const dismissError = (id: string) =>
    setUploading((prev) => prev.filter((f) => f.id !== id));

  const canUpload = !disabled && remaining > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ── Zone drag & drop ── */}
      {canUpload && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "relative border-2 border-dashed rounded-2xl p-6 transition-all",
            isDragOver
              ? "border-brand-500 bg-brand-500/5 scale-[1.01]"
              : `${t.border} ${t.surface}`,
          ].join(" ")}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.surface2}`}>
              <Upload size={22} className={t.txtMuted} />
            </div>
            <div>
              <p className={`text-sm font-medium ${t.txt}`}>
                Glissez vos photos ici
              </p>
              <p className={`text-xs mt-1 ${t.txtSubtle}`}>
                WebP · JPEG · PNG · max 10 Mo · {remaining} photo{remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
              </p>
            </div>

            {/* Boutons d'upload */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Galerie / fichier */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              >
                <Images size={15} />
                Choisir des photos
              </button>

              {/* Appareil photo (mobile : ouvre caméra directement) */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${t.border} ${t.txt} ${t.hoverBg}`}
              >
                <Camera size={15} />
                <span>Prendre une photo</span>
              </button>
            </div>
          </div>

          {/* Inputs cachés */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            onClick={(e) => ((e.target as HTMLInputElement).value = "")}
          />
          {/* capture="environment" → ouvre la caméra arrière sur mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            onClick={(e) => ((e.target as HTMLInputElement).value = "")}
          />
        </div>
      )}

      {/* ── Limite atteinte ── */}
      {!canUpload && !disabled && (
        <p className={`text-xs text-center py-2 ${t.txtSubtle}`}>
          Limite de {maxFiles} photos atteinte.
        </p>
      )}

      {/* ── En cours d'upload ── */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((file) => (
            <div
              key={file.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${t.border} ${t.surface2}`}
            >
              {/* Miniature */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.previewUrl}
                alt=""
                aria-hidden="true"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${t.txt}`}>{file.name}</p>
                {file.progress === "uploading" && (
                  <p className={`text-xs ${t.txtSubtle} flex items-center gap-1 mt-0.5`}>
                    <Loader2 size={10} className="animate-spin" />
                    Compression et upload…
                  </p>
                )}
                {file.progress === "error" && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle size={10} />
                    {file.error ?? "Erreur upload"}
                  </p>
                )}
              </div>
              {file.progress === "uploading" && (
                <Loader2 size={16} className="animate-spin text-brand-400 flex-shrink-0" />
              )}
              {file.progress === "error" && (
                <button
                  type="button"
                  onClick={() => dismissError(file.id)}
                  className="text-slate-400 hover:text-red-400 flex-shrink-0 transition-colors"
                  aria-label="Ignorer l'erreur"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
