"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminTokens } from "@/contexts/AdminThemeContext";
import Link from "next/link";
import { Pencil, Eye, ToggleLeft, ToggleRight, Wrench, Settings, Paintbrush } from "lucide-react";
import clsx from "clsx";
import type { Service } from "@/types";
import { services as seedServices } from "@/lib/data";
import { updateServiceAction } from "./actions";

const iconMap: Record<string, React.ReactNode> = {
  wrench: <Wrench size={18} />,
  settings: <Settings size={18} />,
  paintbrush: <Paintbrush size={18} />,
};

export default function AdminServicesPage() {
  const t = useAdminTokens();
  const [services, setServices] = useState<Service[]>(seedServices);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleActive = async (service: Service) => {
    const slug = service.slug;
    setLoading(slug);
    const newActive = !service.is_active;
    // Optimistic update
    setServices(prev => prev.map(s => (s.slug ?? s.id) === slug ? { ...s, is_active: newActive } : s));
    await updateServiceAction(slug, { is_active: newActive });
    setLoading(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className={clsx("font-heading font-medium text-2xl", t.txt)}>Services</h2>
          <p className={clsx("text-sm mt-1", t.txtMuted)}>Gérez les 3 services affichés sur la page publique.</p>
        </div>

        {/* Service cards */}
        <div className="space-y-4">
          {services.map((service) => {
            const slug = service.slug;
            const isLoading = loading === slug;
            return (
              <div key={service.id} className={clsx("rounded-2xl border p-5 flex items-start gap-5", t.surface, t.border)}>
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
                          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
                          service.is_active
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20",
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
                        className={clsx("p-2 rounded-lg transition-colors", t.txtMuted, t.hoverBgStrong, t.hoverTxt)}
                        title="Voir sur le site"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/admin/services/${slug}`}
                        className={clsx("p-2 rounded-lg transition-colors hover:text-blue-400", t.txtMuted, t.hoverBgStrong)}
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </Link>
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
