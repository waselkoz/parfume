import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatchOrderToElogistia } from "@/lib/elogistia";
import { deductStockForOrder } from "@/lib/stock";

// ==============================================================================
// Helper: fire-and-forget dispatch to Elogistia
// Runs after order is saved — never blocks the HTTP response
// ==============================================================================
async function fireAndForgetDeliveryDispatch(
  orderId: string,
  order: Record<string, unknown>
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
    const { id, customerEmail, firstName, lastName, phone, wilaya, residence, items, totalPrice, status, createdAt } = body;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        id,
        customer_email: customerEmail || "",
        first_name: firstName || "",
        last_name: lastName || "",
        phone: phone || "",
        wilaya: wilaya || "",
        residence: residence || "",
        items,
        total_price: totalPrice,
        status: status || "Pending",
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

    // Fire-and-forget: dispatch to Elogistia WITHOUT blocking the HTTP response.
    // If this fails, delivery_status = "pending_sync" — admin can retry from dashboard.
    fireAndForgetDeliveryDispatch(data.id, {
      last_name: data.last_name,
      first_name: data.first_name,
      customer_email: data.customer_email,
      phone: data.phone,
      wilaya: data.wilaya,
      residence: data.residence,
      items: data.items,
      total_price: data.total_price,
    }).catch(() => {/* already handled inside the function */});

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

    if (previousOrder && previousOrder.status !== "Completed" && status === "Completed") {
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
