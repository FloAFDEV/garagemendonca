"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdminClient";
import { SUPABASE_ENABLED } from "@/lib/supabase/readClient";
import { requireAdminForGarage } from "@/lib/auth/getSession";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { logAudit } from "@/lib/audit/logAction";
import { getActiveGarageId } from "@/lib/config/garage";
import { serviceRepository } from "@/lib/repositories/serviceRepository";
import type { Service } from "@/types";

/* ── Reads (remplacent les appels directs du repository depuis les Client Components) ── */

export async function getServicesForAdminAction(): Promise<Service[]> {
  return serviceRepository.getAllForAdmin();
}

export async function getServiceBySlugAction(slug: string): Promise<Service | null> {
  return serviceRepository.getBySlug(slug);
}

async function assertAdmin() {
  await assertSameOrigin();
  const garageId = getActiveGarageId();
  const err = await requireAdminForGarage(garageId);
  if (err) throw new Error(err.message);
}

export async function createServiceAction(
  data: Pick<Service, "title" | "short_description" | "long_description" | "features" | "icon"> & { slug: string },
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis pour créer un service");
    await assertAdmin();
    const garageId = getActiveGarageId();
    const db = createSupabaseAdminClient();

    const { data: row, error } = await db
      .from("services")
      .insert({
        garage_id:         garageId,
        slug:              data.slug,
        title:             data.title,
        short_description: data.short_description,
        long_description:  data.long_description,
        features:          data.features,
        icon:              data.icon,
        is_active:         false,
      })
      .select("slug")
      .single();
    if (error) throw error;

    revalidatePath("/services");
    revalidatePath("/admin/services");
    await logAudit({ action: "create", resourceType: "service", resourceId: row.slug as string });
    return { ok: true, slug: row.slug as string };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteServiceAction(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis pour supprimer un service");
    await assertAdmin();
    const garageId = getActiveGarageId();
    const db = createSupabaseAdminClient();

    const { error } = await db
      .from("services")
      .delete()
      .eq("slug", slug)
      .eq("garage_id", garageId);
    if (error) throw error;

    revalidatePath("/services");
    revalidatePath("/admin/services");
    await logAudit({ action: "delete", resourceType: "service", resourceId: slug });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function reorderServicesAction(
  slugsInOrder: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis");
    await assertAdmin();
    const garageId = getActiveGarageId();
    const db = createSupabaseAdminClient();

    await Promise.all(
      slugsInOrder.map((slug, i) =>
        db.from("services")
          .update({ sort_order: i + 1 })
          .eq("slug", slug)
          .eq("garage_id", garageId),
      ),
    );

    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateServiceAction(
  slug: string,
  data: Partial<Service>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!SUPABASE_ENABLED) throw new Error("Supabase requis pour modifier un service");
    await assertAdmin();
    const garageId = getActiveGarageId();
    const db = createSupabaseAdminClient();

    // ── Core fields ────────────────────────────────────────────────
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.title !== undefined)             patch.title = data.title;
    if (data.short_description !== undefined) patch.short_description = data.short_description;
    if (data.long_description !== undefined)  patch.long_description = data.long_description;
    if (data.features !== undefined)          patch.features = data.features;
    if (data.is_active !== undefined)         patch.is_active = data.is_active;
    if (data.order !== undefined)             patch.sort_order = data.order;

    const { data: svcRow, error: updateErr } = await db
      .from("services")
      .update(patch)
      .eq("slug", slug)
      .eq("garage_id", garageId)
      .select("id")
      .maybeSingle();
    if (updateErr) throw updateErr;

    const serviceId = svcRow?.id as string | undefined;

    // ── Images (storage_path = source of truth) ────────────────────
    if (data.images !== undefined && serviceId) {
      await db.from("service_images").delete().eq("service_id", serviceId);
      if (data.images.length > 0) {
        const { error: imgErr } = await db.from("service_images").insert(
          data.images.map((img, i) => ({
            service_id:   serviceId,
            garage_id:    garageId,
            url:          img.url ?? "",
            storage_path: img.storage_path ?? null,
            alt:          img.alt ?? null,
            is_primary:   img.is_primary ?? i === 0,
            sort_order:   i,
          })),
        );
        if (imgErr) throw imgErr;
      }
    }

    // ── Steps (relational table — mapper priority) ─────────────────
    if (data.steps !== undefined && serviceId) {
      await db.from("service_steps").delete().eq("service_id", serviceId);
      const validSteps = (data.steps ?? []).filter((s) => s.title.trim());
      if (validSteps.length > 0) {
        const { error: stepsErr } = await db.from("service_steps").insert(
          validSteps.map((s, i) => ({
            service_id:  serviceId,
            garage_id:   garageId,
            sort_order:  i + 1,
            title:       s.title,
            description: s.description ?? "",
          })),
        );
        if (stepsErr) throw stepsErr;
      }
    }

    // ── Pricing (relational table) ─────────────────────────────────
    if (data.pricing !== undefined && serviceId) {
      await db.from("service_pricing").delete().eq("service_id", serviceId);
      const validPricing = (data.pricing ?? []).filter((p) => p.label.trim() && p.price.trim());
      if (validPricing.length > 0) {
        const { error: priceErr } = await db.from("service_pricing").insert(
          validPricing.map((p, i) => ({
            service_id: serviceId,
            garage_id:  garageId,
            sort_order: i + 1,
            label:      p.label,
            price:      p.price,
            note:       p.note ?? null,
          })),
        );
        if (priceErr) throw priceErr;
      }
    }

    // ── FAQ (relational table) ─────────────────────────────────────
    if (data.faq !== undefined && serviceId) {
      await db.from("service_faq").delete().eq("service_id", serviceId);
      const validFaq = (data.faq ?? []).filter((f) => f.question.trim() && f.answer.trim());
      if (validFaq.length > 0) {
        const { error: faqErr } = await db.from("service_faq").insert(
          validFaq.map((f, i) => ({
            service_id: serviceId,
            garage_id:  garageId,
            sort_order: i + 1,
            question:   f.question,
            answer:     f.answer,
          })),
        );
        if (faqErr) throw faqErr;
      }
    }

    // ── Testimonials (relational table) ───────────────────────────
    if (data.testimonials !== undefined && serviceId) {
      await db.from("testimonials").delete().eq("service_id", serviceId);
      const validTestimonials = (data.testimonials ?? []).filter(
        (t) => t.author.trim() && t.content.trim(),
      );
      if (validTestimonials.length > 0) {
        const { error: testimonialsErr } = await db.from("testimonials").insert(
          validTestimonials.map((t, i) => ({
            service_id:  serviceId,
            garage_id:   garageId,
            sort_order:  i + 1,
            author:      t.author,
            location:    t.location ?? "",
            date_label:  t.date ?? "",
            rating:      t.rating ?? 5,
            comment:     t.content,
            is_active:   true,
          })),
        );
        if (testimonialsErr) throw testimonialsErr;
      }
    }

    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
