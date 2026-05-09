/**
 * Mappers Supabase → TypeScript
 *
 * Transforment les lignes snake_case retournées par Supabase
 * en interfaces camelCase définies dans types/index.ts.
 */

import type {
  Vehicle,
  Service,
  ServiceImage,
  ServiceStep,
  ServicePricing,
  ServiceFAQItem,
  ServiceTestimonial,
  Banner,
  VehicleCategory,
} from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapVehicle(row: any): Vehicle {
  return {
    id: row.id,
    garageId: row.garage_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    fuel: row.fuel,
    transmission: row.transmission,
    power: row.power,
    price: row.price,
    color: row.color,
    doors: row.doors,
    critAir: row.crit_air ?? undefined,
    description: row.description ?? "",
    images: row.images ?? [],
    thumbnailUrl: row.thumbnail_url ?? undefined,
    status: row.status,
    published_at: row.published_at ?? undefined,
    sold_at: row.sold_at ?? undefined,
    featured: row.featured ?? false,
    featuredOrder: row.featured_order ?? undefined,
    categories: row.categories ?? [],
    slug:             row.slug ?? undefined,
    meta_description: row.meta_description ?? undefined,
    features: row.features ?? {},
    options: row.options ?? {},
    export_leboncoin: row.export_leboncoin ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServiceImage(img: any): ServiceImage {
  return {
    id: img.id,
    service_id: img.service_id,
    garage_id: img.garage_id,
    url: img.url,
    alt: img.alt ?? undefined,
    order: img.sort_order ?? img.order ?? 0,
    is_primary: img.is_primary ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapService(row: any): Service {
  const images: ServiceImage[] = (row.service_images ?? []).map(mapServiceImage);

  // Steps — table relationnelle (007) en priorité, JSONB en fallback
  const steps: ServiceStep[] = row.service_steps?.length
    ? [...(row.service_steps as any[])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((s): ServiceStep => ({ order: s.sort_order, title: s.title, description: s.description }))
    : (row.steps ?? []);

  // Pricing — table relationnelle (007) en priorité, JSONB en fallback
  const pricing: ServicePricing[] = row.service_pricing?.length
    ? [...(row.service_pricing as any[])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((p): ServicePricing => ({ label: p.label, price: p.price, note: p.note ?? undefined }))
    : (row.pricing ?? []);

  // FAQ — table relationnelle (007) en priorité, JSONB en fallback
  const faq: ServiceFAQItem[] = row.service_faq?.length
    ? [...(row.service_faq as any[])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((f): ServiceFAQItem => ({ question: f.question, answer: f.answer }))
    : (row.faq ?? []);

  // Testimonials — table testimonials (service_id FK, migration 007) en priorité, JSONB en fallback
  // _testimonials est injecté par le repository après un fetch groupé
  const testimonials: ServiceTestimonial[] = (row._testimonials as any[])?.length
    ? (row._testimonials as any[]).map((t): ServiceTestimonial => ({
        author:   t.author,
        location: t.location ?? "",
        date:     t.date_label,
        rating:   t.rating,
        content:  t.comment,
      }))
    : (row.testimonials ?? []);

  return {
    id:                row.id,
    garage_id:         row.garage_id ?? undefined,
    slug:              row.slug,
    order:             row.sort_order ?? undefined,
    title:             row.title,
    icon:              row.icon ?? "wrench",
    short_description: row.short_description ?? "",
    long_description:  row.long_description ?? "",
    features:          row.features ?? [],
    steps,
    pricing,
    faq,
    testimonials,
    images,
    is_active:         row.is_active ?? true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBanner(row: any): Banner {
  return {
    id: row.id,
    garage_id: row.garage_id ?? undefined,
    is_active: row.is_active,
    message: row.message,
    sub_message: row.sub_message ?? undefined,
    image_url: row.image_url ?? undefined,
    cta_label: row.cta_label ?? undefined,
    cta_url: row.cta_url ?? undefined,
    bg_color: row.bg_color,
    scheduled_start: row.scheduled_start ?? undefined,
    scheduled_end: row.scheduled_end ?? undefined,
    display_pages: row.display_pages ?? "all",
    is_dismissible: row.is_dismissible ?? true,
    updated_at: row.updated_at ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapVehicleCategory(row: any): VehicleCategory {
  return {
    id: row.id,
    garage_id: row.garage_id,
    slug: row.slug,
    label: row.label,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    description: row.description ?? undefined,
    sort_order: row.sort_order ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
