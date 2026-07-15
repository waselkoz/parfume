import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatchOrderToElogistia } from "@/lib/elogistia";
import { deductStockForOrder, restoreStockForOrder } from "@/lib/stock";

export const dynamic = 'force-dynamic';

// ==============================================================================
// Helper: fire-and-forget dispatch to Elogistia
// Runs after order is saved — never blocks the HTTP response
// ==============================================================================
async function fireAndForgetDeliveryDispatch(
  orderId: string,
  order: Record<string, unknown>,
  stopDesk: boolean = false
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = Array.isArray(order.items) ? (order.items as any[]) : [];
    const products = items.map((item) => ({
      // Include size + qty so the courier sees e.g. "Sauvage 100ml x2" when calling the client
      name: `${item.name || item.productName || "Parfum"} ${item.size || ""} x${item.quantity || 1}`.trim().substring(0, 50),
      price: Number(item.price || 0),
    }));
    if (products.length === 0) products.push({ name: "Parfum x1", price: Number(order.total_price) });

    const result = await dispatchOrderToElogistia({
      orderId,
      lastName: String(order.last_name || "Client"),
      firstName: String(order.first_name || ""),
      email: String(order.customer_email || ""),
      phone: String(order.phone || "0550000000"),
      address: String(order.residence || order.wilaya || ""),
      commune: String(order.residence || "ALGER CENTRE"),
      wilaya: String(order.wilaya || "Alger"),
      products,
      totalPrice: Number(order.total_price),
      stopDesk,
      // remarque is built inside dispatchOrderToElogistia with full order summary
    });

    if (result.success) {
      await supabaseAdmin
        .from("orders")
        .update({
          delivery_status: "dispatched",
          tracking_id: result.trackingId,
          elogistia_tracking: result.trackingId,
          delivery_notes: `Dispatched. Tracking: ${result.trackingId}. Frais: ${result.fraisLivraison} DZD`,
        })
        .eq("id", orderId);
    } else {
      await supabaseAdmin
        .from("orders")
        .update({
          delivery_status: "pending_sync",
          delivery_notes: `Dispatch failed: ${result.error}`,
        })
        .eq("id", orderId);
    }
  } catch (err) {
    // Log but never throw — the order already succeeded, only delivery sync failed
    console.error("[Elogistia] Fire-and-forget dispatch error:", err);
    try {
      await supabaseAdmin
        .from("orders")
        .update({ delivery_status: "pending_sync", delivery_notes: "Dispatch exception — will retry" })
        .eq("id", orderId);
    } catch {
      // Silently ignore secondary failure
    }
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("db_created_at", { ascending: false });

    if (error) throw error;

    // Map snake_case db columns to camelCase expected by the React frontend
    const mappedOrders = (data || []).map((o: Record<string, unknown>) => ({
      id: o.id,
      customerEmail: o.customer_email,
      firstName: o.first_name || "",
      lastName: o.last_name || "",
      phone: o.phone || "",
      wilaya: o.wilaya || "",
      residence: o.residence || "",
      items: o.items,
      totalPrice: Number(o.total_price),
      createdAt: o.created_at,
      status: o.status,
      // Delivery fields
      trackingId: o.tracking_id || null,
      deliveryStatus: o.delivery_status || "not_dispatched",
    }));

    return NextResponse.json(mappedOrders);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, customerEmail, firstName, lastName, phone, wilaya, residence, items, createdAt, stopDesk } = body;

    const safeFirstName = String(firstName || "").substring(0, 100);
    const safeLastName = String(lastName || "").substring(0, 100);
    const safePhone = String(phone || "").substring(0, 50);
    const safeWilaya = String(wilaya || "").substring(0, 100);
    const safeResidence = String(residence || "").substring(0, 255);
    const safeCustomerEmail = String(customerEmail || "").substring(0, 255);

    // 1. Fetch real prices from database
    let realTotalPrice = 0;
    const FALLBACK_DISCOUNTS: Record<string, number> = {
      "prod-2": 20,
      "prod-4": 30,
      "prod-1": 15,
    };

    // 0. Aggregate duplicate items to prevent stock bypass exploits
    const aggregatedItemsMap = new Map<string, any>();
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.productId || !item.size) continue;
        const key = `${item.productId}-${item.size}`;
        if (aggregatedItemsMap.has(key)) {
          aggregatedItemsMap.get(key).quantity += item.quantity || 1;
        } else {
          aggregatedItemsMap.set(key, { ...item, quantity: item.quantity || 1 });
        }
      }
    }
    const aggregatedItems = Array.from(aggregatedItemsMap.values());

    if (aggregatedItems.length > 0) {
      const productIds = aggregatedItems.map((item: any) => item.productId);
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from("products")
        .select("id, variants, discount_percent")
        .in("id", productIds);

      if (!productsError && productsData) {
        const productsMap = new Map(productsData.map((p: any) => [p.id, p]));
        for (const item of aggregatedItems) {
          const product = productsMap.get(item.productId);
          if (product && product.variants) {
            const variant = product.variants.find((v: any) => v.size === item.size);
            if (typeof item.quantity !== "number" || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
              return NextResponse.json({ error: `Quantité invalide pour le produit ${product.name || "sélectionné"}.` }, { status: 400 });
            }
            if (!variant || variant.stock < item.quantity) {
              return NextResponse.json({ error: `Le produit ${product.name || "sélectionné"} n'a pas assez de stock pour la taille ${item.size}.` }, { status: 400 });
            }
            const discount = Number(product.discount_percent ?? FALLBACK_DISCOUNTS[product.id] ?? 0);
            const discountedPrice = discount > 0 ? variant.price * (1 - discount / 100) : variant.price;
            realTotalPrice += discountedPrice * item.quantity;
          } else {
            return NextResponse.json({ error: `Produit introuvable.` }, { status: 400 });
          }
        }
      } else {
        return NextResponse.json({ error: `Erreur lors de la vérification des produits.` }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: `Aucun article dans la commande.` }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        id,
        customer_email: safeCustomerEmail,
        first_name: safeFirstName,
        last_name: safeLastName,
        phone: safePhone,
        wilaya: safeWilaya,
        residence: safeResidence,
        items: aggregatedItems,
        total_price: realTotalPrice,
        status: "Pending", // Always force to Pending on creation
        created_at: createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error("[Orders POST] Supabase insert error:", JSON.stringify(error));
      throw new Error(error.message || JSON.stringify(error));
    }

    const mappedOrder = {
      id: data.id,
      customerEmail: data.customer_email,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      wilaya: data.wilaya,
      residence: data.residence,
      items: data.items,
      totalPrice: Number(data.total_price),
      createdAt: data.created_at,
      status: data.status,
      deliveryStatus: "not_dispatched",
      trackingId: null as string | null,
    };

    // Immediately deduct stock for this successful order to prevent double-selling
    await deductStockForOrder(data.items);

    // Fire-and-forget: dispatch to Elogistia WITHOUT blocking the HTTP response.
    // If this fails, delivery_status = "pending_sync" — admin can retry from dashboard.
    fireAndForgetDeliveryDispatch(data.id, {
      last_name: safeLastName,
      first_name: safeFirstName,
      customer_email: safeCustomerEmail,
      phone: safePhone,
      wilaya: safeWilaya,
      residence: safeResidence,
      items: data.items,
      total_price: data.total_price,
    }, stopDesk).catch(() => {/* already handled inside the function */});

    return NextResponse.json(mappedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[Orders POST] Caught error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const { data: previousOrder } = await supabaseAdmin
      .from("orders")
      .select("status, items")
      .eq("id", id)
      .single();

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Refund stock if order is cancelled or returned
    const isNowCancelled = status === "annulee" || status === "retour" || status === "Cancelled" || status === "Returned";
    const wasCancelled = previousOrder && (previousOrder.status === "annulee" || previousOrder.status === "retour" || previousOrder.status === "Cancelled" || previousOrder.status === "Returned");
    
    if (previousOrder && isNowCancelled && !wasCancelled) {
      await restoreStockForOrder(data.items);
    } else if (previousOrder && !isNowCancelled && wasCancelled) {
      // Deduct stock if order is un-cancelled (moved back to Pending/Shipped/Completed)
      await deductStockForOrder(data.items);
    }

    const mappedOrder = {
      id: data.id,
      customerEmail: data.customer_email,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      wilaya: data.wilaya,
      residence: data.residence,
      items: data.items,
      totalPrice: Number(data.total_price),
      createdAt: data.created_at,
      status: data.status,
    };

    return NextResponse.json(mappedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
