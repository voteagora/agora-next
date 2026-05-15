/*
 * TanStack Start port of src/app/api/v1/auth/nonce/route.ts.
 * Excluded from bearer-token auth (matches EXCLUDED_ROUTES_FROM_AUTH in middleware.ts).
 *
 * URL: GET /api/v1/auth/nonce
 */

import { createFileRoute } from "@tanstack/react-router";

import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import { storeSiweNonce } from "@/lib/siweNonce.server";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/auth/nonce")({
  server: {
    handlers: {
      GET: withApiAuth(
        async ({ request }) => {
          const { generateNonce } = await import("siwe");
          const traceContext = getMiradorTraceContextFromHeaders(request);
          const requestUrl = new URL(request.url);

          try {
            const nonce = generateNonce();
            await storeSiweNonce(nonce, requestUrl.host);
            appendServerTraceEvent({
              traceContext: traceContext
                ? { ...traceContext, step: "siwe_nonce", source: "api" }
                : undefined,
              eventName: "siwe_nonce_generated",
            });
            return Response.json({ nonce });
          } catch (e: any) {
            appendServerTraceEvent({
              traceContext: traceContext
                ? { ...traceContext, step: "siwe_nonce", source: "api" }
                : undefined,
              eventName: "siwe_nonce_failed",
              details: { message: e?.toString?.() ?? "Unknown error" },
            });
            return new Response("Internal server error: " + e.toString(), {
              status: 500,
            });
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
