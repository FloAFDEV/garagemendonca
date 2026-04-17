'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type ZoneId = 'engine' | 'brakes-front' | 'diagnostics' | 'brakes-rear';
type Status = 'ok' | 'warning';
type ZoneState = 'idle' | 'scanning' | 'active';

interface Zone {
  id: ZoneId;
  label: string;
  sublabel: string;
  status: Status;
  statusLabel: string;
  labelPos: { left: string; top: string };
  labelBelow: boolean;
  pulseDelay: string;
  scanXMin: number;
  scanXMax: number;
}

const ZONES: Zone[] = [
  {
    id: 'engine',
    label: 'Moteur',
    sublabel: 'Injection · Courroie · Fluides',
    status: 'ok',
    statusLabel: 'Nominal',
    labelPos: { left: '14%', top: '20%' },
    labelBelow: false,
    pulseDelay: '0s',
    scanXMin: 76,
    scanXMax: 224,
  },
  {
    id: 'brakes-front',
    label: 'Frein avant',
    sublabel: 'Disques · Plaquettes · Étriers',
    status: 'warning',
    statusLabel: 'Usure détectée',
    labelPos: { left: '22%', top: '93%' },
    labelBelow: true,
    pulseDelay: '0.7s',
    scanXMin: 118,
    scanXMax: 232,
  },
  {
    id: 'diagnostics',
    label: 'Diagnostic OBD',
    sublabel: 'Capteurs · Calculateur · Codes',
    status: 'ok',
    statusLabel: 'Aucun code erreur',
    labelPos: { left: '49%', top: '20%' },
    labelBelow: false,
    pulseDelay: '1.4s',
    scanXMin: 228,
    scanXMax: 402,
  },
  {
    id: 'brakes-rear',
    label: 'Frein arrière',
    sublabel: 'Tambours · Mâchoires · Câble',
    status: 'ok',
    statusLabel: 'Nominal',
    labelPos: { left: '73%', top: '93%' },
    labelBelow: true,
    pulseDelay: '2.1s',
    scanXMin: 398,
    scanXMax: 512,
  },
];

const SCAN_START = 75;
const SCAN_RANGE = 463; // 538 - 75
const SCAN_DURATION = 3500;

const S: Record<Status, {
  dot: string;
  text: string;
  fill: Record<ZoneState, string>;
  stroke: Record<ZoneState, string>;
}> = {
  ok: {
    dot: '#34d399',
    text: '#34d399',
    fill: {
      idle: 'rgba(52,211,153,0.04)',
      scanning: 'rgba(52,211,153,0.10)',
      active: 'rgba(52,211,153,0.16)',
    },
    stroke: {
      idle: 'rgba(52,211,153,0.22)',
      scanning: 'rgba(52,211,153,0.55)',
      active: 'rgba(52,211,153,0.75)',
    },
  },
  warning: {
    dot: '#fbbf24',
    text: '#fbbf24',
    fill: {
      idle: 'rgba(251,191,36,0.05)',
      scanning: 'rgba(251,191,36,0.13)',
      active: 'rgba(251,191,36,0.16)',
    },
    stroke: {
      idle: 'rgba(251,191,36,0.25)',
      scanning: 'rgba(251,191,36,0.62)',
      active: 'rgba(251,191,36,0.75)',
    },
  },
};

const SPOKE_ANGLES = [0, 60, 120, 180, 240, 300];
const WHEEL_CX = [175, 455] as const;

const CAR_BODY = `
  M 75 275 L 75 232 Q 79 212 108 202
  L 160 186 L 190 166 Q 210 138 228 132
  L 400 130 Q 430 130 450 156
  L 466 176 Q 494 183 522 194
  L 538 214 L 538 275
  L 504 275 A 49 49 0 0 0 406 275
  L 224 275 A 49 49 0 0 0 126 275 Z
`;

type StatusKind = 'idle' | 'scanning' | 'ok' | 'warning';

const STATUS_COLOR: Record<StatusKind, string> = {
  idle: '#475569',
  scanning: '#94a3b8',
  ok: '#34d399',
  warning: '#fbbf24',
};

