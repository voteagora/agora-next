import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { verifyJwtAndGetAddress } from "@/lib/siweAuth.server";

const SAFE_STATUS_RATE_LIMIT_WINDOW_MS = 60_000;
const SAFE_STATUS_RATE_LIMIT_MAX_REQUESTS = 60;

const unauthenticatedSafeStatusRequestLog = new Map<string, number[]>();

function normalizeAddress(address: string) {
  return address.toLowerCase() as `0x${string}`;
}

function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    return null;
  }

  return token.trim();
}

function getRequesterIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function buildAuthError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export function safeAddressesMatch(left: string, right: string) {
  return normalizeAddress(left) === normalizeAddress(right);
}

export async function getOptionalSafeJwtAddress(request: NextRequest): Promise<
  | {
      address?: `0x${string}`;
      response?: ReturnType<typeof buildAuthError>;
    }
  | undefined
> {
  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader) {
    return undefined;
  }

  const token = getBearerToken(authorizationHeader);
  if (!token) {
    return {
      response: buildAuthError("Invalid Safe session.", 401),
    };
  }

  const address = await verifyJwtAndGetAddress(token);
  if (!address) {
    return {
      response: buildAuthError("Invalid Safe session.", 401),
    };
  }

  return {
    address: normalizeAddress(address),
  };
}

export async function requireSafeJwtForAddress(
  request: NextRequest,
  safeAddress: string
): Promise<
  | {
      address: `0x${string}`;
    }
  | {
      response: ReturnType<typeof buildAuthError>;
    }
> {
  const authResult = await getOptionalSafeJwtAddress(request);
  if (!authResult) {
    return {
      response: buildAuthError("Authentication required.", 401),
    };
  }

  if (authResult.response) {
    return authResult;
  }

  if (!safeAddressesMatch(authResult.address!, safeAddress)) {
    return {
      response: buildAuthError(
        "Safe session does not match the requested Safe.",
        403
      ),
    };
  }

  return {
    address: authResult.address!,
  };
}

export function enforceUnauthenticatedSafeStatusRateLimit(
  request: NextRequest,
  routeKey: string
) {
  const requesterIp = getRequesterIp(request);
  const now = Date.now();
  const cacheKey = `${routeKey}:${requesterIp}`;
  const recentRequests = (
    unauthenticatedSafeStatusRequestLog.get(cacheKey) ?? []
  ).filter((timestamp) => now - timestamp < SAFE_STATUS_RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= SAFE_STATUS_RATE_LIMIT_MAX_REQUESTS) {
    unauthenticatedSafeStatusRequestLog.set(cacheKey, recentRequests);
    return NextResponse.json(
      { message: "Too many Safe status requests. Please retry shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      }
    );
  }

  recentRequests.push(now);
  unauthenticatedSafeStatusRequestLog.set(cacheKey, recentRequests);
  return null;
}
