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
      price,
      category,
      image,
      topNotes,
      heartNotes,
      baseNotes,
      stock,
      lowStockAlert,
      discountPercent,
    } = body;

    // Map the incoming payload to matches the database columns
    const updatePayload: Record<string, unknown> = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (brand !== undefined) updatePayload.brand = brand;
    if (price !== undefined) updatePayload.price = price;
    if (category !== undefined) updatePayload.category = category;
    if (image !== undefined) updatePayload.image = image;
    if (topNotes !== undefined) updatePayload.top_notes = topNotes;
    if (heartNotes !== undefined) updatePayload.heart_notes = heartNotes;
    if (baseNotes !== undefined) updatePayload.base_notes = baseNotes;
    if (stock?.["50ml"] !== undefined) updatePayload.stock_50ml = stock["50ml"];
    if (stock?.["100ml"] !== undefined) updatePayload.stock_100ml = stock["100ml"];
    if (lowStockAlert !== undefined) updatePayload.low_stock_alert = lowStockAlert;
    if (discountPercent !== undefined) updatePayload.discount_percent = discountPercent;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const mappedProduct = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      brand: data.brand || "",
      price: Number(data.price),
      category: data.category || "",
      image: data.image || "",
      topNotes: data.top_notes || [],
      heartNotes: data.heart_notes || [],
      baseNotes: data.base_notes || [],
      rating: Number(data.rating),
      reviewsCount: data.reviews_count,
      stock: {
        "50ml": data.stock_50ml,
        "100ml": data.stock_100ml,
      },
      lowStockAlert: data.low_stock_alert,
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
