// Rendu dynamique : les filtres URL invalident le cache statique
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import VehicleFiltersBar from "@/components/vehicles/VehicleFiltersBar";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { parsePageFilters, filtersToQs } from "@/lib/vehicles/filters";
import {
  buildPaginationMeta,
  paginationRange,
  listingCanonical,
  listingTitle,
  listingDescription,
  VEHICLES_PER_PAGE,
} from "@/lib/vehicles/pagination";
import { ChevronLeft, ChevronRight, ShieldCheck, ClipboardCheck, Wrench, BookOpen } from "lucide-react";

const GARAGE_ID = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params: Promise<{ page: string }>;
  searchParams: Promise<SearchParams>;
};

// ─────────────────────────────────────────────────────────────────
//  Metadata
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 1) return { title: "Page introuvable" };

  const sp = await searchParams;
  const filters = parsePageFilters(sp);
  const totalCount = await vehicleDb.countPublic(GARAGE_ID, filters).catch(() => 0);
  const meta = buildPaginationMeta(page, totalCount);
  const canonical = `https://www.garagemendonca.com${listingCanonical(page)}`;

  return {
    title: listingTitle(page, meta.totalPages),
    description: listingDescription(page, totalCount),
    alternates: { canonical },
    openGraph: {
      title: listingTitle(page, meta.totalPages),
      description: listingDescription(page, totalCount),
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listingTitle(page, meta.totalPages),
      description: listingDescription(page, totalCount),
    },
    robots: { index: true, follow: true },
  };
}

// ─────────────────────────────────────────────────────────────────
//  JSON-LD
// ─────────────────────────────────────────────────────────────────

function buildItemListJsonLd(
  vehicles: Awaited<ReturnType<typeof vehicleDb.listPaginated>>,
  page: number,
  totalCount: number,
): object {
  const baseUrl = "https://www.garagemendonca.com";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Voitures d'occasion — Page ${page}`,
    description: `Catalogue de véhicules d'occasion révisés et garantis`,
    url: `${baseUrl}${listingCanonical(page)}`,
    numberOfItems: totalCount,
    itemListElement: vehicles.map((v, i) => ({
      "@type": "ListItem",
      position: (page - 1) * VEHICLES_PER_PAGE + i + 1,
      url: `${baseUrl}/vehicules/${v.slug ?? v.id}`,
      name: `${v.brand} ${v.model} ${v.year}`,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────
//  Composant pagination (filtre-aware)
// ─────────────────────────────────────────────────────────────────

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
        <Link
          href={pageHref(page - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-normal text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft size={16} />
          Précédent
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-slate-300 cursor-not-allowed">
          <ChevronLeft size={16} />
          Précédent
        </span>
      )}

      <div className="flex items-center gap-1">
        {range.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-slate-400 text-sm">…</span>
          ) : (
            <Link
              key={p}
              href={pageHref(p)}
              aria-label={`Page ${p}`}
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
        <Link
          href={pageHref(page + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-normal text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Page suivante"
        >
          Suivant
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-slate-300 cursor-not-allowed">
          Suivant
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
//  Page principale
// ─────────────────────────────────────────────────────────────────

export default async function VehiculesPaginatedPage({ params, searchParams }: PageProps) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);

  if (isNaN(page) || page < 1) notFound();

  const sp = await searchParams;
  const filters = parsePageFilters(sp);
  const filterQuery = filtersToQs(sp);

  const [vehicles, totalCount, availableBrands] = await Promise.all([
    vehicleDb.listPaginated(GARAGE_ID, page, VEHICLES_PER_PAGE, filters).catch((err) => {
      console.error("[VehiculesPaginatedPage] listPaginated failed:", err);
      return [];
    }),
    vehicleDb.countPublic(GARAGE_ID, filters).catch((err) => {
      console.error("[VehiculesPaginatedPage] countPublic failed:", err);
      return 0;
    }),
    vehicleDb.listBrands(GARAGE_ID).catch(() => []),
  ]);

  const meta = buildPaginationMeta(page, totalCount);

  if (page > meta.totalPages && meta.totalPages > 0) notFound();

  const jsonLd = buildItemListJsonLd(vehicles, page, totalCount);

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-36 pb-20 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-brand-500" aria-hidden="true" />
              <span className="text-brand-400 font-normal text-xs uppercase tracking-caps">
                Notre stock · {totalCount} véhicule{totalCount !== 1 ? "s" : ""}
              </span>
            </div>
            <h1 className="ty-display text-white text-5xl md:text-6xl mb-6">
              Véhicules d&apos;occasion{" "}
              <span className="text-brand-500">révisés &amp; garantis</span>
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed max-w-2xl">
              Chaque véhicule est inspecté en 160 points, révisé et garanti 6
              à 12 mois kilométrage illimité.
            </p>
            {meta.totalPages > 1 && (
              <p className="text-slate-400 text-sm mt-4">
                Page {page} sur {meta.totalPages}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* ── Catalogue + filtres ── */}
      <section className="py-12 bg-[#f8fafc]">
        <Container>
          {/* Filtres (client component, besoin de Suspense pour useSearchParams) */}
          <Suspense>
            <VehicleFiltersBar totalCount={totalCount} availableBrands={availableBrands} />
          </Suspense>

          {vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {vehicles.map((vehicle, i) => (
                  <AnimateOnScroll key={vehicle.id} delay={i * 60}>
                    <VehicleCard vehicle={vehicle} priority={i < 4} />
                  </AnimateOnScroll>
                ))}
              </div>

              <PaginationNav meta={meta} filterQuery={filterQuery} />

              {/* Breadcrumb SEO */}
              <nav aria-label="Fil d'Ariane" className="mt-8 text-center text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-600">Accueil</Link>
                {" › "}
                <Link href="/vehicules" className="hover:text-slate-600">Nos voitures</Link>
                {page > 1 && (
                  <>
                    {" › "}
                    <span aria-current="page">Page {page}</span>
                  </>
                )}
              </nav>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg mb-2">Aucun véhicule ne correspond à vos critères.</p>
              <p className="text-sm mb-6">Essayez de modifier ou supprimer certains filtres.</p>
              <Link
                href="/vehicules/page/1"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
              >
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
              { Icon: Wrench, label: "Révision complète effectuée" },
              { Icon: BookOpen, label: "Carnet d'entretien vérifié" },
              { Icon: ShieldCheck, label: "Garantie 6 à 12 mois km illimités" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
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
