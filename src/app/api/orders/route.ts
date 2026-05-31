import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

    if (error) throw error;

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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
