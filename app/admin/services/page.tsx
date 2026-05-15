"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import Link from "next/link";
import { Pencil, Eye, ToggleLeft, ToggleRight, Wrench, Settings, Paintbrush, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { Service } from "@/types";
import { serviceRepository } from "@/lib/repositories";
import { updateServiceAction, deleteServiceAction, reorderServicesAction } from "./actions";
import { adminUI } from "@/lib/admin-ui";

const iconMap: Record<string, React.ReactNode> = {
  wrench: <Wrench size={18} />,
  settings: <Settings size={18} />,
  paintbrush: <Paintbrush size={18} />,
};

export default function AdminServicesPage() {
  const t = useAdminTokens();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    serviceRepository.getAllForAdmin().then(setServices).catch(console.error);
  }, []);

  const toggleActive = async (service: Service) => {
    const slug = service.slug;
    setLoading(slug);
    const newActive = !service.is_active;
    setServices(prev => prev.map(s => (s.slug ?? s.id) === slug ? { ...s, is_active: newActive } : s));
    await updateServiceAction(slug, { is_active: newActive });
    setLoading(null);
  };

  const moveService = async (index: number, direction: "up" | "down") => {
    const next = [...services];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    setServices(next);
    await reorderServicesAction(next.map((s) => s.slug));
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Supprimer le service "${service.title}" ? Cette action est irréversible.`)) return;
    const slug = service.slug;
    setDeleting(slug);
    const result = await deleteServiceAction(slug);
    if (result.ok) {
      setServices(prev => prev.filter(s => s.slug !== slug));
    }
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>Services</h2>
            <p className={clsx("text-sm mt-1", t.txtMuted)}>Gérez les services affichés sur la page publique.</p>
          </div>
          <Link
            href="/admin/services/nouveau"
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={15} />
            Nouveau
          </Link>
        </div>

        {/* Service cards */}
        <div className="space-y-4">
          {services.map((service, index) => {
            const slug = service.slug;
            const isLoading = loading === slug;
            return (
              <div key={service.id} className={clsx("rounded-2xl border p-5 flex items-start gap-5", t.surface, t.border)}>
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5 flex-shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => moveService(index, "up")}
                    disabled={index === 0}
                    aria-label="Monter"
                    className={clsx("p-1 rounded transition-colors", t.txtMuted, t.hoverTxt, index === 0 && "opacity-20 cursor-not-allowed")}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveService(index, "down")}
                    disabled={index === services.length - 1}
                    aria-label="Descendre"
                    className={clsx("p-1 rounded transition-colors", t.txtMuted, t.hoverTxt, index === services.length - 1 && "opacity-20 cursor-not-allowed")}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Icon */}
                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-brand-400", t.surface2)}>
                  {iconMap[service.icon] ?? <Wrench size={18} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className={clsx("font-medium text-base", t.txt)}>{service.title}</h3>
                      <p className={clsx("text-xs mt-1 line-clamp-2", t.txtMuted)}>{service.short_description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle active */}
                      <button
                        onClick={() => toggleActive(service)}
                        disabled={isLoading}
                        className={clsx(
                          "text-xs",
                          service.is_active ? adminUI.toggleOn : adminUI.toggleOff,
                          isLoading && "opacity-50 cursor-wait",
                        )}
                      >
                        {service.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {service.is_active ? "Actif" : "Inactif"}
                      </button>

                      {/* Preview */}
                      <Link
                        href={`/services#${slug}`}
                        target="_blank"
                        className={clsx("p-2 rounded-lg transition-colors", t.txtMuted, t.hoverBgStrong, t.hoverTxt, adminUI.focusGhost)}
                        title="Voir sur le site"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/admin/services/${slug}`}
                        className={clsx("p-2 rounded-lg transition-colors", t.txtMuted, t.hoverBgStrong, t.hoverTxt, adminUI.focusGhost)}
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(service)}
                        disabled={deleting === slug}
                        className={clsx(
                          "p-2 rounded-lg transition-colors text-red-400 hover:text-red-500 hover:bg-red-500/10",
                          deleting === slug && "opacity-40 cursor-wait",
                          adminUI.focusGhost,
                        )}
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Features count */}
                  <p className={clsx("text-xs mt-2", t.txtSubtle)}>
                    {service.features.length} prestation{service.features.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
