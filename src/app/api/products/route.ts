import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

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
      category: p.category || "",
      image: p.image || "",
      topNotes: p.top_notes || [],
      heartNotes: p.heart_notes || [],
      baseNotes: p.base_notes || [],
      rating: Number(p.rating),
      reviewsCount: p.reviews_count,
      variants: p.variants || [],
      translations: p.translations || { en: { name: "", description: "" }, ar: { name: "", description: "" } },
      lowStockAlert: p.low_stock_alert,
      discountPercent: Number(p.discount_percent ?? FALLBACK_DISCOUNTS[p.id as string] ?? 0),
      isTendance: Boolean(p.is_tendance),
      isBestSeller: Boolean(p.is_best_seller),
      hoverImage: p.hover_image,
    }));

    return NextResponse.json(mappedProducts, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    });
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

    const newId = `prod-${Date.now()}`;

    // Auto-create category if it doesn't exist to prevent FK constraint errors
    if (category) {
      const { data: existingCat } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('name', category)
        .single();
        
      if (!existingCat) {
        await supabaseAdmin.from('categories').insert({
          id: `cat-auto-${Date.now()}`,
          name: category,
          description: "",
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        id: newId,
        name,
        description,
        brand: brand || "",
        category,
        image,
        top_notes: topNotes || [],
        heart_notes: heartNotes || [],
        base_notes: baseNotes || [],
        rating: 5.0,
        reviews_count: 1,
        variants: variants || [],
        translations: translations || { en: { name: "", description: "" }, ar: { name: "", description: "" } },
        low_stock_alert: lowStockAlert || 10,
        discount_percent: discountPercent || 0,
        is_tendance: isTendance || false,
        is_best_seller: isBestSeller || false,
        hover_image: hoverImage || null,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/api/products');

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
      translations: data.translations || {},
      lowStockAlert: data.low_stock_alert,
      discountPercent: data.discount_percent ?? 0,
      isTendance: data.is_tendance,
      isBestSeller: data.is_best_seller,
      hoverImage: data.hover_image,
    };

    return NextResponse.json(mappedProduct);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.topNotes !== undefined) dbUpdates.top_notes = updates.topNotes;
    if (updates.heartNotes !== undefined) dbUpdates.heart_notes = updates.heartNotes;
    if (updates.baseNotes !== undefined) dbUpdates.base_notes = updates.baseNotes;
    if (updates.variants !== undefined) dbUpdates.variants = updates.variants;
    if (updates.translations !== undefined) dbUpdates.translations = updates.translations;
    if (updates.lowStockAlert !== undefined) dbUpdates.low_stock_alert = updates.lowStockAlert;
    if (updates.discountPercent !== undefined) dbUpdates.discount_percent = updates.discountPercent;
    if (updates.isTendance !== undefined) dbUpdates.is_tendance = updates.isTendance;
    if (updates.isBestSeller !== undefined) dbUpdates.is_best_seller = updates.isBestSeller;
    if (updates.hoverImage !== undefined) dbUpdates.hover_image = updates.hoverImage;

    // Auto-create category if it doesn't exist to prevent FK constraint errors
    if (updates.category) {
      const { data: existingCat } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('name', updates.category)
        .single();
        
      if (!existingCat) {
        await supabaseAdmin.from('categories').insert({
          id: `cat-auto-${Date.now()}`,
          name: updates.category,
          description: "",
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/api/products');
    
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
      translations: data.translations || {},
      lowStockAlert: data.low_stock_alert,
      discountPercent: data.discount_percent ?? 0,
      isTendance: data.is_tendance,
      isBestSeller: data.is_best_seller,
      hoverImage: data.hover_image,
    };

    return NextResponse.json(mappedProduct);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/api/products');
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
