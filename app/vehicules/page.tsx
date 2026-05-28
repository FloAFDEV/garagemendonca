// Page 1 du catalogue paginé — équivalente à /vehicules/page/1
// Note : force-dynamic supprimé intentionnellement.
// Les searchParams rendent déjà la page dynamique par détection automatique Next.js.
// Sans force-dynamic, le RSC router cache (30 s) fonctionne sur /vehicules sans filtres :
// retour liste → pas de _rsc si l'utilisateur revient dans la fenêtre cache.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, cache } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import GmBadge from "@/components/ui/GmBadge";
import VehicleFiltersBar from "@/components/vehicles/VehicleFiltersBar";
import { FilterStatePreserver } from "@/components/vehicles/FilterStatePreserver";
import { VehicleGridServer, VehicleGridFallback } from "@/components/vehicles/VehicleGridServer";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { parsePageFilters, filtersToQs } from "@/lib/vehicles/filters";
import {
  listBrandsCached,
  listCategoriesCached,
  listActiveCategoryIdsCached,
} from "@/lib/cache/vehicleStaticData";
import {
  buildPaginationMeta,
  paginationRange,
  listingCanonical,
  listingTitle,
  listingDescription,
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

function buildItemListJsonLd(totalCount: number): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Voitures d'occasion — Garage Mendonça",
    description: "Catalogue de véhicules d'occasion révisés et garantis",
    url: "https://www.garagemendonca.com/vehicules",
    numberOfItems: totalCount,
  };
}

const GARAGE_ID = getActiveGarageId();

// ─── Cache helpers ────────────────────────────────────────────────
// cache() : déduplique countPublic dans la même requête (metadata + page)
// Les données statiques (brands, catégories) viennent du module partagé.
const countPublicCached = cache(
  (garageId: string, filters: Parameters<typeof vehicleDb.countPublic>[1]) =>
    vehicleDb.countPublic(garageId, filters),
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
  const rawFilters = parsePageFilters(sp);
  // Résoudre slug → categoryId ici aussi pour que React.cache() déduplique
  // l'appel à countPublic entre generateMetadata et le page component.
  let categoryId: string | undefined;
  if (rawFilters.category) {
    const cats = await listCategoriesCached(GARAGE_ID).catch(() => []);
    categoryId = cats.find((c) => c.slug === rawFilters.category)?.id;
  }
  const filters = { ...rawFilters, category: undefined, categoryId };
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
      images: [{ url: "/images/og-image.webp", width: 1200, height: 630, alt: "Voitures d'occasion Garage Mendonça" }],
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

  // Données quasi-statiques depuis le cache partagé — 1 hit Supabase / 5 min max
  // quelle que soit la pagination (page 1, 2, 3… partagent le même cache).
  const [availableBrands, allCategories, activeCatIds] = await Promise.all([
    listBrandsCached(GARAGE_ID).catch(() => []),
    listCategoriesCached(GARAGE_ID).catch(() => []),
    listActiveCategoryIdsCached(GARAGE_ID).catch((): string[] => []),
  ]);
  // N'afficher que les catégories ayant au moins un véhicule public
  const categories = allCategories.filter((c) => activeCatIds.includes(c.id));

  // Résolution slug → categoryId via Map (O(1) vs Array.find O(n))
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const categoryId = rawFilters.category ? categoryMap.get(rawFilters.category) : undefined;
  const filters = { ...rawFilters, category: undefined, categoryId };

  // countPublic dédupliqué par React.cache() entre generateMetadata et ici
  const totalCount = await countPublicCached(GARAGE_ID, filters).catch((err) => {
    console.error("[VehiculesPage] countPublic failed:", err);
    return 0;
  });

  const meta = buildPaginationMeta(1, totalCount);

  // listPaginated est délégué à VehicleGridServer (Suspense streaming)
  // → hero + filtres + pagination s'affichent immédiatement
  const jsonLd = buildItemListJsonLd(totalCount);

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

          {totalCount > 0 ? (
            <>
              {/* Grid streamé — la page s'affiche sans attendre listPaginated() */}
              <Suspense fallback={<VehicleGridFallback />}>
                <VehicleGridServer
                  garageId={GARAGE_ID}
                  page={1}
                  filters={filters}
                />
              </Suspense>

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
