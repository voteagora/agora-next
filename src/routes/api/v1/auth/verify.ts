/*
 * TanStack Start port of src/app/api/v1/auth/verify/route.ts.
 * Demonstrates POST with JSON body (`await request.json()`).
 * Excluded from bearer-token auth.
 *
 * URL: POST /api/v1/auth/verify
 */

import { createFileRoute } from "@tanstack/react-router";

import { appendServerTraceEvent } from "@/lib/mirador/serverTrace";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import { verifySiweLogin } from "@/lib/siweAuth.server";
import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/v1/auth/verify")({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          const { generateJwt, getRolesForUser, getExpiry } = await import(
            "@/app/lib/auth/serverAuth"
          );
          const baseTraceContext = getMiradorTraceContextFromHeaders(request);
          const requestUrl = new URL(request.url);

          try {
            const { message, signature } = await request.json();
            const { SiweMessage } = await import("siwe");
            const siweObject = new SiweMessage(message);
            const traceContext = baseTraceContext
              ? {
                  ...baseTraceContext,
                  step: "siwe_verify",
                  source: "api" as const,
                  walletAddress: siweObject.address as `0x${string}`,
                  chainId: siweObject.chainId,
                }
              : undefined;

            appendServerTraceEvent({
              traceContext,
              eventName: "siwe_verify_started",
            });

            const verification = await verifySiweLogin({
              expectedHost: requestUrl.host,
              message,
              signature,
            });

            if (verification.ok) {
              appendServerTraceEvent({
                traceContext,
                eventName: "siwe_verify_succeeded",
              });
            }

            if (!verification.ok) {
              appendServerTraceEvent({
                traceContext,
                eventName: "siwe_verify_failed",
                details: { reason: verification.reason },
              });
              return Response.json(
                { message: verification.reason },
                { status: 401 }
              );
            }

            const verifiedMessage = verification.siweMessage;
            const scope = await getRolesForUser(
              verifiedMessage.address,
              verifiedMessage
            );
            const ttl = await getExpiry();
            const jwt = await generateJwt(verifiedMessage.address, scope, ttl, {
              address: verifiedMessage.address,
              chainId: `${verifiedMessage.chainId}`,
              nonce: verifiedMessage.nonce,
            });

            appendServerTraceEvent({
              traceContext,
              eventName: "siwe_jwt_issued",
            });
            return Response.json({
              access_token: jwt,
              token_type: "JWT",
              expires_in: ttl,
            });
          } catch (e) {
            appendServerTraceEvent({
              traceContext: baseTraceContext
                ? { ...baseTraceContext, step: "siwe_verify", source: "api" }
                : undefined,
              eventName: "siwe_verify_failed",
              details: { message: "Internal server error" },
            });
            return new Response("Internal server error", { status: 500 });
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
