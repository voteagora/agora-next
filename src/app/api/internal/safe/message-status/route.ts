export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import { getSafeMessageStatusForClient } from "@/lib/safeApi.server";
import { MIRADOR_TRACE_ID_HEADER } from "@/lib/mirador/constants";
import { refreshTraceKeepAlive } from "@/lib/mirador/serverKeepAlive";
import {
  enforceUnauthenticatedSafeStatusRateLimit,
  getOptionalSafeJwtAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";

export async function GET(request: NextRequest) {
  const chainIdParam = request.nextUrl.searchParams.get("chainId");
  const messageHashParam = request.nextUrl.searchParams.get("messageHash");
  const safeAddressParam = request.nextUrl.searchParams.get("safeAddress");
  const chainId = Number(chainIdParam);

  if (!Number.isFinite(chainId) || !messageHashParam || !safeAddressParam) {
    return NextResponse.json(
      { message: "Missing or invalid Safe message status parameters." },
      { status: 400 }
    );
  }

  const authResult = await getOptionalSafeJwtAddress(request);
  if (authResult?.response) {
    return authResult.response;
  }
  if (authResult?.address && !safeAddressesMatch(authResult.address, safeAddressParam)) {
    return NextResponse.json(
      { message: "Safe session does not match the requested Safe." },
      { status: 403 }
    );
  }
  if (!authResult?.address) {
    const rateLimitResponse = enforceUnauthenticatedSafeStatusRateLimit(
      request,
      "safe-message-status"
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  const miradorTraceId = request.headers.get(MIRADOR_TRACE_ID_HEADER);
  if (miradorTraceId) {
    refreshTraceKeepAlive(miradorTraceId);
  }

  try {
    const result = await getSafeMessageStatusForClient(
      chainId,
      messageHashParam as `0x${string}`,
      safeAddressParam as `0x${string}`
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Safe message status.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
