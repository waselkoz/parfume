import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@velours.com";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET || "velours-dev-secret-change-in-production";

    // 1. Verify email matches the configured admin email
    if (email !== adminEmail) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // 2. Verify password hash matches (using standard admin hash if not configured)
    const isPasswordCorrect = adminPasswordHash
      ? await bcrypt.compare(password, adminPasswordHash)
      : password === "adminpassword123"; // Fallback if no hash is configured

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

    response.cookies.set("velours_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also set standard client cookie for client context compatibility
    const clientUser = { email, role: "admin" };
    response.cookies.set("velours_user", encodeURIComponent(JSON.stringify(clientUser)), {
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
