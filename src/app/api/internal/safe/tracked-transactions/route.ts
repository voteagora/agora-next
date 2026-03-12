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
  listActiveSafeTrackedTransactions,
  upsertSafeTrackedTransaction,
} from "@/lib/safeTrackedTransactions.server";
import type { CreateSafeTrackedTransactionRequest } from "@/lib/safeTrackedTransactions";

export async function GET(request: NextRequest) {
  const safeAddress = request.nextUrl.searchParams.get("safeAddress");
  const kind = request.nextUrl.searchParams.get("kind");
  if (!safeAddress || !kind) {
    return NextResponse.json(
      { message: "Missing Safe address or kind." },
      { status: 400 }
    );
  }

  const authResult = await getOptionalSafeJwtAddress(request);
  if (authResult?.response) {
    return authResult.response;
  }
  if (authResult?.address && !safeAddressesMatch(authResult.address, safeAddress)) {
    return NextResponse.json(
      { message: "Safe session does not match the requested Safe." },
      { status: 403 }
    );
  }
  if (!authResult?.address) {
    const rateLimitResponse = enforceUnauthenticatedSafeStatusRateLimit(
      request,
      "safe-tracked-transactions-list"
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  try {
    const transactions = await listActiveSafeTrackedTransactions({
      daoSlug: Tenant.current().slug,
      kind,
      safeAddress: safeAddress as `0x${string}`,
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load active Safe transactions.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const traceContext = getMiradorTraceContextFromHeaders(request);

  let body: CreateSafeTrackedTransactionRequest | null = null;
  try {
    body = (await request.json()) as CreateSafeTrackedTransactionRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    !body?.kind ||
    !body.safeAddress ||
    !body.safeTxHash ||
    !Number.isFinite(body.chainId)
  ) {
    return NextResponse.json(
      { message: "Missing Safe tracked transaction fields." },
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
      "safe-tracked-transactions-create"
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  try {
    const transaction = await upsertSafeTrackedTransaction({
      ...body,
      daoSlug: Tenant.current().slug,
      traceContext,
    });
    return NextResponse.json({ transaction });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to persist Safe tracked transaction.";
    const statusCode =
      typeof (error as { statusCode?: unknown })?.statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;
    return NextResponse.json({ message }, { status: statusCode });
  }
}
