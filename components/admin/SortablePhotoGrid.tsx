"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import type { VehicleImage, PhotoType } from "@/types";

// ─── Élément draggable ───────────────────────────────────────────

interface SortablePhotoItemProps {
  id: string;
  src: string;
  index: number;
  onRemove: () => void;
  onSetMain: () => void;
  photoType?: PhotoType;
  onTypeChange?: (type: PhotoType) => void;
}

function SortablePhotoItem({ id, src, index, onRemove, onSetMain, photoType, onTypeChange }: SortablePhotoItemProps) {
  const t = useAdminTokens();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  // vehicle-images bucket is public — use src directly.
  // blob:// = local preview from upload (also fine directly).
  const displayUrl = src;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-video ${t.surface2} rounded-xl overflow-hidden group ${
        index === 0 ? "ring-2 ring-brand-500" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayUrl}
        alt={`Photo ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        loading={index === 0 ? "eager" : "lazy"}
      />

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-7 h-7 bg-dark-900/70 hover:bg-dark-900 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity z-10"
        aria-label="Déplacer la photo"
      >
        <GripVertical size={14} className="text-white" />
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity z-10"
        aria-label="Supprimer la photo"
      >
        <X size={12} className="text-white" />
      </button>

      {/* Badge principale / bouton set-main */}
      {index === 0 ? (
        <div className="absolute bottom-2 left-2 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          ★ Principale
        </div>
      ) : (
        <button
          type="button"
          onClick={onSetMain}
          className="absolute bottom-2 left-2 bg-dark-900/80 hover:bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all"
        >
          Définir principale
        </button>
      )}

      {/* Type toggle — visible au hover (sm+) ou toujours sur mobile */}
      {onTypeChange && (
        <button
          type="button"
          onClick={() => {
            const cycle: PhotoType[] = [null, "exterior", "interior", "detail"];
            const currentIdx = cycle.indexOf(photoType ?? null);
            const next = cycle[(currentIdx + 1) % cycle.length];
            onTypeChange(next);
          }}
          className={`absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all ${
            photoType === "interior"
              ? "bg-indigo-600 text-white"
              : photoType === "exterior"
              ? "bg-emerald-600 text-white"
              : photoType === "detail"
              ? "bg-amber-500 text-white"
              : "bg-dark-900/70 text-slate-400"
          }`}
          title={`Type : ${photoType ?? "auto"} — cliquer pour changer`}
          aria-label={`Type de photo : ${photoType ?? "non défini"}`}
        >
          {photoType === "interior"
            ? "INT"
            : photoType === "exterior"
            ? "EXT"
            : photoType === "detail"
            ? "DÉT"
            : "···"}
        </button>
      )}
    </div>
  );
}

// ─── Grille principale ────────────────────────────────────────────

interface SortablePhotoGridProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Données complètes vehicle_images (id + photo_type) pour le tag de type */
  vehicleImagesData?: VehicleImage[];
  /** Callback déclenché quand l'admin change le type d'une photo */
  onPhotoTypeChange?: (imageId: string, type: PhotoType) => void;
}

export default function SortablePhotoGrid({ images, onChange, vehicleImagesData, onPhotoTypeChange }: SortablePhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // Map URL → VehicleImage for type lookup
  const imageDataByUrl = vehicleImagesData
    ? Object.fromEntries(vehicleImagesData.map((img) => [img.url, img]))
    : {};

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  }

  if (images.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => {
            const imgData = imageDataByUrl[img];
            return (
              <SortablePhotoItem
                key={img}
                id={img}
                src={img}
                index={idx}
                photoType={imgData?.photo_type ?? null}
                onRemove={() => onChange(images.filter((_, i) => i !== idx))}
                onSetMain={() => {
                  const next = [...images];
                  next.splice(idx, 1);
                  next.unshift(img);
                  onChange(next);
                }}
                onTypeChange={
                  imgData && onPhotoTypeChange
                    ? (type) => onPhotoTypeChange(imgData.id, type)
                    : undefined
                }
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
