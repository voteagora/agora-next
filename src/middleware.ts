import { NextRequest, NextResponse } from "next/server";
import { validateBearerToken } from "@/app/lib/auth/edgeAuth";

const API_PREFIX = "/api/v1";
const EXCLUDED_ROUTES_FROM_AUTH = ["/spec", "/auth/nonce", "/auth/verify"];
const ROOT_PATH = process.env.NEXT_PUBLIC_AGORA_ROOT || "/";

/*
  Middleware function to run on matching routes for config.matcher.

  Currently only validating presence and formatting of API Key for /apiB
  routes.

  Consider fully validating user api key against postgres pending prisma
  client postgres support on edge runtime.
*/
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/" && ROOT_PATH !== "/") {
    return NextResponse.redirect(new URL(ROOT_PATH, request.url));
  }

  // TODO redundant check for API_PREFIX, consider removing, move to a sustainable pattern
  if (path.startsWith(API_PREFIX)) {
    // validate bearer token for all api routes except excluded routes
    if (
      !EXCLUDED_ROUTES_FROM_AUTH.some((route) =>
        path.startsWith(`${API_PREFIX}${route}`)
      )
    ) {
      const authResponse = await validateBearerToken(request);
      // TODO prisma client -> postgres db is currently not supported on edge
      // runtime for vercel specifically; migrate API key check when it is
      // TODO consider session/cookie
      if (!authResponse.authenticated) {
        return new Response(authResponse.failReason, { status: 401 });
      }
    }
  }
}

export const config = {
  matcher: ["/", "/api/v1/:path*"],
};
