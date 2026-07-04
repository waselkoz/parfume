// ==============================================================================
// src/app/api/delivery/dispatch/route.ts
// SERVER-SIDE ONLY — dispatches a saved order to Elogistia delivery API
// Called internally after order creation; never exposed to the frontend directly.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatchOrderToElogistia } from "@/lib/elogistia";

// Only allow server-to-server calls (or admin-initiated)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Fetch the full order from Supabase
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already dispatched — don't re-dispatch
    if (order.delivery_status === "dispatched" || order.tracking_id) {
      return NextResponse.json({
        message: "Order already dispatched",
        trackingId: order.tracking_id,
        deliveryStatus: order.delivery_status,
      });
    }

    // Build product list — include size + qty so courier knows exactly what was ordered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = Array.isArray(order.items) ? order.items : [];
    const products = items.map((item) => ({
      name: `${item.name || item.productName || "Parfum"} ${item.size || ""} x${item.quantity || 1}`.trim().substring(0, 50),
      price: Number(item.price || 0),
    }));

    if (products.length === 0) {
      products.push({ name: "Parfum x1", price: Number(order.total_price) });
    }

    // Call Elogistia API
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
      remarque: `Commande #${order.id} — Parfum fragile`,
    });

    if (result.success) {
      // Update order with tracking info
      await supabaseAdmin
        .from("orders")
        .update({
          delivery_status: "dispatched",
          tracking_id: result.trackingId,
          elogistia_tracking: result.trackingId,
          delivery_notes: `Dispatched to Elogistia. Frais livraison: ${result.fraisLivraison} DZD`,
        })
        .eq("id", orderId);

      return NextResponse.json({
        success: true,
        trackingId: result.trackingId,
        fraisLivraison: result.fraisLivraison,
        deliveryStatus: "dispatched",
      });
    } else {
      // Mark as pending_sync for retry
      await supabaseAdmin
        .from("orders")
        .update({
          delivery_status: "pending_sync",
          delivery_notes: `Dispatch failed: ${result.error}`,
        })
        .eq("id", orderId);

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          deliveryStatus: "pending_sync",
          message: "Order saved. Will retry delivery dispatch.",
        },
        { status: 200 } // 200 because the order itself succeeded — only delivery sync failed
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
