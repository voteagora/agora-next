/*
 * CORS helpers for TanStack Start API file-routes.
 *
 * Equivalent to the CORS handling that lives in src/middleware.ts today.
 * Since TanStack Start has no global middleware, each /api/v1/** file-route
 * must apply these helpers explicitly (or via the middleware factory in
 * ./withApiAuth.ts).
 */

const ALLOW_METHODS = "GET,HEAD,POST,OPTIONS,UPDATE,DELETE";

export function corsPreflightResponse(request: Request): Response {
  const origin = request.headers.get("Origin");
  const reqMethod = request.headers.get("Access-Control-Request-Method");
  const reqHeaders = request.headers.get("Access-Control-Request-Headers");

  if (origin !== null && reqMethod !== null && reqHeaders !== null) {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Methods": ALLOW_METHODS,
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": reqHeaders,
      },
    });
  }
  return new Response(null, {
    headers: { Allow: "GET, HEAD, POST, OPTIONS, UPDATE, DELETE" },
  });
}

export function withCorsHeaders(
  request: Request,
  response: Response
): Response {
  const reqHeaders = request.headers.get("Access-Control-Request-Headers");
  if (reqHeaders) {
    response.headers.set("Access-Control-Allow-Headers", reqHeaders);
  }
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  if (!response.headers.has("content-type")) {
    response.headers.set("content-type", "application/json");
  }
  return response;
}
