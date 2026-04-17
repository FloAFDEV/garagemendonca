'use client';

import { useState, useEffect } from 'react';

type ZoneId = 'engine' | 'brakes-front' | 'diagnostics' | 'brakes-rear';
type Status = 'ok' | 'warning';

interface Zone {
  id: ZoneId;
  label: string;
  sublabel: string;
  status: Status;
  statusLabel: string;
  labelPos: { left: string; top: string };
  pulseDelay: string;
}

const ZONES: Zone[] = [
  {
    id: 'engine',
    label: 'Moteur',
    sublabel: 'Injection · Courroie · Fluides',
    status: 'ok',
    statusLabel: 'Nominal',
    labelPos: { left: '14%', top: '23%' },
    pulseDelay: '0s',
  },
  {
    id: 'brakes-front',
    label: 'Frein avant',
    sublabel: 'Disques · Plaquettes · Étriers',
    status: 'warning',
    statusLabel: 'Usure détectée',
    labelPos: { left: '22%', top: '93%' },
    pulseDelay: '0.6s',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostic OBD',
    sublabel: 'Capteurs · Calculateur · Codes',
    status: 'ok',
    statusLabel: 'Aucun code erreur',
    labelPos: { left: '49%', top: '23%' },
    pulseDelay: '1.2s',
  },
  {
    id: 'brakes-rear',
    label: 'Frein arrière',
    sublabel: 'Tambours · Mâchoires · Câble',
    status: 'ok',
    statusLabel: 'Nominal',
    labelPos: { left: '73%', top: '93%' },
    pulseDelay: '1.8s',
  },
];

const STATUS_STYLES: Record<Status, {
  dot: string;
  text: string;
  fill: string;
  stroke: string;
  fillIdle: string;
  strokeIdle: string;
}> = {
  ok: {
    dot: '#34d399',
    text: '#34d399',
    fill: 'rgba(52,211,153,0.13)',
    stroke: 'rgba(52,211,153,0.65)',
    fillIdle: 'rgba(52,211,153,0.04)',
    strokeIdle: 'rgba(52,211,153,0.22)',
  },
  warning: {
    dot: '#fbbf24',
    text: '#fbbf24',
    fill: 'rgba(251,191,36,0.13)',
    stroke: 'rgba(251,191,36,0.65)',
    fillIdle: 'rgba(251,191,36,0.04)',
    strokeIdle: 'rgba(251,191,36,0.25)',
  },
};

// Spoke angles for wheels
const SPOKE_ANGLES = [0, 60, 120, 180, 240, 300];
const WHEEL_CX = [175, 455] as const;

