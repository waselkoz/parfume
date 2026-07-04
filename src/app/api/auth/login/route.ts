import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const jwtSecret = process.env.JWT_SECRET || "parfumguy-dev-secret-change-in-production";

    // 1. Fetch admin credentials from Supabase
    const { data: adminUser, error } = await supabaseAdmin
      .from("admins")
      .select("password_hash")
      .eq("email", email)
      .single();

    if (error || !adminUser) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // 2. Verify password hash matches
    const isPasswordCorrect = await bcrypt.compare(password, adminUser.password_hash);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // 3. Generate secure, signed JWT token using 'jose'
    const secretKey = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ email, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);

    // 4. Return success response and set secure, HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      email,
      role: "admin",
    });

    response.cookies.set("parfumguy_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also set standard client cookie for client context compatibility
    const clientUser = { email, role: "admin" };
    response.cookies.set("parfumguy_user", encodeURIComponent(JSON.stringify(clientUser)), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
