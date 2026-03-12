export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { getSafeMessageStatusForClient } from "@/lib/safeApi.server";
import { MIRADOR_TRACE_ID_HEADER } from "@/lib/mirador/constants";
import { refreshTraceKeepAlive } from "@/lib/mirador/serverKeepAlive";
import {
  isSafeOffchainMessageTrackingEnabled,
  SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE,
} from "@/lib/safeFeatures";
import {
  enforceAuthenticatedSafeRateLimit,
  enforceUnauthenticatedSafeStatusRateLimit,
  getOptionalSafeJwtAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";
import {
  normalizePositiveInteger,
  normalizeSafeAddress,
  normalizeSafeMessageHash,
} from "@/lib/safeValidation";

export async function GET(request: NextRequest) {
  if (!isSafeOffchainMessageTrackingEnabled()) {
    return NextResponse.json(
      { message: SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE },
      { status: 403 }
    );
  }

  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const messageHashParam = request.nextUrl.searchParams.get("messageHash");
  const safeAddressParam = request.nextUrl.searchParams.get("safeAddress");
  const chainId = chainIdParam ? normalizePositiveInteger(chainIdParam) : null;
  const messageHash = messageHashParam
    ? normalizeSafeMessageHash(messageHashParam)
    : null;
  const safeAddress = safeAddressParam
    ? normalizeSafeAddress(safeAddressParam)
    : null;

  if (!chainId || !messageHash || !safeAddress) {
    return NextResponse.json(
      { message: "Missing or invalid Safe message status parameters." },
      { status: 400 }
    );
  }

  const authResult = await getOptionalSafeJwtAddress(request);
  if (authResult?.response) {
    return authResult.response;
  }
  if (
    authResult?.address &&
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
        "safe-message-status",
        authResult.address,
        120
      )
    : await enforceUnauthenticatedSafeStatusRateLimit(
        request,
        "safe-message-status",
        30
      );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const miradorTraceId = request.headers.get(MIRADOR_TRACE_ID_HEADER);
  if (miradorTraceId) {
    refreshTraceKeepAlive(miradorTraceId);
  }

  try {
    const result = await getSafeMessageStatusForClient(
      chainId,
      messageHash,
      safeAddress
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[safe-message-status] lookup failed", {
      chainId,
      messageHash,
      safeAddress,
      error,
    });
    return NextResponse.json(
      { message: "Failed to load Safe message status." },
      { status: 500 }
    );
  }
}
