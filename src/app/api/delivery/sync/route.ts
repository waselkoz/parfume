// ==============================================================================
// src/app/api/delivery/sync/route.ts
// SERVER-SIDE ONLY — polls Elogistia for status updates on dispatched orders
// Call this on a schedule or from admin to refresh delivery statuses
// ==============================================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrderTracking, mapElogistiaStatus } from "@/lib/elogistia";
import { restoreStockForOrder } from "@/lib/stock";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Find all dispatched orders that are not yet delivered/returned
    const { data: activeOrders, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, elogistia_tracking, delivery_status, items, status")
      .in("delivery_status", ["dispatched", "ramassee", "en_transit", "en_livraison"])
      .not("elogistia_tracking", "is", null)
      .limit(50);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!activeOrders || activeOrders.length === 0) {
      return NextResponse.json({ message: "No active deliveries to sync", synced: 0 });
    }

    let synced = 0;
    let unchanged = 0;

    for (const order of activeOrders) {
      if (!order.elogistia_tracking) continue;

      const tracking = await getOrderTracking(order.elogistia_tracking);

      if (tracking.success && tracking.latestStatus !== order.delivery_status) {
        await supabaseAdmin
          .from("orders")
          .update({
            delivery_status: tracking.latestStatus,
            delivery_notes: tracking.entries[0]
              ? `${tracking.entries[0].statut} — ${tracking.entries[0].date}`
              : undefined,
            // Also update order status for admin visibility
            status: mapDeliveryToOrderStatus(tracking.latestStatus),
          })
          .eq("id", order.id);
          
        if (order.status !== "Returned" && (tracking.latestStatus === "retour" || tracking.latestStatus === "annulee" || tracking.latestStatus === "perdue")) {
          await restoreStockForOrder(order.items);
        }

        synced++;
      } else {
        unchanged++;
      }

      // Rate limit: 100 req/min
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    return NextResponse.json({
      message: `Sync complete: ${synced} updated, ${unchanged} unchanged`,
      synced,
      unchanged,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Maps Elogistia delivery status to the existing admin order status values
 */
function mapDeliveryToOrderStatus(deliveryStatus: ReturnType<typeof mapElogistiaStatus>): string {
  switch (deliveryStatus) {
    case "livre": return "Completed";
    case "en_livraison":
    case "en_transit":
    case "ramassee":
    case "dispatched": return "Shipped";
    case "retour":
    case "annulee":
    case "perdue": return "Returned";
    default: return "Pending";
  }
}
