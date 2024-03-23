import { NextRequest } from "next/server";

import { validate as validateUuid } from "uuid";

let prismaModule: any;

const REASON_NO_TOKEN = "No token provided in 'authorization' header";
const REASON_INVALID_API_KEY = "Invalid API Key";
const REASON_DISABLED_USER = "User disabled";

export type AuthResponse = {
  authenticated: boolean;
  reason?: string;
};

export function hasApiKey(request: NextRequest): AuthResponse {
  const token = request.headers.get("authorization");
  let authResponse: AuthResponse = {authenticated: true, reason: ""};

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

export async function authenticateApiUser(request: NextRequest): Promise<AuthResponse> {
  let prisma: any;
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    prismaModule = await import("@/app/lib/prisma");
    prisma = prismaModule.default;
  }

  let authResponse: AuthResponse = hasApiKey(request);

  const token = request.headers.get("authorization");

  // TODO: caching logic, rate limiting
  const user = await prisma.api_user.findFirst({
    where: {
      api_key: token,
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
  }

  return authResponse;
}