import type { NextRequest } from "next/server";
import { validateBearerToken } from "@/app/lib/auth/edgeAuth";

/*
  Middleware function to run on matching routes for config.matcher.

  Currently only validating presence and formatting of API Key for /api
  routes.

  Consider fully validating user api key against postgres pending prisma
  client postgres support on edge runtime.
*/
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/v1") && !path.startsWith("/api/v1/spec")) {
    const authResponse = await validateBearerToken(request);
    // TODO prisma client -> postgres db is currently not supported on edge
    // runtime for vercel specifically; migrate API key check when it is
    // TODO consider session/cookie
    if (!authResponse.authenticated) {
      return new Response(authResponse.failReason, { status: 401 });
    }
  }
}

export const config = {
  matcher: "/api/v1/:path*",
};
