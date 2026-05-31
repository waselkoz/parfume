import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, phone, city, wilaya, gender } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .insert({ email, full_name: fullName, phone, city, wilaya, gender });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
