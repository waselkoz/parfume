import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

// Define the matching route paths to intercept
export const config = {
  matcher: ["/admin/:path*"],
};
