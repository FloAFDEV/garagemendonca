import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";

function CardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      {/* Image — ratio mobile 3:2 / desktop 4:3 (identique à VehicleCard) */}
      <div className="aspect-[3/2] sm:aspect-[4/3] bg-slate-200" />

      {/* ── Mobile (< sm) : layout compact ── */}
      <div className="sm:hidden flex flex-col gap-1 px-2.5 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-1">
          <div className="h-3.5 bg-slate-200 rounded w-3/5" />
          <div className="h-4 w-14 bg-slate-100 rounded-full" />
        </div>
        <div className="h-3 bg-slate-100 rounded w-2/5" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mt-0.5" />
        <div className="h-2.5 bg-slate-100 rounded w-3/4" />
      </div>

      {/* ── Desktop (sm+) : layout complet ── */}
      <div className="hidden sm:flex sm:flex-col p-3 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-5 flex-1 bg-slate-100 rounded-md" />
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function VehiculesLoading() {
  return (
    <MainLayout>
      {/* Hero skeleton */}
      <section className="bg-[#0f172a] pt-24 sm:pt-32 pb-12 sm:pb-20">
        <Container>
          <div className="space-y-4 animate-pulse">
            <div className="h-3 bg-white/10 rounded w-40" />
            <div className="h-10 bg-white/10 rounded w-3/4 max-w-xl" />
            <div className="h-5 bg-white/10 rounded w-full max-w-lg" />
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        {/* Filters bar skeleton */}
        <div className="mb-8 h-14 bg-slate-100 rounded-2xl animate-pulse" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </MainLayout>
  );
}
