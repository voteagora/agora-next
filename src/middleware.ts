import { NextRequest, NextResponse } from "next/server";
import { validateBearerToken } from "@/app/lib/auth/edgeAuth";

const API_PREFIX = "/api/v1";
const EXCLUDED_ROUTES_FROM_AUTH = [
  "/spec",
  "/auth/nonce",
  "/auth/verify",
  "/votable_supply",
];
const ROOT_PATH = process.env.NEXT_PUBLIC_AGORA_ROOT || "/";

/*
  CORS headers for authenticated API routes are handled poorly by Next

  Since our API is open to the public, we need to set CORS headers to
  allow all origins. This is done by setting preflight headers for OPTIONS
  requests and standard headers for all other requests.
*/

function setOptionsCorsHeaders(request: Request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS,UPDATE,DELETE",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": request.headers.get("Origin")!,
        "Access-Control-Allow-Headers": request.headers.get(
          "Access-Control-Request-Headers"
        )!,
      },
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS, UPDATE, DELETE",
      },
    });
  }
}

function setCorsHeaders(request: NextRequest, response: Response) {
  const requestHeaders = request.headers.get("Access-Control-Request-Headers");
  if (requestHeaders) {
    response.headers.set("Access-Control-Allow-Headers", requestHeaders);
  }
  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,OPTIONS,UPDATE,DELETE"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("content-type", "application/json");

  return response;
}

/*
  Middleware function to run on matching routes for config.matcher.

  Currently only validating presence and formatting of API Key for /apiB
  routes.

  Consider fully validating user api key against postgres pending prisma
  client postgres support on edge runtime.
*/
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const startTime = Date.now();

  if (process.env.NODE_ENV === "development") {
    console.log(`🔷 [MIDDLEWARE START] ${request.method} ${path}`);
  }

  if (path === "/" && ROOT_PATH !== "/") {
    return NextResponse.redirect(new URL(ROOT_PATH, request.url));
  }

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const response = setOptionsCorsHeaders(request);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔶 [MIDDLEWARE END] ${request.method} ${path} - ${Date.now() - startTime}ms (OPTIONS)`
      );
    }
    return response;
  }

  if (path.startsWith(API_PREFIX)) {
    // validate bearer token for all api routes except excluded routes
    if (
      !EXCLUDED_ROUTES_FROM_AUTH.some((route) =>
        path.startsWith(`${API_PREFIX}${route}`)
      )
    ) {
      const authResponse = await validateBearerToken(request);
      if (!authResponse.authenticated) {
        const response = setCorsHeaders(
          request,
          new Response(authResponse.failReason, {
            status: 401,
          })
        );
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🔶 [MIDDLEWARE END] ${request.method} ${path} - ${Date.now() - startTime}ms (UNAUTHORIZED)`
          );
        }
        return response;
      }
    }
    const response = setCorsHeaders(request, NextResponse.next());
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔶 [MIDDLEWARE END] ${request.method} ${path} - ${Date.now() - startTime}ms (API)`
      );
    }
    return response;
  }

  // For non-API routes, just call next() without setting CORS headers
  if (process.env.NODE_ENV === "development") {
    console.log(
      `🔶 [MIDDLEWARE END] ${request.method} ${path} - ${Date.now() - startTime}ms`
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/v1/:path*"],
};
