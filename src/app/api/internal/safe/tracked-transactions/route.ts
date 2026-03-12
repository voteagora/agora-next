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
  requireSafeJwtForAddress,
  safeAddressesMatch,
} from "@/lib/safeInternalApiAuth.server";
import {
  listActiveSafeTrackedTransactions,
  upsertSafeTrackedTransaction,
} from "@/lib/safeTrackedTransactions.server";
import type { CreateSafeTrackedTransactionRequest } from "@/lib/safeTrackedTransactions";
import {
  isSafeTrackedTransactionKind,
  normalizePositiveInteger,
  normalizeSafeAddress,
  normalizeSafeTxHash,
} from "@/lib/safeValidation";

export async function GET(request: NextRequest) {
  if (!isSafeOnchainTransactionTrackingEnabled()) {
    return NextResponse.json(
      { message: SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE },
      { status: 403 }
    );
  }

  const safeAddress = request.nextUrl.searchParams.get("safeAddress");
  const kind = request.nextUrl.searchParams.get("kind");
  const normalizedSafeAddress = safeAddress
    ? normalizeSafeAddress(safeAddress)
    : null;
  if (
    !normalizedSafeAddress ||
    !kind ||
    !isSafeTrackedTransactionKind(kind)
  ) {
    return NextResponse.json(
      { message: "Missing Safe address or kind." },
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
        "safe-tracked-transactions-list",
        authResult.address,
        60
      )
    : await enforceUnauthenticatedSafeStatusRateLimit(
        request,
        "safe-tracked-transactions-list",
        20
      );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const transactions = await listActiveSafeTrackedTransactions({
      daoSlug: Tenant.current().slug,
      kind,
      safeAddress: normalizedSafeAddress,
    });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("[safe-tracked-transactions] list failed", {
      safeAddress: normalizedSafeAddress,
      kind,
      error,
    });
    return NextResponse.json(
      { message: "Failed to load active Safe transactions." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isSafeOnchainTransactionTrackingEnabled()) {
    return NextResponse.json(
      { message: SAFE_ONCHAIN_TRANSACTION_TRACKING_DISABLED_MESSAGE },
      { status: 403 }
    );
  }

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
    !isSafeTrackedTransactionKind(body.kind) ||
    !body.safeAddress ||
    !body.safeTxHash
  ) {
    return NextResponse.json(
      { message: "Missing Safe tracked transaction fields." },
      { status: 400 }
    );
  }

  const normalizedSafeAddress = normalizeSafeAddress(body.safeAddress);
  const normalizedSafeTxHash = normalizeSafeTxHash(body.safeTxHash);
  const chainId = normalizePositiveInteger(body.chainId);
  if (!normalizedSafeAddress || !normalizedSafeTxHash || !chainId) {
    return NextResponse.json(
      { message: "Missing Safe tracked transaction fields." },
      { status: 400 }
    );
  }

  const authResult = await requireSafeJwtForAddress(
    request,
    normalizedSafeAddress
  );
  if ("response" in authResult) {
    return authResult.response;
  }
  const rateLimitResponse = await enforceAuthenticatedSafeRateLimit(
    request,
    "safe-tracked-transactions-create",
    authResult.address,
    30
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const transaction = await upsertSafeTrackedTransaction({
      ...body,
      safeAddress: normalizedSafeAddress,
      safeTxHash: normalizedSafeTxHash,
      chainId,
      daoSlug: Tenant.current().slug,
      traceContext,
    });
    return NextResponse.json({ transaction });
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
    return NextResponse.json(
      { message: "Failed to persist Safe tracked transaction." },
      { status: statusCode }
    );
  }
}
