import { supabase } from "@/lib/supabase";

export async function getInitialProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];

    const FALLBACK_DISCOUNTS: Record<string, number> = {
      "prod-2": 20,
      "prod-4": 30,
      "prod-1": 15,
    };

    return (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: p.name as string,
      description: (p.description || "") as string,
      brand: (p.brand || "") as string,
      category: (p.category || "") as string,
      image: (p.image || "") as string,
      topNotes: (p.top_notes || []) as string[],
      heartNotes: (p.heart_notes || []) as string[],
      baseNotes: (p.base_notes || []) as string[],
      rating: Number(p.rating),
      reviewsCount: p.reviews_count as number,
      variants: (p.variants || []) as { size: string; price: number; stock: number }[],
      translations: (p.translations || { en: { name: "", description: "" }, ar: { name: "", description: "" } }) as Record<string, { name: string; description: string }>,
      lowStockAlert: p.low_stock_alert as number,
      discountPercent: Number(p.discount_percent ?? FALLBACK_DISCOUNTS[p.id as string] ?? 0),
      isTendance: Boolean(p.is_tendance),
      isBestSeller: Boolean(p.is_best_seller),
      hoverImage: p.hover_image as string | undefined,
    }));
  } catch {
    return [];
  }
}

export async function getInitialCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: c.name as string,
      description: (c.description || "") as string,
      image: (c.image || null) as string | null,
      translations: (c.translations || {}) as Record<string, { name: string; description: string }>,
    }));
  } catch {
    return [];
  }
}

export async function getInitialBrands() {
  try {
    const { data, error } = await supabase
      .from("marques")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data || []).map((b: Record<string, unknown>) => ({
      id: b.id as string,
      name: b.name as string,
      logo: b.logo as string,
    }));
  } catch {
    return [];
  }
}
