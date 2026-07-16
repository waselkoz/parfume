import { supabaseAdmin } from "@/lib/supabase";

/**
 * Deducts stock for a given list of order items in the database.
 * Matches by productId if available, otherwise falls back to productName.
 */
export async function deductStockForOrder(items: Record<string, string | number>[]) {
  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    let query = supabaseAdmin.from("products").select("id, variants");
    
    if (item.productId) {
      query = query.eq("id", item.productId);
    } else if (item.productName) {
      query = query.eq("name", item.productName);
    } else {
      continue;
    }

    const { data: product, error } = await query.maybeSingle();

    if (error || !product || !product.variants) {
      console.warn(`[Stock] Could not find product to deduct stock: ${item.productName || item.productId}`);
      continue;
    }

    let stockChanged = false;
    const updatedVariants = (product.variants as Record<string, unknown>[]).map((v: Record<string, unknown>) => {
      if (v.size === item.size) {
        stockChanged = true;
        return { ...v, stock: Math.max(0, Number(v.stock) - Number(item.quantity)) };
      }
      return v;
    });
    
    if (stockChanged) {
      await supabaseAdmin
        .from("products")
        .update({ variants: updatedVariants })
        .eq("id", product.id);
    }
  }
}

/**
 * Restores stock for a given list of order items in the database.
 * Used when an order is cancelled or returned.
 */
export async function restoreStockForOrder(items: Record<string, string | number>[]) {
  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    let query = supabaseAdmin.from("products").select("id, variants");
    
    if (item.productId) {
      query = query.eq("id", item.productId);
    } else if (item.productName) {
      query = query.eq("name", item.productName);
    } else {
      continue;
    }

    const { data: product, error } = await query.maybeSingle();

    if (error || !product || !product.variants) {
      console.warn(`[Stock] Could not find product to restore stock: ${item.productName || item.productId}`);
      continue;
    }

    let stockChanged = false;
    const updatedVariants = (product.variants as Record<string, unknown>[]).map((v: Record<string, unknown>) => {
      if (v.size === item.size) {
        stockChanged = true;
        return { ...v, stock: Number(v.stock) + Number(item.quantity) };
      }
      return v;
    });
    
    if (stockChanged) {
      await supabaseAdmin
        .from("products")
        .update({ variants: updatedVariants })
        .eq("id", product.id);
    }
  }
}
