/*
 * TanStack Start port of src/app/api/internal/safe/multisig-transaction/route.ts.
 * URL: GET /api/internal/safe/multisig-transaction
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/internal/safe/multisig-transaction")(
  {
    server: {
      handlers: {
        GET: withApiAuth(async ({ request }) => {
          const { getSafeMultisigTransactionForClient } = await import(
            "@/lib/safeApi.server"
          );
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
          const {
            normalizePositiveInteger,
            normalizeSafeAddress,
            normalizeSafeTxHash,
          } = await import("@/lib/safeValidation");

          if (!isSafeOnchainTransactionTrackingEnabled()) {
            return Response.json(
              { message: SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE },
              { status: 403 }
            );
          }

          const searchParams = new URL(request.url).searchParams;
          const chainId = searchParams.get("chainId")
            ? normalizePositiveInteger(searchParams.get("chainId")!)
            : null;
          const safeTxHash = searchParams.get("safeTxHash")
            ? normalizeSafeTxHash(searchParams.get("safeTxHash")!)
            : null;
          const safeAddressParam = searchParams.get("safeAddress");
          const safeAddress = safeAddressParam
            ? normalizeSafeAddress(safeAddressParam)
            : null;
          const createdAtParam = searchParams.get("createdAt");

          if (!chainId || !safeTxHash || (safeAddressParam && !safeAddress)) {
            return Response.json(
              {
                message:
                  "Missing or invalid Safe multisig transaction parameters.",
              },
              { status: 400 }
            );
          }

          const authResult = await getOptionalSafeJwtAddress(request as never);
          if (authResult?.response) return authResult.response;
          if (
            authResult?.address &&
            safeAddress &&
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
                "safe-multisig-transaction",
                authResult.address,
                120
              )
            : await enforceUnauthenticatedSafeStatusRateLimit(
                request as never,
                "safe-multisig-transaction",
                30
              );
          if (rateLimitResponse) return rateLimitResponse;

          try {
            const createdAt =
              createdAtParam && !Number.isNaN(Date.parse(createdAtParam))
                ? Date.parse(createdAtParam)
                : createdAtParam && Number.isFinite(Number(createdAtParam))
                  ? Number(createdAtParam)
                  : undefined;

            const result = await getSafeMultisigTransactionForClient(
              chainId,
              safeTxHash,
              {
                safeAddress: safeAddress ?? authResult?.address,
                createdAt,
              }
            );

            if (
              authResult?.address &&
              result.status?.safeAddress &&
              !safeAddressesMatch(authResult.address, result.status.safeAddress)
            ) {
              return Response.json(
                { message: "Safe session does not match the requested Safe." },
                { status: 403 }
              );
            }

            return Response.json(result);
          } catch (error) {
            console.error("[safe-multisig-transaction] lookup failed", {
              chainId,
              safeTxHash,
              safeAddress,
              error,
            });
            return Response.json(
              { message: "Failed to load Safe multisig transaction." },
              { status: 500 }
            );
          }
        }),
      },
    },
  }
);
