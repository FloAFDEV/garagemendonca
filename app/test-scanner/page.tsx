import type { Metadata } from 'next';
import CarScannerDemo from './CarScannerDemo';

export const metadata: Metadata = {
  title: 'Test Scanner — Garage Mendonça',
  robots: { index: false, follow: false },
};

export default function TestScannerPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center py-20 px-4"
      style={{ background: '#0f172a' }}
    >
      {/* Header */}
      <div className="text-center mb-14 animate-fade-in">
        <p
          className="text-[10px] font-light tracking-caps uppercase mb-4"
          style={{ color: '#c8102e' }}
        >
          Environnement de test
        </p>
        <h1
          className="font-heading font-normal tracking-tight text-3xl md:text-4xl mb-3"
          style={{ color: '#f1f5f9' }}
        >
          Test Scanner
        </h1>
        <p
          className="text-sm font-light max-w-xs mx-auto leading-relaxed"
          style={{ color: '#475569' }}
        >
          Survolez une zone pour afficher le détail du diagnostic.
        </p>
      </div>

      {/* Scanner component */}
      <div className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {/* Outer glow frame */}
        <div
          className="rounded-2xl p-6 md:p-10"
          style={{
            background: 'rgba(30,41,59,0.5)',
            border: '1px solid rgba(51,65,85,0.6)',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.4)',
          }}
        >
          <CarScannerDemo />
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-6 mt-10 text-[11px] font-light animate-fade-in"
        style={{ animationDelay: '0.3s', color: '#475569' }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
          Nominal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
          Attention requise
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: '#c8102e' }} />
          Critique
        </span>
      </div>
    </main>
  );
}
