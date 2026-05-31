import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const FALLBACK_DISCOUNTS: Record<string, number> = {
      "prod-2": 20,
      "prod-4": 30,
      "prod-1": 15,
    };

    // Map database snake_case structure to AppContext camelCase types
    const mappedProducts = (data || []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      brand: p.brand || "",
      price: Number(p.price),
      category: p.category || "",
      image: p.image || "",
      topNotes: p.top_notes || [],
      heartNotes: p.heart_notes || [],
      baseNotes: p.base_notes || [],
      rating: Number(p.rating),
      reviewsCount: p.reviews_count,
      stock: {
        "50ml": p.stock_50ml,
        "100ml": p.stock_100ml,
      },
      lowStockAlert: p.low_stock_alert,
      discountPercent: Number(p.discount_percent ?? FALLBACK_DISCOUNTS[p.id as string] ?? 0),
    }));

    return NextResponse.json(mappedProducts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const newId = `prod-${Date.now()}`;

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        id: newId,
        name,
        description,
        brand: brand || "",
        price,
        category,
        image,
        top_notes: topNotes || [],
        heart_notes: heartNotes || [],
        base_notes: baseNotes || [],
        rating: 5.0,
        reviews_count: 1,
        stock_50ml: stock?.["50ml"] ?? 15,
        stock_100ml: stock?.["100ml"] ?? 8,
        low_stock_alert: lowStockAlert ?? 5,
        discount_percent: discountPercent ?? 0,
      })
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
      discountPercent: data.discount_percent ?? 0,
    };

    return NextResponse.json(mappedProduct);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
