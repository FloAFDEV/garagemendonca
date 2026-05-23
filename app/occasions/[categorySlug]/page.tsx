import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Car, ChevronLeft, ChevronRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import VehicleCard from "@/components/vehicles/VehicleCard";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { vehicleCategoryRepository } from "@/lib/repositories/vehicleCategoryRepository";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { buildPaginationMeta, paginationRange, VEHICLES_PER_PAGE } from "@/lib/vehicles/pagination";
import { getActiveGarageId } from "@/lib/config/garage";
import { resolveVehicleHref } from "@/lib/utils/slug";

const GARAGE_ID = getActiveGarageId();
const BASE_URL  = "https://www.garagemendonca.com";

type Props = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// ─── Static params ────────────────────────────────────────────────

export async function generateStaticParams() {
  const categories = await vehicleCategoryRepository.getAll(GARAGE_ID).catch(() => []);
  return categories.map((cat) => ({ categorySlug: cat.slug }));
}

// ─── Metadata ────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await vehicleCategoryRepository.getBySlug(GARAGE_ID, categorySlug).catch(() => null);
  if (!category) return { title: "Catégorie introuvable" };

  const totalCount = await vehicleDb.countPublic(GARAGE_ID, { category: category.slug }).catch(() => 0);

  const title       = `${category.label} d'occasion — Garage Mendonça · Drémil-Lafage`;
  const description = `Découvrez nos ${totalCount} ${category.label.toLowerCase()} d'occasion révisés et garantis au Garage Mendonça (Drémil-Lafage, 31). Inspection 160 points, garantie 6 à 12 mois, financement personnalisé.`;
  const url         = `${BASE_URL}/occasions/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type:     "website",
      locale:   "fr_FR",
      siteName: "Garage Auto Mendonca",
      images: [{ url: "/images/og-image.webp", width: 1200, height: 630, alt: `${category.label} Garage Mendonca` }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ─── Pagination nav ───────────────────────────────────────────────

function PaginationNav({
  meta,
  categorySlug,
}: {
  meta: ReturnType<typeof buildPaginationMeta>;
  categorySlug: string;
}) {
  const { page, totalPages, hasNext, hasPrev } = meta;
  const range = paginationRange(page, totalPages);
  const pageHref = (p: number) =>
    p === 1 ? `/occasions/${categorySlug}` : `/occasions/${categorySlug}?page=${p}`;

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

// ─── Page ─────────────────────────────────────────────────────────

export default async function OccasionsCategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const [category, allCategories] = await Promise.all([
    vehicleCategoryRepository.getBySlug(GARAGE_ID, categorySlug).catch(() => null),
    vehicleCategoryRepository.getAll(GARAGE_ID).catch(() => []),
  ]);

  if (!category) notFound();

  // Filtre par category_id (source de vérité) — fall back sur slug TEXT[] si nécessaire
  const filters = { categoryId: category.id };

  const [vehicles, totalCount] = await Promise.all([
    vehicleDb.listPaginated(GARAGE_ID, pageNum, VEHICLES_PER_PAGE, filters).catch(() => []),
    vehicleDb.countPublic(GARAGE_ID, filters).catch(() => 0),
  ]);

  const meta = buildPaginationMeta(pageNum, totalCount);
  if (pageNum > meta.totalPages && meta.totalPages > 0) notFound();

  const otherCategories = allCategories.filter((c) => c.slug !== category.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    name:       `${category.label} d'occasion — Garage Mendonça`,
    url:        `${BASE_URL}/occasions/${category.slug}`,
    description: `Catalogue de ${category.label.toLowerCase()} d'occasion révisés et garantis`,
    numberOfItems: totalCount,
    itemListElement: vehicles.map((v, i) => ({
      "@type": "ListItem",
      position: (pageNum - 1) * VEHICLES_PER_PAGE + i + 1,
      url: `${BASE_URL}${resolveVehicleHref(v)}`,
      name: `${v.brand} ${v.model} ${v.year}`,
    })),
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="bg-[#0f172a] pt-24 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <Container className="relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Accueil</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/occasions" className="hover:text-brand-400 transition-colors">Occasions</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-medium">{category.label}</li>
            </ol>
          </nav>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-brand-500" aria-hidden="true" />
              <span className="text-brand-400 text-xs uppercase tracking-caps font-normal">
                {totalCount} véhicule{totalCount !== 1 ? "s" : ""}
                {meta.totalPages > 1 && ` · page ${pageNum}/${meta.totalPages}`}
              </span>
            </div>
            <h1 className="ty-display text-white text-4xl sm:text-5xl md:text-6xl mb-5">
              {category.icon && <span className="mr-3" aria-hidden="true">{category.icon}</span>}
              {category.label}{" "}
              <span className="text-brand-500">d&apos;occasion</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-8">
              {totalCount > 0
                ? `${totalCount} ${category.label.toLowerCase()} disponible${totalCount !== 1 ? "s" : ""}, révisé${totalCount !== 1 ? "s" : ""} et garanti${totalCount !== 1 ? "s" : ""} par nos mécaniciens. Inspection en 160 points, garantie 6 à 12 mois, financement et reprise étudiés.`
                : `Aucun véhicule disponible dans cette catégorie pour le moment. Consultez notre stock complet ou contactez-nous.`
              }
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/vehicules" className="btn-primary text-base py-3.5 px-8 inline-flex items-center gap-2">
                <Car size={17} aria-hidden="true" />
                Voir tout le stock
              </Link>
              <Link href="/occasions" className="btn-outline text-base py-3.5 px-8 inline-flex items-center gap-2">
                Toutes les catégories
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Filtre catégories ── (uniquement si plusieurs catégories actives) */}
      {allCategories.length > 1 && (
        <div className="border-b border-slate-200 bg-white">
          <Container>
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto">
              <Link
                href="/occasions"
                className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Toutes les catégories
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/occasions/${cat.slug}`}
                  aria-current={cat.slug === categorySlug ? "page" : undefined}
                  className={
                    cat.slug === categorySlug
                      ? "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-600 text-white whitespace-nowrap"
                      : "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
                  }
                >
                  {cat.icon && <span className="mr-1" aria-hidden="true">{cat.icon}</span>}
                  {cat.label}
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* ── Listing ── */}
      <section className="py-12 bg-[#f8fafc]">
        <Container>
          {vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {vehicles.map((vehicle, i) =>
                  i < 4 ? (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} priority />
                  ) : (
                    <AnimateOnScroll key={vehicle.id} delay={(i - 4) * 60}>
                      <VehicleCard vehicle={vehicle} />
                    </AnimateOnScroll>
                  )
                )}
              </div>
              <PaginationNav meta={meta} categorySlug={category.slug} />
              {/* Breadcrumb SEO */}
              <nav aria-label="Fil d'Ariane" className="mt-8 text-center text-xs text-slate-400">
                <Link href="/" className="hover:text-slate-600">Accueil</Link>
                {" › "}
                <Link href="/occasions" className="hover:text-slate-600">Occasions</Link>
                {" › "}
                <span aria-current="page">{category.label}</span>
              </nav>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg mb-2">Aucun véhicule dans cette catégorie pour le moment.</p>
              <p className="text-sm mb-6">Consultez notre stock complet ou revenez bientôt.</p>
              <Link href="/vehicules" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                Voir tous les véhicules
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* ── Autres catégories ── */}
      {otherCategories.length > 0 && (
        <section className="py-14 bg-white border-t border-slate-100">
          <Container>
            <div className="mb-8">
              <div className="section-divider" />
              <span className="eyebrow">Explorer aussi</span>
              <h2 className="section-title">
                Autres <span className="text-brand-500">catégories</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/occasions/${cat.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl border border-slate-100 bg-[#f8fafc] hover:border-brand-200 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  {cat.icon ? (
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                      {cat.icon}
                    </span>
                  ) : (
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-brand-50 text-brand-500 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                      <Car size={18} />
                    </span>
                  )}
                  <span className="font-heading font-semibold text-[#0f172a] text-sm group-hover:text-brand-600 transition-colors">
                    {cat.label}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-brand-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir <ArrowRight size={11} />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-14 bg-[#0f172a] relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600" aria-hidden="true" />
        <Container className="text-center">
          <h2 className="ty-display text-white text-3xl md:text-4xl mb-4">
            Une question sur un véhicule ?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Contactez-nous pour un essai, un financement ou une reprise. Réponse sous 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0532002038" className="btn-primary text-base py-4 px-8">
              05 32 00 20 38
            </a>
            <Link href="/contact" className="btn-outline text-base py-4 px-8">
              Demander des infos
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
