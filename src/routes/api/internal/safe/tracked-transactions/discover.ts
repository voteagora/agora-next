/*
 * TanStack Start port of src/app/api/internal/safe/tracked-transactions/discover/route.ts.
 * URL: POST /api/internal/safe/tracked-transactions/discover
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/internal/safe/tracked-transactions/discover"
)({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request }) => {
        const {
          isSafeOnchainTransactionTrackingEnabled,
          SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE,
        } = await import("@/lib/safeFeatures");
        const {
          enforceAuthenticatedSafeRateLimit,
          enforceUnauthenticatedSafeStatusRateLimit,
          getOptionalSafeJwtAddress,
          safeAddressesMatch,
        } = await import("@/lib/safeInternalApiAuth.server");
        const { discoverSafeTrackedTransaction } = await import(
          "@/lib/safeTrackedTransactions.server"
        );
        const {
          isSafeTrackedTransactionKind,
          normalizeHexData,
          normalizePositiveInteger,
          normalizeSafeAddress,
        } = await import("@/lib/safeValidation");
        const { getMiradorTraceContextFromHeaders } = await import(
          "@/lib/mirador/requestContext"
        );
        const { default: Tenant } = await import("@/lib/tenant/tenant");

        if (!isSafeOnchainTransactionTrackingEnabled()) {
          return Response.json(
            { message: SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE },
            { status: 403 }
          );
        }

        const traceContext = getMiradorTraceContextFromHeaders(
          request as never
        );

        let body: Record<string, unknown> | null = null;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json(
            { message: "Invalid request body." },
            { status: 400 }
          );
        }

        if (
          !body?.kind ||
          !isSafeTrackedTransactionKind(body.kind as string) ||
          !body.safeAddress ||
          !body.to ||
          !body.data
        ) {
          return Response.json(
            { message: "Missing Safe discovery fields." },
            { status: 400 }
          );
        }

        const normalizedSafeAddress = normalizeSafeAddress(
          body.safeAddress as string
        );
        const normalizedTo = normalizeSafeAddress(body.to as string);
        const normalizedData = normalizeHexData(body.data as string);
        const chainId = normalizePositiveInteger(body.chainId as string);
        const createdAfter = normalizePositiveInteger(
          body.createdAfter as string
        );

        if (
          !normalizedSafeAddress ||
          !normalizedTo ||
          !normalizedData ||
          !chainId ||
          !createdAfter
        ) {
          return Response.json(
            { message: "Missing Safe discovery fields." },
            { status: 400 }
          );
        }

        const authResult = await getOptionalSafeJwtAddress(request as never);
        if (authResult?.response) return authResult.response;
        if (
          authResult?.address &&
          !safeAddressesMatch(authResult.address, normalizedSafeAddress)
        ) {
          return Response.json(
            { message: "Safe session does not match the requested Safe." },
            { status: 403 }
          );
        }

        const rateLimitResponse = authResult?.address
          ? await enforceAuthenticatedSafeRateLimit(
              request as never,
              "safe-tracked-transactions-discover",
              authResult.address,
              30
            )
          : await enforceUnauthenticatedSafeStatusRateLimit(
              request as never,
              "safe-tracked-transactions-discover",
              10,
              "Too many Safe discovery requests. Please retry shortly."
            );
        if (rateLimitResponse) return rateLimitResponse;

        try {
          const transaction = await discoverSafeTrackedTransaction({
            ...(body as Parameters<typeof discoverSafeTrackedTransaction>[0]),
            safeAddress: normalizedSafeAddress,
            to: normalizedTo,
            data: normalizedData,
            chainId,
            createdAfter,
            daoSlug: Tenant.current().slug,
            traceContext,
          });

          if (!transaction) {
            return Response.json({ found: false });
          }

          return Response.json({ found: true, transaction });
        } catch (error) {
          const statusCode =
            typeof (error as { statusCode?: unknown })?.statusCode === "number"
              ? (error as { statusCode: number }).statusCode
              : 500;
          console.error("[safe-tracked-transactions] discover failed", {
            safeAddress: normalizedSafeAddress,
            to: normalizedTo,
            chainId,
            error,
          });
          return Response.json(
            { message: "Failed to discover Safe transaction." },
            { status: statusCode }
          );
        }
      }),
    },
  },
});
