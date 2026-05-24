"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Images, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import { ACTIVE_GARAGE_ID as GARAGE_ID } from "@/lib/config/garage";

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

// ─── HEIC conversion (client-side, lazy-loaded) ───────────────────
// heic2any is a large library — only imported when a HEIC file is detected.

function isHeic(file: File): boolean {
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif";
}

async function convertHeicToJpeg(file: File): Promise<File> {
  // Dynamic import to avoid loading heic2any for non-HEIC files
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const converted = Array.isArray(blob) ? blob[0] : blob;
  const name = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([converted], name, { type: "image/jpeg" });
}

// ─── Legacy canvas resize (service / banner only) ─────────────────
// For vehicle uploads we skip this and go straight to Sharp on the server.

const MAX_DIM = 1200;
const QUALITY = 0.85;

async function resizeImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w <= MAX_DIM && h <= MAX_DIM) { resolve(file); return; }

      const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const name = file.name.replace(/\.[^.]+$/, ".webp");
          resolve(new File([blob], name, { type: "image/webp" }));
        },
        "image/webp",
        QUALITY,
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// ─── Upload strategies ────────────────────────────────────────────

/**
 * New vehicle upload flow:
 * 1. HEIC → JPEG conversion if needed
 * 2. GET signed upload URL + basePath from /api/images/upload-url
 * 3. PUT directly to Supabase (bypasses Vercel body limit)
 * 4. POST /api/images/process → Sharp generates 3 variants server-side
 * 5. Return { url: mediumUrl, storagePath: basePath }
 */
async function uploadVehicle(
  file: File,
  entityId: string,
): Promise<{ url: string; storagePath: string }> {
  // 1. Normalize HEIC → JPEG
  const normalized = isHeic(file) ? await convertHeicToJpeg(file) : file;

  // 2. Request signed upload URL
  const urlRes = await fetch("/api/images/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ garageId: GARAGE_ID, vehicleId: entityId }),
  });
  if (!urlRes.ok) {
    const j = await urlRes.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? "URL signée échouée");
  }
  const { signedUrl, basePath } = await urlRes.json() as {
    signedUrl: string;
    basePath: string;
    originalPath: string;
  };

  // 3. PUT directly to Supabase Storage (no Vercel limit)
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": normalized.type || "image/jpeg" },
    body: normalized,
  });
  if (!putRes.ok) {
    throw new Error(`Upload Supabase échoué (${putRes.status})`);
  }

  // 4. Server-side Sharp processing → 3 variants
  const processRes = await fetch("/api/images/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ basePath }),
  });
  if (!processRes.ok) {
    const j = await processRes.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? "Traitement image échoué");
  }
  const result = await processRes.json() as { url: string; storagePath: string };
  return { url: result.url, storagePath: result.storagePath };
}

/**
 * Legacy upload flow for service / banner images.
 * Resizes client-side then POSTs to /api/upload-image (Sharp on server).
 */
async function uploadLegacy(
  file: File,
  type: UploadType,
  entityId: string,
): Promise<{ url: string; storagePath: string }> {
  const resized = await resizeImage(file);

  const formData = new FormData();
  formData.append("file", resized);
  formData.append("type", type);
  formData.append("entityId", entityId);
  formData.append("garageId", GARAGE_ID);

  const res = await fetch("/api/upload-image", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? "Upload échoué");
  return { url: (json as { url: string }).url, storagePath: (json as { storagePath: string }).storagePath };
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
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const remaining = maxFiles - currentCount;

  // ── Upload d'un fichier individuel ────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && !isHeic(file)) return;

    const id = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);

    setUploading((prev) => [
      ...prev,
      { id, name: file.name, previewUrl, progress: "uploading" },
    ]);

    try {
      const result = type === "vehicle"
        ? await uploadVehicle(file, entityId)
        : await uploadLegacy(file, type, entityId);

      onUploaded(result.url, result.storagePath);
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

  // Accept HEIC for vehicle uploads
  const acceptAttr = type === "vehicle" ? "image/*,.heic,.heif" : "image/*";

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
                {type === "vehicle"
                  ? `JPEG · PNG · HEIC · WebP · 3 variantes auto · ${remaining} photo${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`
                  : `WebP · JPEG · PNG · auto-compressé 1200px · ${remaining} photo${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`
                }
              </p>
              <p className={`text-xs mt-0.5 ${t.txtSubtle}`}>
                Format paysage recommandé — 16:9 ou 4:3 pour un meilleur rendu.
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
            accept={acceptAttr}
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            onClick={(e) => ((e.target as HTMLInputElement).value = "")}
          />
          {/* capture="environment" → ouvre la caméra arrière sur mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept={acceptAttr}
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
                    {type === "vehicle" ? "Upload & traitement variantes…" : "Compression et upload…"}
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
