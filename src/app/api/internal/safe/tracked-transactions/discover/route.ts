export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import Tenant from "@/lib/tenant/tenant";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import {
  isSafeOnchainTransactionTrackingEnabled,
  SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE,
} from "@/lib/safeFeatures";
import {
  enforceAuthenticatedSafeRateLimit,
  enforceUnauthenticatedSafeStatusRateLimit,
  getOptionalSafeJwtAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";
import { discoverSafeTrackedTransaction } from "@/lib/safeTrackedTransactions.server";
import type { DiscoverSafeTrackedTransactionRequest } from "@/lib/safeTrackedTransactions";
import {
  isSafeTrackedTransactionKind,
  normalizeHexData,
  normalizePositiveInteger,
  normalizeSafeAddress,
} from "@/lib/safeValidation";

export async function POST(request: NextRequest) {
  if (!isSafeOnchainTransactionTrackingEnabled()) {
    return NextResponse.json(
      { message: SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE },
      { status: 403 }
    );
  }

  const traceContext = getMiradorTraceContextFromHeaders(request);

  let body: DiscoverSafeTrackedTransactionRequest | null = null;
  try {
    body = (await request.json()) as DiscoverSafeTrackedTransactionRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    !body?.kind ||
    !isSafeTrackedTransactionKind(body.kind) ||
    !body.safeAddress ||
    !body.to ||
    !body.data
  ) {
    return NextResponse.json(
      { message: "Missing Safe discovery fields." },
      { status: 400 }
    );
  }

  const normalizedSafeAddress = normalizeSafeAddress(body.safeAddress);
  const normalizedTo = normalizeSafeAddress(body.to);
  const normalizedData = normalizeHexData(body.data);
  const chainId = normalizePositiveInteger(body.chainId);
  const createdAfter = normalizePositiveInteger(body.createdAfter);
  if (
    !normalizedSafeAddress ||
    !normalizedTo ||
    !normalizedData ||
    !chainId ||
    !createdAfter
  ) {
    return NextResponse.json(
      { message: "Missing Safe discovery fields." },
      { status: 400 }
    );
  }

  const authResult = await getOptionalSafeJwtAddress(request);
  if (authResult?.response) {
    return authResult.response;
  }
  if (
    authResult?.address &&
    !safeAddressesMatch(authResult.address, normalizedSafeAddress)
  ) {
    return NextResponse.json(
      { message: "Safe session does not match the requested Safe." },
      { status: 403 }
    );
  }
  const rateLimitResponse = authResult?.address
    ? await enforceAuthenticatedSafeRateLimit(
        request,
        "safe-tracked-transactions-discover",
        authResult.address,
        30
      )
    : await enforceUnauthenticatedSafeStatusRateLimit(
        request,
        "safe-tracked-transactions-discover",
        10,
        "Too many Safe discovery requests. Please retry shortly."
      );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const transaction = await discoverSafeTrackedTransaction({
      ...body,
      safeAddress: normalizedSafeAddress,
      to: normalizedTo,
      data: normalizedData,
      chainId,
      createdAfter,
      daoSlug: Tenant.current().slug,
      traceContext,
    });
    if (!transaction) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      transaction,
    });
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
    return NextResponse.json(
      { message: "Failed to discover Safe transaction." },
      { status: statusCode }
    );
  }
}
