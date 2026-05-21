import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";

function CardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-200 flex-shrink-0" />
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
            <div key={i} className="h-5 w-16 bg-slate-100 rounded-md" />
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="hidden sm:block h-10 bg-slate-100 rounded-lg" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </MainLayout>
  );
}
