import { NextRequest, NextResponse } from "next/server";
import { vehicleDb } from "@/lib/db/vehicle.repository";
import { getActiveGarageId } from "@/lib/config/garage";

// Champs allégés pour la réponse search (pas besoin du full Vehicle)
type SearchHit = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  mileage: number;
  slug: string | undefined;
  thumbnailUrl: string | undefined;
  status: string;
  finition: string | undefined;
  categories: string[];
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ vehicles: [] });
  }

  if (q.length > 120) {
    return NextResponse.json({ error: "Query trop longue" }, { status: 400 });
  }

  const garageId = getActiveGarageId();
  if (!garageId) {
    return NextResponse.json({ error: "Garage non configuré" }, { status: 500 });
  }

  try {
    const vehicles = await vehicleDb.listPaginated(garageId, 1, 8, {
      search: q,
    });

    const hits: SearchHit[] = vehicles.map((v) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      year: v.year,
      price: v.price,
      fuel: v.fuel,
      mileage: v.mileage,
      slug: v.slug,
      thumbnailUrl: v.thumbnailUrl,
      status: v.status ?? "published",
      categories: v.categories ?? [],
      finition:
        v.features?.finition ??
        (v.features as Record<string, unknown> | undefined)?.["Finition"] as
          | string
          | undefined,
    }));

    return NextResponse.json(
      { vehicles: hits },
      {
        headers: {
          // 30 s frais, jusqu'à 60 s en stale-while-revalidate
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("[/api/vehicles/search]", err);
    return NextResponse.json({ error: "Erreur de recherche" }, { status: 500 });
  }
}
