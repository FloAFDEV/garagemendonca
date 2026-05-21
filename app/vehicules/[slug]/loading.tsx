import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";

export default function VehicleDetailLoading() {
  return (
    <MainLayout>
      <Container className="py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-12 animate-pulse">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex gap-2 items-center">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-2 bg-slate-100 rounded" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <div className="h-8 bg-slate-200 rounded w-2/3" />
              <div className="h-5 bg-slate-100 rounded w-1/3" />
            </div>

            {/* Galerie */}
            <div className="space-y-3">
              <div className="aspect-[16/9] bg-slate-200 rounded-2xl" />
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[4/3] bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Fiche technique */}
            <div className="space-y-3">
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite — sticky card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-7 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-12 bg-slate-200 rounded-xl" />
              <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