export default function CarScannerDemo() {
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none pb-24">
      <style>{`
        @keyframes zonePulse {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 1; }
        }
        .zone-idle {
          animation: zonePulse 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* ── SVG SCANNER ── */}
      <svg
        viewBox="0 0 640 340"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-label="Schéma de diagnostic véhicule"
        role="img"
      >
        <defs>
          {/* Scan-line gradient (vertical red sweep) */}
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#c8102e" stopOpacity="0" />
            <stop offset="28%"  stopColor="#c8102e" stopOpacity="0.45" />
            <stop offset="50%"  stopColor="#ff2844" stopOpacity="1" />
            <stop offset="72%"  stopColor="#c8102e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c8102e" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter for scan line */}
          <filter id="scanGlow" x="-400%" y="-5%" width="900%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter for active zone */}
          <filter id="zoneGlow" x="-8%" y="-8%" width="116%" height="116%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="308" cy="302" rx="242" ry="11" fill="rgba(0,0,0,0.45)" />

        {/* ══ CAR BODY ══ */}
        <path
          d="M 75 275
             L 75 232
             Q 79 212 108 202
             L 160 186 L 190 166
             Q 210 138 228 132
             L 400 130
             Q 430 130 450 156
             L 466 176
             Q 494 183 522 194
             L 538 214 L 538 275
             L 504 275
             A 49 49 0 0 0 406 275
             L 224 275
             A 49 49 0 0 0 126 275
             Z"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Hood crease */}
        <line x1="108" y1="202" x2="188" y2="167" stroke="#475569" strokeWidth="1" strokeOpacity="0.55" />

        {/* ── WINDOWS ── */}
        {/* Windshield */}
        <path
          d="M 190 166 L 228 132 L 312 130 L 312 170 L 198 170 Z"
          fill="#0a1628"
          stroke="#475569"
          strokeWidth="1"
        />
        {/* Windshield highlight */}
        <path d="M 202 158 L 222 134 L 258 133 L 252 156 Z" fill="rgba(148,163,184,0.07)" />

        {/* Side window */}
        <rect x="315" y="131" width="82" height="37" fill="#0a1628" stroke="#475569" strokeWidth="1" />

        {/* Rear window */}
        <path
          d="M 400 130 L 449 157 L 447 173 L 412 170 L 398 132 Z"
          fill="#0a1628"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* ── BODY DETAILS ── */}
        {/* B-pillar */}
        <line x1="313" y1="130" x2="313" y2="275" stroke="#2a3a50" strokeWidth="2" />

        {/* Door lower lines */}
        <path d="M 198 170 L 311 170 L 311 275" fill="none" stroke="#2a3a50" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="315" y1="170" x2="400" y2="170" stroke="#2a3a50" strokeWidth="1" strokeOpacity="0.6" />

        {/* Door handles */}
        <rect x="248" y="214" width="24" height="5" rx="2.5" fill="#475569" opacity="0.65" />
        <rect x="350" y="214" width="24" height="5" rx="2.5" fill="#475569" opacity="0.65" />

        {/* Front headlight */}
        <path d="M 76 220 L 76 240 Q 80 246 92 246 L 97 238 L 92 220 Z" fill="#102040" stroke="#1e4080" strokeWidth="1" />
        <path d="M 80 224 L 80 236 L 89 236 L 89 224 Z" fill="rgba(96,160,255,0.22)" />

        {/* Rear taillight */}
        <path d="M 537 210 L 537 234 Q 534 240 526 240 L 521 234 L 525 210 Z" fill="#3d0810" stroke="#7f1820" strokeWidth="1" />
        <path d="M 531 214 L 531 230 L 524 230 L 524 214 Z" fill="rgba(200,16,46,0.28)" />

        {/* Bumper details */}
        <path d="M 76 248 Q 79 256 90 258 L 114 258" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />
        <path d="M 537 242 Q 534 256 526 258 L 500 258" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />

        {/* ══ WHEELS ══ */}
        {WHEEL_CX.map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="275" r="47" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <circle cx={cx} cy="275" r="38" fill="#0f172a" stroke="#2a3a50" strokeWidth="1" />
            {SPOKE_ANGLES.map((angle) => {
              const r = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={cx + Math.cos(r) * 11}
                  y1={275 + Math.sin(r) * 11}
                  x2={cx + Math.cos(r) * 32}
                  y2={275 + Math.sin(r) * 32}
                  stroke="#475569"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx={cx} cy="275" r="8" fill="#334155" stroke="#475569" strokeWidth="1" />
          </g>
        ))}

        {/* ══ DIAGNOSTIC ZONES ══ */}
        {/* Engine */}
        <rect
          x="76" y="132" width="148" height="143" rx="4"
          fill={activeZone === 'engine' ? STATUS_STYLES.ok.fill : STATUS_STYLES.ok.fillIdle}
          stroke={activeZone === 'engine' ? STATUS_STYLES.ok.stroke : STATUS_STYLES.ok.strokeIdle}
          strokeWidth={activeZone === 'engine' ? 1.5 : 1}
          strokeDasharray={activeZone === 'engine' ? undefined : '5 4'}
          filter={activeZone === 'engine' ? 'url(#zoneGlow)' : undefined}
          className={activeZone !== 'engine' && !reducedMotion ? 'zone-idle' : undefined}
          style={{ cursor: 'crosshair', animationDelay: '0s', transition: 'fill 0.25s, stroke 0.25s' }}
          onMouseEnter={() => setActiveZone('engine')}
          onMouseLeave={() => setActiveZone(null)}
        />

        {/* Front brake */}
        <circle
          cx="175" cy="275" r="57"
          fill={activeZone === 'brakes-front' ? STATUS_STYLES.warning.fill : STATUS_STYLES.warning.fillIdle}
          stroke={activeZone === 'brakes-front' ? STATUS_STYLES.warning.stroke : STATUS_STYLES.warning.strokeIdle}
          strokeWidth={activeZone === 'brakes-front' ? 1.5 : 1}
          strokeDasharray={activeZone === 'brakes-front' ? undefined : '5 4'}
          filter={activeZone === 'brakes-front' ? 'url(#zoneGlow)' : undefined}
          className={activeZone !== 'brakes-front' && !reducedMotion ? 'zone-idle' : undefined}
          style={{ cursor: 'crosshair', animationDelay: '0.6s', transition: 'fill 0.25s, stroke 0.25s' }}
          onMouseEnter={() => setActiveZone('brakes-front')}
          onMouseLeave={() => setActiveZone(null)}
        />

        {/* Diagnostics / cabin */}
        <rect
          x="228" y="130" width="174" height="145" rx="4"
          fill={activeZone === 'diagnostics' ? STATUS_STYLES.ok.fill : STATUS_STYLES.ok.fillIdle}
          stroke={activeZone === 'diagnostics' ? STATUS_STYLES.ok.stroke : STATUS_STYLES.ok.strokeIdle}
          strokeWidth={activeZone === 'diagnostics' ? 1.5 : 1}
          strokeDasharray={activeZone === 'diagnostics' ? undefined : '5 4'}
          filter={activeZone === 'diagnostics' ? 'url(#zoneGlow)' : undefined}
          className={activeZone !== 'diagnostics' && !reducedMotion ? 'zone-idle' : undefined}
          style={{ cursor: 'crosshair', animationDelay: '1.2s', transition: 'fill 0.25s, stroke 0.25s' }}
          onMouseEnter={() => setActiveZone('diagnostics')}
          onMouseLeave={() => setActiveZone(null)}
        />

        {/* Rear brake */}
        <circle
          cx="455" cy="275" r="57"
          fill={activeZone === 'brakes-rear' ? STATUS_STYLES.ok.fill : STATUS_STYLES.ok.fillIdle}
          stroke={activeZone === 'brakes-rear' ? STATUS_STYLES.ok.stroke : STATUS_STYLES.ok.strokeIdle}
          strokeWidth={activeZone === 'brakes-rear' ? 1.5 : 1}
          strokeDasharray={activeZone === 'brakes-rear' ? undefined : '5 4'}
          filter={activeZone === 'brakes-rear' ? 'url(#zoneGlow)' : undefined}
          className={activeZone !== 'brakes-rear' && !reducedMotion ? 'zone-idle' : undefined}
          style={{ cursor: 'crosshair', animationDelay: '1.8s', transition: 'fill 0.25s, stroke 0.25s' }}
          onMouseEnter={() => setActiveZone('brakes-rear')}
          onMouseLeave={() => setActiveZone(null)}
        />

        {/* ══ SCAN LINE ══ */}
        {!reducedMotion && (
          <>
            {/* Wide glow */}
            <rect x="-12" y="100" width="28" height="218" fill="url(#scanGrad)" opacity="0.22" filter="url(#scanGlow)">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="75 0"
                to="538 0"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </rect>
            {/* Core line */}
            <rect x="0" y="100" width="3" height="218" fill="url(#scanGrad)" filter="url(#scanGlow)">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="75 0"
                to="538 0"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </rect>
          </>
        )}
      </svg>

      {/* ══ FLOATING LABELS ══ */}
      {ZONES.map((zone) => {
        const st = STATUS_STYLES[zone.status];
        const isActive = activeZone === zone.id;
        return (
          <div
            key={zone.id}
            className="absolute pointer-events-none"
            style={{
              left: zone.labelPos.left,
              top: zone.labelPos.top,
              transform: isActive
                ? 'translateX(-50%) translateY(-4px)'
                : 'translateX(-50%) translateY(0px)',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            <div
              className="rounded-lg px-3.5 py-2.5 whitespace-nowrap"
              style={{
                background: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(51,65,85,0.8)',
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: st.dot }}
                />
                <span
                  className="font-heading font-normal tracking-tight text-sm"
                  style={{ color: '#f1f5f9' }}
                >
                  {zone.label}
                </span>
              </div>
              <p
                className="text-[10px] font-light tracking-wide pl-3.5"
                style={{ color: '#64748b' }}
              >
                {zone.sublabel}
              </p>
              <p
                className="text-[10px] font-medium pl-3.5 mt-0.5"
                style={{ color: st.text }}
              >
                {zone.statusLabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
