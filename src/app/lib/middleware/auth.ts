import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { validate as validateUuid } from "uuid";

let prismaModule: any;

const HASH_FN = "sha256";
const REASON_NO_TOKEN = "No token provided in 'authorization' header";
const REASON_INVALID_API_KEY = "Invalid API Key";
const REASON_DISABLED_USER = "User disabled";

export type AuthResponse = {
  authenticated: boolean;
  userId?: string;
  reason?: string;
};

export function hasApiKey(request: NextRequest): AuthResponse {
  const token = request.headers.get("authorization");
  let authResponse: AuthResponse = { authenticated: true, reason: "" };

  if (!token) {
    authResponse = {
      authenticated: false,
      reason: REASON_NO_TOKEN,
    };
  } else if (!validateUuid(token)) {
    authResponse = {
      authenticated: false,
      reason: REASON_INVALID_API_KEY,
    };
  }

  return authResponse;
}

function hashApiKey(apiKey: string) {
  const hash = createHash(HASH_FN);
  hash.update(apiKey);
  return hash.digest("hex");
}

export async function authenticateApiUser(request: NextRequest): Promise<AuthResponse> {
  let prisma: any;
  // Needed for Vercel middleware to run in non-node runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    prismaModule = await import("@/app/lib/prisma");
    prisma = prismaModule.default;
  }

  let authResponse: AuthResponse = hasApiKey(request);

  const key = request.headers.get("authorization");

  if (!key) {
    return authResponse;
  }

  // TODO: caching logic, rate limiting
  const user = await prisma.api_user.findFirst({
    where: {
      api_key: hashApiKey(key),
    },
  });

  if (!user) {
    authResponse = {
      authenticated: false,
      reason: REASON_INVALID_API_KEY,
    };
  } else if (!user.enabled) {
    authResponse = {
      authenticated: false,
      reason: REASON_DISABLED_USER,
    };
  } else {
    authResponse.userId = user.id;
  }

  return authResponse;
}