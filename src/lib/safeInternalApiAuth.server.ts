import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import redis from "@/lib/redis";
import { verifyJwtAndGetAddress } from "@/lib/siweAuth.server";

const SAFE_RATE_LIMIT_WINDOW_SECONDS = 60;

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
  const isVercelEnvironment =
    process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (isVercelEnvironment && forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
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
    return {
      response: authResult.response,
    };
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

async function enforceSafeRateLimit(params: {
  routeKey: string;
  subjectKey: string;
  maxRequests: number;
  errorMessage?: string;
}) {
  const windowSeconds = SAFE_RATE_LIMIT_WINDOW_SECONDS;
  const redisKey = `rate:safe:${params.routeKey}:${params.subjectKey}`;

  try {
    const requestCount = await redis.incr(redisKey);
    if (requestCount === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    if (requestCount <= params.maxRequests) {
      return null;
    }

    let retryAfterSeconds = await redis.ttl(redisKey);
    if (typeof retryAfterSeconds !== "number" || retryAfterSeconds < 1) {
      retryAfterSeconds = windowSeconds;
      await redis.expire(redisKey, windowSeconds);
    }

    return NextResponse.json(
      {
        message:
          params.errorMessage ??
          "Too many Safe requests. Please retry shortly.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  } catch (error) {
    console.error("[safe-rate-limit] redis limiter failed", {
      routeKey: params.routeKey,
      subjectKey: params.subjectKey,
      error,
    });
    return null;
  }
}

export async function enforceUnauthenticatedSafeStatusRateLimit(
  request: NextRequest,
  routeKey: string,
  maxRequests: number,
  errorMessage?: string
) {
  return enforceSafeRateLimit({
    routeKey,
    subjectKey: `ip:${getRequesterIp(request)}`,
    maxRequests,
    errorMessage:
      errorMessage ?? "Too many Safe status requests. Please retry shortly.",
  });
}

export async function enforceAuthenticatedSafeRateLimit(
  request: NextRequest,
  routeKey: string,
  address: string,
  maxRequests: number
) {
  return enforceSafeRateLimit({
    routeKey,
    subjectKey: `safe:${normalizeAddress(address)}`,
    maxRequests,
    errorMessage:
      "Too many Safe requests for this session. Please retry shortly.",
  });
}
