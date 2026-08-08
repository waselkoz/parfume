import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Helper to determine if a route requires authentication
function requiresAuth(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const method = req.method;

  // Only protect /api routes
  if (!path.startsWith('/api/')) {
    return false;
  }

  // Auth routes are always public
  if (path.startsWith('/api/auth/')) {
    return false;
  }

  // Public GET endpoints (viewing data)
  const publicGetRoutes = [
    '/api/products',
    '/api/categories',
    '/api/brands',
    '/api/settings',
    '/api/reviews'
  ];

  if (method === 'GET') {
    // Check if the path matches exactly or starts with the public path + /
    const isPublicGet = publicGetRoutes.some(
      route => path === route || path.startsWith(`${route}/`)
    );
    if (isPublicGet) return false;
  }

  // Public POST endpoints (submitting data as customer)
  if (method === 'POST') {
    if (path === '/api/orders' || path === '/api/reviews') {
      return false;
    }
  }

  // By default, if it's an API route and didn't match public criteria, it requires auth
  return true;
}

export async function middleware(req: NextRequest) {
  if (requiresAuth(req)) {
    const token = req.cookies.get('parfumguy_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication token' },
        { status: 401 }
      );
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || "parfumguy-dev-secret-change-in-production";
      const secretKey = new TextEncoder().encode(jwtSecret);
      
      // Verify the JWT signature
      await jwtVerify(token, secretKey);
      
      // Token is valid, proceed
      return NextResponse.next();
    } catch (error) {
      console.error("[Middleware] JWT Verification Failed:", error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
