"use client";

import { useEffect, useRef, useState } from "react";

interface StatDef {
  prefix: string;
  target: number;
  suffix: string;
  thousands: boolean;
  label: string;
}

const STATS: StatDef[] = [
  { prefix: "",  target: 25,   suffix: "+", thousands: false, label: "Ans d'expérience" },
  { prefix: "+", target: 1200, suffix: "",  thousands: true,  label: "Réparations réalisées" },
  { prefix: "",  target: 98,   suffix: "%", thousands: false, label: "Clients satisfaits" },
  { prefix: "",  target: 9,    suffix: "",  thousands: false, label: "Véhicules de prêt" },
];

function CountUp({ prefix, target, suffix, thousands }: Omit<StatDef, "label">) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const duration = 1600;
          const startTime = performance.now();

          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            /* easeOutCubic — démarre vite, ralentit à l'arrivée */
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const formatted = thousands
    ? count.toLocaleString("fr-FR")
    : count.toString();

  return (
    <div
      ref={containerRef}
      className="font-heading font-black text-3xl md:text-4xl text-white leading-none mb-1"
      aria-live="polite"
    >
      {prefix}{formatted}{suffix}
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/15 animate-fade-in">
      {STATS.map(({ prefix, target, suffix, thousands, label }) => (
        <div key={label} className="text-center sm:text-left">
          <CountUp prefix={prefix} target={target} suffix={suffix} thousands={thousands} />
          <div className="text-slate-300 text-xs leading-snug">{label}</div>
        </div>
      ))}
    </div>
  );
}
