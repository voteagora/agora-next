export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { getSafeMultisigTransactionForClient } from "@/lib/safeApi.server";
import {
  enforceAuthenticatedSafeRateLimit,
  enforceUnauthenticatedSafeStatusRateLimit,
  getOptionalSafeJwtAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";
import {
  normalizePositiveInteger,
  normalizeSafeAddress,
  normalizeSafeTxHash,
} from "@/lib/safeValidation";

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const safeTxHashParam = request.nextUrl.searchParams.get("safeTxHash");
  const safeAddressParam = request.nextUrl.searchParams.get("safeAddress");
  const createdAtParam = request.nextUrl.searchParams.get("createdAt");
  const chainId = chainIdParam ? normalizePositiveInteger(chainIdParam) : null;
  const safeTxHash = safeTxHashParam
    ? normalizeSafeTxHash(safeTxHashParam)
    : null;
  const safeAddress = safeAddressParam
    ? normalizeSafeAddress(safeAddressParam)
    : null;

  if (!chainId || !safeTxHash || (safeAddressParam && !safeAddress)) {
    return NextResponse.json(
      { message: "Missing or invalid Safe multisig transaction parameters." },
      { status: 400 }
    );
  }

  const authResult = await getOptionalSafeJwtAddress(request);
  if (authResult?.response) {
    return authResult.response;
  }
  if (
    authResult?.address &&
    safeAddress &&
    !safeAddressesMatch(authResult.address, safeAddress)
  ) {
    return NextResponse.json(
      { message: "Safe session does not match the requested Safe." },
      { status: 403 }
    );
  }
  const rateLimitResponse = authResult?.address
    ? await enforceAuthenticatedSafeRateLimit(
        request,
        "safe-multisig-transaction",
        authResult.address,
        120
      )
    : await enforceUnauthenticatedSafeStatusRateLimit(
        request,
        "safe-multisig-transaction",
        30
      );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
      return NextResponse.json(
        { message: "Safe session does not match the requested Safe." },
        { status: 403 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[safe-multisig-transaction] lookup failed", {
      chainId,
      safeTxHash,
      safeAddress,
      error,
    });
    return NextResponse.json(
      { message: "Failed to load Safe multisig transaction." },
      { status: 500 }
    );
  }
}
