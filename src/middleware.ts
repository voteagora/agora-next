import { type NextRequest, NextResponse } from "next/server";
import { hasApiKey } from "@/app/lib/middleware/auth";

const baseUrl = process.env.NEXT_PUBLIC_AGORA_BASE_URL;
const allowedOrigins = [baseUrl?.split("/api")[0]];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/*
  Middleware function to run on matching routes for config.matcher.

  Currently only validating presence and formatting of API Key for /api
  routes.

  Consider fully validating user api key against postgres pending prisma
  client postgres support on edge runtime.
*/
export function middleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS';

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    }
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value)
  });
  if (request.nextUrl.pathname.startsWith('/api')) {
    const authResponse = hasApiKey(request);
    // TODO prisma client -> postgres db is currently not supported on edge
    // runtime for vercel specifically; migrate API key check when it is
    // TODO consider session/cookie 
    if (!authResponse.authenticated) {
      return new Response(
        authResponse.reason,
        { status: 401 }
      );
    }
  }
}

export const config = {
  matcher: '/api/v1/:path*',
}