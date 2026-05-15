/*
 * TanStack Start port of src/app/api/internal/safe/tracked-transactions/route.ts.
 * URL: GET|POST /api/internal/safe/tracked-transactions
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute(
  "/api/internal/safe/tracked-transactions/"
)({
  server: {
    handlers: {
      GET: withApiAuth(async ({ request }) => {
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
        const { listActiveSafeTrackedTransactions } = await import(
          "@/lib/safeTrackedTransactions.server"
        );
        const { isSafeTrackedTransactionKind, normalizeSafeAddress } =
          await import("@/lib/safeValidation");
        const { default: Tenant } = await import("@/lib/tenant/tenant");

        if (!isSafeOnchainTransactionTrackingEnabled()) {
          return Response.json(
            { message: SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE },
            { status: 403 }
          );
        }

        const searchParams = new URL(request.url).searchParams;
        const safeAddress = searchParams.get("safeAddress");
        const kind = searchParams.get("kind");
        const normalizedSafeAddress = safeAddress
          ? normalizeSafeAddress(safeAddress)
          : null;

        if (
          !normalizedSafeAddress ||
          !kind ||
          !isSafeTrackedTransactionKind(kind)
        ) {
          return Response.json(
            { message: "Missing Safe address or kind." },
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
              "safe-tracked-transactions-list",
              authResult.address,
              60
            )
          : await enforceUnauthenticatedSafeStatusRateLimit(
              request as never,
              "safe-tracked-transactions-list",
              20
            );
        if (rateLimitResponse) return rateLimitResponse;

        try {
          const transactions = await listActiveSafeTrackedTransactions({
            daoSlug: Tenant.current().slug,
            kind,
            safeAddress: normalizedSafeAddress,
          });
          return Response.json({ transactions });
        } catch (error) {
          console.error("[safe-tracked-transactions] list failed", {
            safeAddress: normalizedSafeAddress,
            kind,
            error,
          });
          return Response.json(
            { message: "Failed to load active Safe transactions." },
            { status: 500 }
          );
        }
      }),

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
        const { upsertSafeTrackedTransaction } = await import(
          "@/lib/safeTrackedTransactions.server"
        );
        const {
          isSafeTrackedTransactionKind,
          normalizePositiveInteger,
          normalizeSafeAddress,
          normalizeSafeTxHash,
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
          !body.safeTxHash
        ) {
          return Response.json(
            { message: "Missing Safe tracked transaction fields." },
            { status: 400 }
          );
        }

        const normalizedSafeAddress = normalizeSafeAddress(
          body.safeAddress as string
        );
        const normalizedSafeTxHash = normalizeSafeTxHash(
          body.safeTxHash as string
        );
        const chainId = normalizePositiveInteger(body.chainId as string);

        if (!normalizedSafeAddress || !normalizedSafeTxHash || !chainId) {
          return Response.json(
            { message: "Missing Safe tracked transaction fields." },
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
              "safe-tracked-transactions-create",
              authResult.address,
              30
            )
          : await enforceUnauthenticatedSafeStatusRateLimit(
              request as never,
              "safe-tracked-transactions-create",
              10,
              "Too many Safe publish tracking requests. Please retry shortly."
            );
        if (rateLimitResponse) return rateLimitResponse;

        try {
          const transaction = await upsertSafeTrackedTransaction({
            ...(body as Parameters<typeof upsertSafeTrackedTransaction>[0]),
            safeAddress: normalizedSafeAddress,
            safeTxHash: normalizedSafeTxHash,
            chainId,
            daoSlug: Tenant.current().slug,
            traceContext,
            includeTraceSafeTxHint: false,
          });
          return Response.json({ transaction });
        } catch (error) {
          const statusCode =
            typeof (error as { statusCode?: unknown })?.statusCode === "number"
              ? (error as { statusCode: number }).statusCode
              : 500;
          console.error("[safe-tracked-transactions] create failed", {
            safeAddress: normalizedSafeAddress,
            safeTxHash: normalizedSafeTxHash,
            chainId,
            error,
          });
          return Response.json(
            { message: "Failed to persist Safe tracked transaction." },
            { status: statusCode }
          );
        }
      }),
    },
  },
});
