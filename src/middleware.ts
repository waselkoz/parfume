import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "parfumguy-dev-secret-change-in-production";

const protectedRoutes = [
  { path: '/api/products', methods: ['POST', 'PUT', 'DELETE'] },
  { path: '/api/categories', methods: ['POST', 'PUT', 'DELETE'] },
  { path: '/api/brands', methods: ['POST', 'PUT', 'DELETE'] },
  { path: '/api/orders', methods: ['GET', 'PUT', 'DELETE'] },
  { path: '/api/delivery', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  let isProtected = false;
  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path) && route.methods.includes(request.method)) {
      isProtected = true;
      break;
    }
  }

  if (isProtected) {
    const authHeader = request.headers.get("authorization");
    
    // Support for server-to-server or CRON bypass using a secure bearer token if needed
    if (authHeader && process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.next();
    }

    const token = request.cookies.get('parfumguy_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secretKey);
      
      if (payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
