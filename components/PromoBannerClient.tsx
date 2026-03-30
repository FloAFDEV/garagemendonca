"use client";

import { useState, useEffect } from "react";
import type { Banner } from "@/types";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "promo_banner_dismissed";

export default function PromoBannerClient({ banner }: { banner: Banner }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (banner.is_dismissible) {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (dismissed === banner.id) return;
    }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [banner.id, banner.is_dismissible]);

  const dismiss = () => {
    setVisible(false);
    if (banner.is_dismissible) sessionStorage.setItem(DISMISS_KEY, banner.id);
  };

  if (!mounted) return null;

  return (
    <div
      role="banner"
      aria-live="polite"
      style={{
        background: banner.image_url
          ? `linear-gradient(${banner.bg_color}cc, ${banner.bg_color}cc), url(${banner.image_url}) center/cover no-repeat`
          : banner.bg_color,
        maxHeight: visible ? "160px" : "0px",
        opacity: visible ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
      }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-white text-sm font-medium leading-snug">
            {banner.message}
            {banner.sub_message && (
              <span className="text-white/75 text-xs ml-2 hidden sm:inline">
                {banner.sub_message}
              </span>
            )}
          </p>
          {banner.cta_label && banner.cta_url && (
            <Link
              href={banner.cta_url}
              className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-white underline underline-offset-2 hover:no-underline"
            >
              {banner.cta_label} →
            </Link>
          )}
        </div>
        {banner.is_dismissible && (
          <button
            onClick={dismiss}
            aria-label="Fermer la bannière"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
