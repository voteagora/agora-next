/*
 * Drop-in wrapper for /api/v1/** server file-routes.
 *
 * Replaces the bearer-token validation + CORS handling done globally in
 * src/middleware.ts today. Each TanStack Start file-route under
 * src/routes/api/v1 should wrap its handlers with `withApiAuth(handler)` (or
 * `withApiAuthExcluded(handler)` for the unauthenticated endpoints listed in
 * `EXCLUDED_ROUTES_FROM_AUTH`).
 *
 * The Next.js middleware (src/middleware.ts) keeps owning these routes for
 * the existing Next build until Phase F cutover.
 */

import { validateBearerToken } from "@/lib/auth/edgeAuth";
import { corsPreflightResponse, withCorsHeaders } from "./cors";

type HandlerCtx = {
  request: Request;
  params: Record<string, string>;
  pathname?: string;
  context?: unknown;
};

type Handler<TCtx extends HandlerCtx = HandlerCtx> = (
  ctx: TCtx
) => Promise<Response> | Response;

export type WithApiAuthOptions = {
  /** Skip bearer-token validation entirely (e.g. /spec, /auth/nonce). */
  skipAuth?: boolean;
  /**
   * Allow access when the request matches the "draft share" pattern that
   * middleware.ts uses today: path starts with /drafts/ + `?share=…`.
   * Defaults to false — set to true on drafts handlers that need it.
   */
  allowDraftShare?: boolean;
};

export function withApiAuth<TCtx extends HandlerCtx>(
  handler: Handler<TCtx>,
  options: WithApiAuthOptions = {}
) {
  return async (ctx: TCtx): Promise<Response> => {
    const { request } = ctx;
    if (request.method === "OPTIONS") {
      return corsPreflightResponse(request);
    }

    const url = new URL(request.url);
    const requiresApiV1Auth =
      url.pathname === "/api/v1" || url.pathname.startsWith("/api/v1/");

    if (!options.skipAuth && requiresApiV1Auth) {
      const isDraftShareRequest =
        options.allowDraftShare === true &&
        url.pathname.includes("/drafts/") &&
        url.searchParams.has("share");

      if (!isDraftShareRequest) {
        const authResponse = await validateBearerToken(request);
        if (!authResponse.authenticated) {
          return withCorsHeaders(
            request,
            new Response(authResponse.failReason, { status: 401 })
          );
        }
      }
    }

    const response = await handler(ctx);
    return withCorsHeaders(request, response);
  };
}
