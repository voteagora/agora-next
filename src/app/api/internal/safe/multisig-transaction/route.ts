export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { getSafeMultisigTransactionForClient } from "@/lib/safeApi.server";
import {
  enforceUnauthenticatedSafeStatusRateLimit,
  getOptionalSafeJwtAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const safeTxHashParam = request.nextUrl.searchParams.get("safeTxHash");
  const safeAddressParam = request.nextUrl.searchParams.get("safeAddress");
  const createdAtParam = request.nextUrl.searchParams.get("createdAt");
  const chainId = Number(chainIdParam);

  if (!Number.isFinite(chainId) || !safeTxHashParam) {
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
    safeAddressParam &&
    !safeAddressesMatch(authResult.address, safeAddressParam)
  ) {
    return NextResponse.json(
      { message: "Safe session does not match the requested Safe." },
      { status: 403 }
    );
  }
  if (!authResult?.address) {
    const rateLimitResponse = enforceUnauthenticatedSafeStatusRateLimit(
      request,
      "safe-multisig-transaction"
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  try {
    const safeAddress =
      (safeAddressParam || authResult?.address) as `0x${string}` | undefined;
    const createdAt =
      createdAtParam && !Number.isNaN(Date.parse(createdAtParam))
        ? Date.parse(createdAtParam)
        : createdAtParam && Number.isFinite(Number(createdAtParam))
          ? Number(createdAtParam)
          : undefined;
    const result = await getSafeMultisigTransactionForClient(
      chainId,
      safeTxHashParam as `0x${string}`,
      {
        safeAddress,
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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Safe multisig transaction.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
