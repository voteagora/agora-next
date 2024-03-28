import { type NextRequest, NextResponse } from "next/server";
import { hasApiKey } from "@/app/lib/middleware/auth";


const allowedOrigins = ["https://vote.optimism.io/"];
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/*
  Middleware function to run on matching routes for config.matcher.

  Currently only validating presence and formatting of API Key for /api
  routes.

  Consider fully validating user api key against postgres pending prisma
  client postgres support on edge runtime.
*/
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? '';

  let isAllowedOrigin = false;
  if (process.env.NEXT_PUBLIC_AGORA_ENV === "prod") {
    isAllowedOrigin = allowedOrigins.includes(origin);
  } else {
    // Allow all origins if not in production
    isAllowedOrigin = true;
  }

  const isPreflight = request.method === 'OPTIONS';
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin ? { 'Access-Control-Allow-Origin': origin } : {}),
      ...corsOptions,
    };

    // If not in prod, allow all origins for preflight requests
    if (process.env.NEXT_PUBLIC_AGORA_ENV !== "prod") {
      preflightHeaders['Access-Control-Allow-Origin'] = '*';
    }

    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_AGORA_ENV === "prod" ? origin : '*');
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (request.nextUrl.pathname.startsWith('/api')) {
    const authResponse = hasApiKey(request);
    if (!authResponse.authenticated) {
      return new Response(authResponse.reason, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: '/api/v1/:path*',
};
