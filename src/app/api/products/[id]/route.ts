import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const {
      name,
      description,
      brand,
      category,
      image,
      topNotes,
      heartNotes,
      baseNotes,
      variants,
      translations,
      lowStockAlert,
      discountPercent,
      isTendance,
      isBestSeller,
      hoverImage,
    } = body;

    // Map the incoming payload to matches the database columns
    const updatePayload: Record<string, unknown> = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (brand !== undefined) updatePayload.brand = brand;
    if (category !== undefined) updatePayload.category = category;
    if (image !== undefined) updatePayload.image = image;
    if (topNotes !== undefined) updatePayload.top_notes = topNotes;
    if (heartNotes !== undefined) updatePayload.heart_notes = heartNotes;
    if (baseNotes !== undefined) updatePayload.base_notes = baseNotes;
    if (variants !== undefined) updatePayload.variants = variants;
    if (translations !== undefined) updatePayload.translations = translations;
    if (lowStockAlert !== undefined) updatePayload.low_stock_alert = lowStockAlert;
    if (discountPercent !== undefined) updatePayload.discount_percent = discountPercent;
    if (isTendance !== undefined) updatePayload.is_tendance = isTendance;
    if (isBestSeller !== undefined) updatePayload.is_best_seller = isBestSeller;
    if (hoverImage !== undefined) updatePayload.hover_image = hoverImage;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const FALLBACK_DISCOUNTS: Record<string, number> = {
      "prod-2": 20,
      "prod-4": 30,
      "prod-1": 15,
    };

    const mappedProduct = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      brand: data.brand || "",
      category: data.category || "",
      image: data.image || "",
      topNotes: data.top_notes || [],
      heartNotes: data.heart_notes || [],
      baseNotes: data.base_notes || [],
      rating: Number(data.rating),
      reviewsCount: data.reviews_count,
      variants: data.variants || [],
      translations: data.translations || { en: { name: "", description: "" }, ar: { name: "", description: "" } },
      lowStockAlert: data.low_stock_alert,
      discountPercent: Number(data.discount_percent ?? FALLBACK_DISCOUNTS[data.id as string] ?? 0),
      isTendance: Boolean(data.is_tendance),
      isBestSeller: Boolean(data.is_best_seller),
      hoverImage: data.hover_image,
    };

    return NextResponse.json(mappedProduct);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