export default function CarScannerDemo() {
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [scanZone, setScanZone] = useState<ZoneId | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // RAF loop — tracks scan line position in JS to drive status bar + zone states
  useEffect(() => {
    if (reducedMotion) return;
    let rafId: number;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) % SCAN_DURATION;
      const scanX = SCAN_START + (elapsed / SCAN_DURATION) * SCAN_RANGE;

      let hit: ZoneId | null = null;
      for (const z of ZONES) {
        if (scanX >= z.scanXMin && scanX <= z.scanXMax) { hit = z.id; break; }
      }
      setScanZone((prev) => (prev !== hit ? hit : prev));
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion]);

  const getState = (id: ZoneId): ZoneState => {
    if (activeZone === id) return 'active';
    if (scanZone === id) return 'scanning';
    return 'idle';
  };

  // Status bar
  const displayId = activeZone ?? scanZone;
  const displayZone = ZONES.find((z) => z.id === displayId);
  const statusKind: StatusKind = !displayZone
    ? 'idle'
    : activeZone
    ? displayZone.status
    : 'scanning';
  const statusText = !displayZone
    ? 'Analyse en cours…'
    : activeZone
    ? `${displayZone.label} — ${displayZone.statusLabel}`
    : `Analyse : ${displayZone.label}`;

  const warningZone = ZONES.find((z) => z.status === 'warning');
  const isWarningActive =
    activeZone === warningZone?.id || scanZone === warningZone?.id;

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none pb-28">
      <style>{`
        @keyframes zonePulse   { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }
        @keyframes idleBreathe { 0%,100%{ opacity:.14 } 50%{ opacity:.45 } }
        @keyframes statusIn    { from{ opacity:0; transform:translateY(4px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes dotPulse    { 0%,80%,100%{ transform:scale(1); opacity:.4 } 40%{ transform:scale(1.5); opacity:1 } }
        @keyframes warnRing    { 0%{ transform:scale(1); opacity:.7 } 100%{ transform:scale(2.2); opacity:0 } }
        @keyframes ctaPulse    { 0%,100%{ box-shadow:0 0 0 0 rgba(251,191,36,0) } 50%{ box-shadow:0 0 0 3px rgba(251,191,36,.18) } }
        .zone-idle    { animation: zonePulse 2.8s ease-in-out infinite; }
        .idle-glow    { animation: idleBreathe 4s ease-in-out infinite; }
        .status-enter { animation: statusIn .22s ease-out both; }
      `}</style>

      {/* ─────────── SVG ─────────── */}
      <svg
        viewBox="0 0 640 340"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-label="Schéma de diagnostic véhicule"
        role="img"
      >
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#c8102e" stopOpacity="0" />
            <stop offset="28%"  stopColor="#c8102e" stopOpacity="0.45" />
            <stop offset="50%"  stopColor="#ff2844" stopOpacity="1" />
            <stop offset="72%"  stopColor="#c8102e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c8102e" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#64748b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
          </radialGradient>

          <filter id="scanGlow" x="-400%" y="-5%" width="900%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <filter id="zoneGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="308" cy="302" rx="242" ry="11" fill="rgba(0,0,0,0.45)" />

        {/* Idle ambient glow */}
        {!reducedMotion && (
          <ellipse cx="308" cy="200" rx="245" ry="100"
            fill="url(#bodyGlow)" className="idle-glow" />
        )}

        {/* Body outline glow (breathes) */}
        {!reducedMotion && (
          <path d={CAR_BODY} fill="none"
            stroke="#94a3b8" strokeWidth="2.5" className="idle-glow" />
        )}

        {/* ── CAR BODY ── */}
        <path d={CAR_BODY} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

        {/* Hood crease */}
        <line x1="108" y1="202" x2="188" y2="167"
          stroke="#475569" strokeWidth="1" strokeOpacity="0.55" />

        {/* Windshield */}
        <path d="M 190 166 L 228 132 L 312 130 L 312 170 L 198 170 Z"
          fill="#0a1628" stroke="#475569" strokeWidth="1" />
        <path d="M 202 158 L 222 134 L 258 133 L 252 156 Z"
          fill="rgba(148,163,184,0.07)" />

        {/* Side window */}
        <rect x="315" y="131" width="82" height="37"
          fill="#0a1628" stroke="#475569" strokeWidth="1" />

        {/* Rear window */}
        <path d="M 400 130 L 449 157 L 447 173 L 412 170 L 398 132 Z"
          fill="#0a1628" stroke="#475569" strokeWidth="1" />

        {/* B-pillar */}
        <line x1="313" y1="130" x2="313" y2="275" stroke="#2a3a50" strokeWidth="2" />

        {/* Door lines */}
        <path d="M 198 170 L 311 170 L 311 275" fill="none"
          stroke="#2a3a50" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="315" y1="170" x2="400" y2="170"
          stroke="#2a3a50" strokeWidth="1" strokeOpacity="0.6" />

        {/* Door handles */}
        <rect x="248" y="214" width="24" height="5" rx="2.5" fill="#475569" opacity="0.65" />
        <rect x="350" y="214" width="24" height="5" rx="2.5" fill="#475569" opacity="0.65" />

        {/* Front headlight */}
        <path d="M 76 220 L 76 240 Q 80 246 92 246 L 97 238 L 92 220 Z"
          fill="#102040" stroke="#1e4080" strokeWidth="1" />
        <path d="M 80 224 L 80 236 L 89 236 L 89 224 Z"
          fill="rgba(96,160,255,0.22)" />

        {/* Rear taillight */}
        <path d="M 537 210 L 537 234 Q 534 240 526 240 L 521 234 L 525 210 Z"
          fill="#3d0810" stroke="#7f1820" strokeWidth="1" />
        <path d="M 531 214 L 531 230 L 524 230 L 524 214 Z"
          fill="rgba(200,16,46,0.28)" />

        {/* Bumper details */}
        <path d="M 76 248 Q 79 256 90 258 L 114 258" fill="none"
          stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />
        <path d="M 537 242 Q 534 256 526 258 L 500 258" fill="none"
          stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />

        {/* ── WHEELS ── */}
        {WHEEL_CX.map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="275" r="47" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <circle cx={cx} cy="275" r="38" fill="#0f172a" stroke="#2a3a50" strokeWidth="1" />
            {SPOKE_ANGLES.map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line key={angle}
                  x1={cx + Math.cos(rad) * 11} y1={275 + Math.sin(rad) * 11}
                  x2={cx + Math.cos(rad) * 32} y2={275 + Math.sin(rad) * 32}
                  stroke="#475569" strokeWidth="3" strokeLinecap="round"
                />
              );
            })}
            <circle cx={cx} cy="275" r="8" fill="#334155" stroke="#475569" strokeWidth="1" />
          </g>
        ))}

        {/* ── DIAGNOSTIC ZONES ── */}
        {/* Engine */}
        {(() => {
          const st = getState('engine');
          const z = ZONES[0];
          return (
            <rect x="76" y="132" width="148" height="143" rx="4"
              fill={S[z.status].fill[st]}
              stroke={S[z.status].stroke[st]}
              strokeWidth={st !== 'idle' ? 1.5 : 1}
              strokeDasharray={st === 'idle' ? '5 4' : undefined}
              filter={st === 'active' ? 'url(#zoneGlow)' : undefined}
              className={st === 'idle' && !reducedMotion ? 'zone-idle' : undefined}
              style={{ cursor: 'crosshair', animationDelay: z.pulseDelay,
                transition: 'fill 0.3s ease, stroke 0.3s ease' }}
              onMouseEnter={() => setActiveZone('engine')}
              onMouseLeave={() => setActiveZone(null)}
            />
          );
        })()}

        {/* Front brake */}
        {(() => {
          const st = getState('brakes-front');
          const z = ZONES[1];
          return (
            <circle cx="175" cy="275" r="57"
              fill={S[z.status].fill[st]}
              stroke={S[z.status].stroke[st]}
              strokeWidth={st !== 'idle' ? 1.5 : 1}
              strokeDasharray={st === 'idle' ? '5 4' : undefined}
              filter={st === 'active' ? 'url(#zoneGlow)' : undefined}
              className={st === 'idle' && !reducedMotion ? 'zone-idle' : undefined}
              style={{ cursor: 'crosshair', animationDelay: z.pulseDelay,
                transition: 'fill 0.3s ease, stroke 0.3s ease' }}
              onMouseEnter={() => setActiveZone('brakes-front')}
              onMouseLeave={() => setActiveZone(null)}
            />
          );
        })()}

        {/* Diagnostics */}
        {(() => {
          const st = getState('diagnostics');
          const z = ZONES[2];
          return (
            <rect x="228" y="130" width="174" height="145" rx="4"
              fill={S[z.status].fill[st]}
              stroke={S[z.status].stroke[st]}
              strokeWidth={st !== 'idle' ? 1.5 : 1}
              strokeDasharray={st === 'idle' ? '5 4' : undefined}
              filter={st === 'active' ? 'url(#zoneGlow)' : undefined}
              className={st === 'idle' && !reducedMotion ? 'zone-idle' : undefined}
              style={{ cursor: 'crosshair', animationDelay: z.pulseDelay,
                transition: 'fill 0.3s ease, stroke 0.3s ease' }}
              onMouseEnter={() => setActiveZone('diagnostics')}
              onMouseLeave={() => setActiveZone(null)}
            />
          );
        })()}

        {/* Rear brake */}
        {(() => {
          const st = getState('brakes-rear');
          const z = ZONES[3];
          return (
            <circle cx="455" cy="275" r="57"
              fill={S[z.status].fill[st]}
              stroke={S[z.status].stroke[st]}
              strokeWidth={st !== 'idle' ? 1.5 : 1}
              strokeDasharray={st === 'idle' ? '5 4' : undefined}
              filter={st === 'active' ? 'url(#zoneGlow)' : undefined}
              className={st === 'idle' && !reducedMotion ? 'zone-idle' : undefined}
              style={{ cursor: 'crosshair', animationDelay: z.pulseDelay,
                transition: 'fill 0.3s ease, stroke 0.3s ease' }}
              onMouseEnter={() => setActiveZone('brakes-rear')}
              onMouseLeave={() => setActiveZone(null)}
            />
          );
        })()}

        {/* ── SCAN LINE ── */}
        {!reducedMotion && (
          <>
            {/* Wide halo */}
            <rect x="-12" y="100" width="28" height="218"
              fill="url(#scanGrad)" opacity="0.22" filter="url(#scanGlow)">
              <animateTransform attributeName="transform" type="translate"
                from="75 0" to="538 0" dur="3.5s" repeatCount="indefinite" />
            </rect>
            {/* Core */}
            <rect x="0" y="100" width="3" height="218"
              fill="url(#scanGrad)" filter="url(#scanGlow)">
              <animateTransform attributeName="transform" type="translate"
                from="75 0" to="538 0" dur="3.5s" repeatCount="indefinite" />
            </rect>
          </>
        )}
      </svg>

      {/* ─────────── FLOATING LABELS ─────────── */}
      {ZONES.map((zone) => {
        const st = S[zone.status];
        const isActive = activeZone === zone.id;

        return (
          <div key={zone.id}
            className="absolute pointer-events-none"
            style={{
              left: zone.labelPos.left,
              top: zone.labelPos.top,
              transform: isActive
                ? 'translateX(-50%) translateY(-6px) scale(1)'
                : 'translateX(-50%) translateY(0px) scale(0.93)',
              opacity: isActive ? 1 : 0,
              filter: isActive ? 'blur(0px)' : 'blur(3px)',
              transition: 'opacity 0.28s ease, transform 0.28s ease, filter 0.28s ease',
            }}
          >
            {/* Tail — top (label below car) */}
            {zone.labelBelow && (
              <div className="flex justify-center mb-px">
                <div style={{
                  width: '1px', height: '18px',
                  background: `linear-gradient(to bottom, transparent, ${st.stroke.active})`,
                }} />
              </div>
            )}

            {/* Card */}
            <div className="rounded-lg px-3.5 py-2.5 whitespace-nowrap"
              style={{
                background: 'rgba(15,23,42,0.97)',
                border: `1px solid ${isActive ? st.stroke.scanning : 'rgba(51,65,85,0.7)'}`,
                boxShadow: isActive
                  ? `0 4px 24px -4px rgba(0,0,0,0.55), 0 0 14px -4px ${st.fill.scanning}`
                  : '0 4px 16px -4px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                {/* Status dot with ping for warning */}
                <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  {zone.status === 'warning' && isActive && !reducedMotion && (
                    <span className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: st.dot,
                        animation: 'warnRing 1.8s ease-out infinite' }} />
                  )}
                  <span className="w-2 h-2 rounded-full relative"
                    style={{ backgroundColor: st.dot }} />
                </span>
                <span className="font-heading font-normal tracking-tight text-sm"
                  style={{ color: '#f1f5f9' }}>
                  {zone.label}
                </span>
              </div>
              <p className="text-[10px] font-light tracking-wide pl-3.5"
                style={{ color: '#64748b' }}>
                {zone.sublabel}
              </p>
              <p className="text-[10px] font-medium pl-3.5 mt-0.5"
                style={{ color: st.text }}>
                {zone.statusLabel}
              </p>
            </div>

            {/* Tail — bottom (label above car) */}
            {!zone.labelBelow && (
              <div className="flex justify-center mt-px">
                <div style={{
                  width: '1px', height: '18px',
                  background: `linear-gradient(to bottom, ${st.stroke.active}, transparent)`,
                }} />
              </div>
            )}
          </div>
        );
      })}

      {/* ─────────── STATUS BAR ─────────── */}
      <div className="flex items-center gap-3 px-4 py-3 mt-4 rounded-lg"
        style={{
          background: 'rgba(15,23,42,0.65)',
          border: '1px solid rgba(51,65,85,0.5)',
          minHeight: '44px',
        }}
      >
        {/* Icon */}
        <span className="text-[10px] shrink-0 leading-none"
          style={{ color: STATUS_COLOR[statusKind], transition: 'color 0.3s ease' }}>
          {statusKind === 'ok' && '✓'}
          {statusKind === 'warning' && '⚠'}
          {(statusKind === 'idle' || statusKind === 'scanning') && '◎'}
        </span>

        {/* Text — key forces re-mount so animation fires on change */}
        <p key={`${displayId}-${statusKind}`}
          className="text-[11px] font-light tracking-wide status-enter flex-1"
          style={{ color: STATUS_COLOR[statusKind] }}>
          {statusText}
        </p>

        {/* Animated dots while scanning / idle */}
        {(statusKind === 'idle' || statusKind === 'scanning') && !reducedMotion && (
          <span className="flex items-center gap-[3px] shrink-0">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-[3px] h-[3px] rounded-full"
                style={{
                  background: '#475569',
                  animation: 'dotPulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.22}s`,
                }} />
            ))}
          </span>
        )}
      </div>

      {/* ─────────── CTA ─────────── */}
      <div className="flex items-center justify-between gap-4 mt-3 px-4 py-3 rounded-lg"
        style={{
          background: 'rgba(15,23,42,0.4)',
          border: `1px solid ${isWarningActive ? 'rgba(251,191,36,0.35)' : 'rgba(51,65,85,0.35)'}`,
          transition: 'border-color 0.4s ease',
          animation: isWarningActive && !reducedMotion ? 'ctaPulse 2s ease-in-out infinite' : undefined,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: '#fbbf24', opacity: isWarningActive ? 1 : 0.5,
              transition: 'opacity 0.3s ease' }} />
          <p className="text-[11px] font-light truncate"
            style={{ color: isWarningActive ? '#94a3b8' : '#475569',
              transition: 'color 0.3s ease' }}>
            {warningZone
              ? `${warningZone.label} — ${warningZone.statusLabel}`
              : 'Aucun problème détecté'}
          </p>
        </div>
        <Link href="/contact"
          className="btn-primary shrink-0 text-[11px]"
          style={{ padding: '6px 14px', minHeight: '34px' }}>
          Prendre rendez-vous
        </Link>
      </div>
    </div>
  );
}
