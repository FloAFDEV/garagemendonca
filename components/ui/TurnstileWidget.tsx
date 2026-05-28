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

  // Refs stables pour les callbacks — évite que renderWidget change à chaque
  // render du parent, ce qui déclencherait un re-attachement du script inutile.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerifyRef.current(token),
      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpireRef.current();
      },
      theme: "dark",
      size: "normal",
    });
  }, [siteKey]); // stable — ne dépend plus des callbacks (passés via refs)

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
      // Cleanup explicite : retire l'écouteur si le composant est démonté
      // avant que le script finisse de charger.
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
    // Le script est une ressource globale — pas retiré au démontage.
    // widgetIdRef est remis à null pour permettre un re-render propre si besoin.
    return () => { widgetIdRef.current = null; };
  }, [siteKey, renderWidget]);

  if (!siteKey) return null;

  return (
    <div className="flex justify-center py-2">
      <div ref={containerRef} />
    </div>
  );
}
