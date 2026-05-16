"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

/**
 * Widget Cloudflare Turnstile.
 * Ne se rend que si NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY est défini.
 * Chargement paresseux du script CF — zéro impact si inactif.
 */
export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerify(token),
      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpire();
      },
      theme: "dark",
      size: "normal",
    });
  }, [siteKey, onVerify, onExpire]);

  useEffect(() => {
    if (!siteKey) return;

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    );
    if (existing) {
      existing.addEventListener("load", renderWidget);
      return () => existing.removeEventListener("load", renderWidget);
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);
  }, [siteKey, renderWidget]);

  if (!siteKey) return null;

  return (
    <div className="flex justify-center py-2">
      <div ref={containerRef} />
    </div>
  );
}
