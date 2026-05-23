// Page 1 du catalogue paginé — équivalente à /vehicules/page/1
// Rendu dynamique pour que les filtres URL soient pris en compte
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, cache } from "react";
import { unstable_cache } from "next/cache";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import GmBadge from "@/components/ui/GmBadge";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import VehicleFiltersBar from "@/components/vehicles/VehicleFiltersBar";
import { FilterStatePreserver } from "@/components/vehicles/FilterStatePreserver";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { parsePageFilters, filtersToQs } from "@/lib/vehicles/filters";
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import {
  buildPaginationMeta,
  paginationRange,
  listingCanonical,
  listingTitle,
  listingDescription,
  VEHICLES_PER_PAGE,
} from "@/lib/vehicles/pagination";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Wrench,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { getActiveGarageId } from "@/lib/config/garage";
import QualityControlTooltip from "@/components/ui/QualityControlTooltip";

// ─── JSON-LD ─────────────────────────────────────────────────────

function buildItemListJsonLd(
  vehicles: Awaited<ReturnType<typeof vehicleDb.listPaginated>>,
  totalCount: number,
): object {
  const baseUrl = "https://www.garagemendonca.com";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Voitures d'occasion — Garage Mendonça",
    description: "Catalogue de véhicules d'occasion révisés et garantis",
    url: `${baseUrl}/vehicules`,
    numberOfItems: totalCount,
    itemListElement: vehicles.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/vehicules/${v.slug ?? v.id}`,
      name: `${v.brand} ${v.model} ${v.year}`,
    })),
  };
}

const GARAGE_ID = getActiveGarageId();

// ─── Cache helpers ────────────────────────────────────────────────
// cache() : déduplique countPublic dans la même requête (metadata + page)
const countPublicCached = cache(
  (garageId: string, filters: Parameters<typeof vehicleDb.countPublic>[1]) =>
    vehicleDb.countPublic(garageId, filters),
);

// unstable_cache : marques disponibles — peu volatiles, TTL 5 min
const listBrandsCached = unstable_cache(
  (garageId: string) => vehicleDb.listBrands(garageId),
  ["vehicle-brands"],
  { revalidate: 300 },
);

// ─── Types ───────────────────────────────────────────────────────

type SearchParams = Record<string, string | string[] | undefined>;

// ─── Metadata ────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filters = parsePageFilters(sp);
  const totalCount = await countPublicCached(GARAGE_ID, filters).catch(() => 0);
  const desc = listingDescription(1, totalCount);
  return {
    title: listingTitle(1, 1),
    description: desc,
    robots: { index: true, follow: true },
    alternates: { canonical: "https://www.garagemendonca.com/vehicules" },
    openGraph: {
      title: "Occasions révisées & garanties — Garage Mendonça, Drémil-Lafage",
      description: desc,
      url: "https://www.garagemendonca.com/vehicules",
      type: "website",
      siteName: "Garage Mendonça",
      locale: "fr_FR",
    },
    twitter: { card: "summary_large_image", title: "Voitures d'occasion — Garage Mendonça", description: desc },
  };
}

// ─── Pagination nav ──────────────────────────────────────────────

function PaginationNav({
  meta,
  filterQuery,
}: {
  meta: ReturnType<typeof buildPaginationMeta>;
  filterQuery: string;
}) {
  const { page, totalPages, hasNext, hasPrev } = meta;
  const range = paginationRange(page, totalPages);
  const qs = filterQuery ? `?${filterQuery}` : "";
  const pageHref = (p: number) => `${listingCanonical(p)}${qs}`;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-12">
      {hasPrev ? (
        <Link href={pageHref(page - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-normal text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Page précédente">
          <ChevronLeft size={16} /> Précédent
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-slate-300 cursor-not-allowed">
          <ChevronLeft size={16} /> Précédent
        </span>
      )}

      <div className="flex items-center gap-1">
        {range.map((p, idx) =>
          p === "..." ? (
            <span key={`e-${idx}`} className="px-2 py-2 text-slate-400 text-sm">…</span>
          ) : (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium bg-brand-600 text-white"
                  : "w-9 h-9 flex items-center justify-center rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              }
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {hasNext ? (
        <Link href={pageHref(page + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-normal text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Page suivante">
          Suivant <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-slate-300 cursor-not-allowed">
          Suivant <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default async function VehiculesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const rawFilters = parsePageFilters(sp);
  const filterQuery = filtersToQs(sp);

  // Fetch categories first to resolve slug → categoryId (source de vérité)
  const [availableBrands, categories] = await Promise.all([
    listBrandsCached(GARAGE_ID).catch(() => []),
    vehicleCategoryRepository.getAll(GARAGE_ID).catch(() => []),
  ]);

  // Résolution slug → categoryId pour utiliser le FK (pas TEXT[])
  const categoryId = rawFilters.category
    ? categories.find((c) => c.slug === rawFilters.category)?.id
    : undefined;
  const filters = { ...rawFilters, category: undefined, categoryId };

  const [vehicles, totalCount] = await Promise.all([
    vehicleDb.listPaginated(GARAGE_ID, 1, VEHICLES_PER_PAGE, filters).catch((err) => {
      console.error("[VehiculesPage] listPaginated failed:", err);
      return [];
    }),
    countPublicCached(GARAGE_ID, filters).catch((err) => {
      console.error("[VehiculesPage] countPublic failed:", err);
      return 0;
    }),
  ]);

  const meta = buildPaginationMeta(1, totalCount);

  const jsonLd = buildItemListJsonLd(vehicles, totalCount);

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-20 sm:pt-28 pb-10 sm:pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-brand-500" aria-hidden="true" />
                <span className="text-brand-400 font-normal text-xs uppercase tracking-caps">
                  Notre stock
                </span>
              </div>
              <h1 className="ty-display text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-5">
                Véhicules d&apos;occasion{" "}
                <span className="text-brand-500">révisés &amp; garantis</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                Chaque véhicule est inspecté en{" "}
                <QualityControlTooltip variant="inline" triggerClassName="text-slate-300">
                  160 points de contrôle
                </QualityControlTooltip>
                , révisé et garanti 6 à 12 mois kilométrage illimité. Financement et
                reprise étudiés ensemble.
              </p>
            </div>
            <GmBadge size="lg" className="hidden sm:block opacity-90 flex-shrink-0 self-center" />
          </div>
        </Container>
      </section>

      {/* ── Catalogue ── */}
      <section className="py-12 bg-[#f8fafc]">
        <Container>
          {/* Filtres */}
          <Suspense>
            <FilterStatePreserver />
            <VehicleFiltersBar
              totalCount={totalCount}
              availableBrands={availableBrands}
              currentYear={new Date().getFullYear()}
              categories={categories}
            />
          </Suspense>

          {vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {vehicles.map((vehicle, i) =>
                  // Les 4 premières cartes sont above-the-fold : pas d'AnimateOnScroll
                  // (évite opacity:0 SSR qui exclut ces éléments du calcul LCP)
                  i < 4 ? (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} priority />
                  ) : (
                    <AnimateOnScroll key={vehicle.id} delay={(i - 4) * 60}>
                      <VehicleCard vehicle={vehicle} />
                    </AnimateOnScroll>
                  )
                )}
              </div>

              <PaginationNav meta={meta} filterQuery={filterQuery} />

              {/* Breadcrumb SEO */}
              <nav aria-label="Fil d'Ariane" className="mt-8 text-center text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-600">Accueil</Link>
                {" › "}
                <span aria-current="page">Nos voitures</span>
              </nav>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg mb-2">Aucun véhicule ne correspond à vos critères.</p>
              <Link href="/vehicules" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors mt-4">
                Voir tous les véhicules
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* ── Garanties ── */}
      <section className="py-12 bg-white border-t border-slate-200">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 text-center">
            {[
              { Icon: ClipboardCheck, label: "Contrôle technique récent" },
              { Icon: Wrench,         label: "Révision complète effectuée" },
              { Icon: BookOpen,       label: "Carnet d'entretien vérifié" },
              { Icon: ShieldCheck,    label: "Garantie 6 à 12 mois km illimités" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Icon size={17} className="text-brand-500" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <span className="font-normal text-[#0f172a] text-sm">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
