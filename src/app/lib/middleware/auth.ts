import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { validate as validateUuid } from "uuid";

import { jwtVerify, type JWTPayload } from "jose";

let prismaModule: any;

const HASH_FN = "sha256";
const REASON_NO_TOKEN = "No token provided in 'Authorization' header";
const REASON_INVALID_BEARER_TOKEN = "Invalid Bearer Token";
const REASON_DISABLED_USER = "User disabled";
// N.B. https://github.com/panva/jose/issues/114 for more information about selecting 
// algorithm classes
export type AuthInfo = {
  // change name of this field, as it's currently a misnomer; or at least tri-valued
  authenticated: boolean;
  userId?: string;
  scope?: string;
  reason?: string;
  type?: "api_key" | "jwt",
  token?: string,
};

export function extractBearerTokenFromHeader(authorizationHeader?: string | null) {
  if (authorizationHeader && authorizationHeader.split(" ")[0] === "Bearer") {
    return authorizationHeader.split(" ")[1];
  }
  return null;
}

export function extractBearerToken(request: NextRequest): AuthInfo {
  const token = extractBearerTokenFromHeader(request.headers.get("Authorization"));
  let authResponse: AuthInfo = { authenticated: true, reason: "" };

  if (!token) {
    authResponse = {
      authenticated: false,
      reason: REASON_NO_TOKEN,
    };
  } else if (validateUuid(token)) {
    authResponse = {
      authenticated: true,
      type: "api_key",
      token: token
    };
  } else {
    // attempt to extract JWT payload
    const payload = jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
  }

  return authResponse;
}

function hashApiKey(apiKey: string) {
  const hash = createHash(HASH_FN);
  hash.update(apiKey);
  return hash.digest("hex");
}

export async function authenticateApiUser(
  request: NextRequest
): Promise<AuthInfo> {
  let prisma: any;
  // Needed for Vercel middleware to run in non-node runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    prismaModule = await import("@/app/lib/prisma");
    prisma = prismaModule.default;
  }

  let authResponse: AuthInfo = extractBearerToken(request);

  const key = extractBearerTokenFromHeader(request.headers.get("Authorization"));

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
      reason: REASON_INVALID_BEARER_TOKEN,
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

export async function validateBearerToken(
  request: NextRequest
): Promise<AuthInfo> {
  let authResponse: AuthInfo = extractBearerToken(request);

  return authResponse;
}

export async function validateJwt(request: NextRequest): Promise<AuthInfo> {
  let authResponse: AuthInfo = extractBearerToken(request);

  return authResponse;
}

export async function verify(request: NextRequest): Promise<Token> {
  const token: string = "";
  const secret: string = "";
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  // run some checks on the returned payload, perhaps you expect some specific values

  // if its all good, return it, or perhaps just return a boolean
  return payload;
}
