/*
 * TanStack Start port of src/app/api/internal/safe/message-status/route.ts.
 * URL: GET /api/internal/safe/message-status
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/internal/safe/message-status")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
        const { getSafeMessageStatusForClient } = await import(
          "@/lib/safeApi.server"
        );
        const { MIRADOR_TRACE_ID_HEADER } = await import(
          "@/lib/mirador/constants"
        );
        const { refreshTraceKeepAlive } = await import(
          "@/lib/mirador/serverKeepAlive"
        );
        const {
          isSafeOffchainMessageTrackingEnabled,
          SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE,
        } = await import("@/lib/safeFeatures");
        const {
          enforceAuthenticatedSafeRateLimit,
          enforceUnauthenticatedSafeStatusRateLimit,
          getOptionalSafeJwtAddress,
          safeAddressesMatch,
        } = await import("@/lib/safeInternalApiAuth.server");
        const {
          normalizePositiveInteger,
          normalizeSafeAddress,
          normalizeSafeMessageHash,
        } = await import("@/lib/safeValidation");

        if (!isSafeOffchainMessageTrackingEnabled()) {
          return Response.json(
            { message: SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE },
            { status: 403 }
          );
        }

        const searchParams = new URL(request.url).searchParams;
        const chainId = searchParams.get("chainId")
          ? normalizePositiveInteger(searchParams.get("chainId")!)
          : null;
        const messageHash = searchParams.get("messageHash")
          ? normalizeSafeMessageHash(searchParams.get("messageHash")!)
          : null;
        const safeAddress = searchParams.get("safeAddress")
          ? normalizeSafeAddress(searchParams.get("safeAddress")!)
          : null;

        if (!chainId || !messageHash || !safeAddress) {
          return Response.json(
            { message: "Missing or invalid Safe message status parameters." },
            { status: 400 }
          );
        }

        const authResult = await getOptionalSafeJwtAddress(request as never);
        if (authResult?.response) return authResult.response;
        if (
          authResult?.address &&
          !safeAddressesMatch(authResult.address, safeAddress)
        ) {
          return Response.json(
            { message: "Safe session does not match the requested Safe." },
            { status: 403 }
          );
        }

        const rateLimitResponse = authResult?.address
          ? await enforceAuthenticatedSafeRateLimit(
              request as never,
              "safe-message-status",
              authResult.address,
              120
            )
          : await enforceUnauthenticatedSafeStatusRateLimit(
              request as never,
              "safe-message-status",
              30
            );
        if (rateLimitResponse) return rateLimitResponse;

        const miradorTraceId = request.headers.get(MIRADOR_TRACE_ID_HEADER);
        if (miradorTraceId) refreshTraceKeepAlive(miradorTraceId);

        try {
          const result = await getSafeMessageStatusForClient(
            chainId,
            messageHash,
            safeAddress
          );
          return Response.json(result);
        } catch (error) {
          console.error("[safe-message-status] lookup failed", {
            chainId,
            messageHash,
            safeAddress,
            error,
          });
          return Response.json(
            { message: "Failed to load Safe message status." },
            { status: 500 }
          );
        }
      }),
    },
  },
});
