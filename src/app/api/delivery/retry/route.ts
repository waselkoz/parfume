// ==============================================================================
// src/app/api/delivery/retry/route.ts
// SERVER-SIDE ONLY — retries failed Elogistia dispatch for pending_sync orders
// Called by admin via the dashboard "Retry Failed Dispatches" button
// ==============================================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatchOrderToElogistia } from "@/lib/elogistia";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Find all orders with failed dispatch
    const { data: pendingOrders, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("delivery_status", "pending_sync")
      .order("db_created_at", { ascending: true })
      .limit(20); // Process max 20 at a time to respect 100 req/min rate limit

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ message: "No pending orders to retry", retried: 0 });
    }

    const results: Array<{
      orderId: string;
      success: boolean;
      trackingId?: string;
      error?: string;
    }> = [];

    for (const order of pendingOrders) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] = Array.isArray(order.items) ? order.items : [];
      const products = items.map((item) => ({
        name: `${item.name || item.productName || "Parfum"} ${item.size || ""} x${item.quantity || 1}`.trim().substring(0, 50),
        price: Number(item.price || 0),
      }));

      if (products.length === 0) {
        products.push({ name: "Parfum x1", price: Number(order.total_price) });
      }

      const result = await dispatchOrderToElogistia({
        orderId: order.id,
        lastName: order.last_name || "Client",
        firstName: order.first_name || "",
        email: order.customer_email || "",
        phone: order.phone || "0550000000",
        address: order.residence || order.wilaya || "",
        commune: order.residence || "ALGER CENTRE",
        wilaya: order.wilaya || "Alger",
        products,
        totalPrice: Number(order.total_price),
        remarque: `Commande #${order.id} — Retry — Parfum fragile`,
      });

      if (result.success) {
        await supabaseAdmin
          .from("orders")
          .update({
            delivery_status: "dispatched",
            tracking_id: result.trackingId,
            elogistia_tracking: result.trackingId,
            delivery_notes: `Retry succeeded. Tracking: ${result.trackingId}. Frais: ${result.fraisLivraison} DZD`,
          })
          .eq("id", order.id);

        results.push({ orderId: order.id, success: true, trackingId: result.trackingId });
      } else {
        await supabaseAdmin
          .from("orders")
          .update({
            delivery_notes: `Retry failed: ${result.error}`,
          })
          .eq("id", order.id);

        results.push({ orderId: order.id, success: false, error: result.error });
      }

      // Small delay to respect rate limiting (100 req/min = ~600ms between calls)
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Retry complete: ${succeeded} succeeded, ${failed} failed`,
      retried: results.length,
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
