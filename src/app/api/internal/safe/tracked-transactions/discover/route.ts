export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

import Tenant from "@/lib/tenant/tenant";
import { getMiradorTraceContextFromHeaders } from "@/lib/mirador/requestContext";
import {
  enforceUnauthenticatedSafeStatusRateLimit,
  getOptionalSafeJwtAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";
import {
  discoverSafeTrackedTransaction,
} from "@/lib/safeTrackedTransactions.server";
import type { DiscoverSafeTrackedTransactionRequest } from "@/lib/safeTrackedTransactions";

export async function POST(request: NextRequest) {
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
    !body.safeAddress ||
    !body.to ||
    !body.data ||
    !Number.isFinite(body.chainId) ||
    !Number.isFinite(body.createdAfter)
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
  if (authResult?.address && !safeAddressesMatch(authResult.address, body.safeAddress)) {
    return NextResponse.json(
      { message: "Safe session does not match the requested Safe." },
      { status: 403 }
    );
  }
  if (!authResult?.address) {
    const rateLimitResponse = enforceUnauthenticatedSafeStatusRateLimit(
      request,
      "safe-tracked-transactions-discover"
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  try {
    const transaction = await discoverSafeTrackedTransaction({
      ...body,
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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to discover Safe transaction.";
    const statusCode =
      typeof (error as { statusCode?: unknown })?.statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;
    return NextResponse.json({ message }, { status: statusCode });
  }
}
