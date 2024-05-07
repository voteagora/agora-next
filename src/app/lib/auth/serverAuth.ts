import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { SignJWT, type JWTPayload } from "jose";
import { PrismaClient } from "@prisma/client";

import {
  REASON_DISABLED_USER,
  REASON_INVALID_BEARER_TOKEN,
} from "@/app/lib/auth/constants";
import { validateBearerToken } from "@/app/lib/auth/edgeAuth";
import { AuthInfo } from "@/app/lib/auth/types";

const HASH_FN = "sha256";
const DEFAULT_JWT_TTL = 60 * 60 * 24; // 24 hours
const DEFAULT_USER_SCOPE = "user";

// Note: this is not included in lib/middleware/auth.ts since that file will be
// used in a non-node environment. This file is only intended to be used in/on node.
export async function authenticateApiUser(
  request: NextRequest
): Promise<AuthInfo> {
  const prismaModule = require("@/app/lib/prisma");
  const prisma = prismaModule.default as PrismaClient;
  let authResponse: AuthInfo = await validateBearerToken(request);

  if (!authResponse.authenticated) {
    return authResponse;
  }

  const key = authResponse.token as string;

  // TODO: caching logic, rate limiting
  // lookup hashed API key if authResponse is an API key, check user id otherwise for JWT:
  const user =
    authResponse.type === "api_key"
      ? await prisma.api_user.findFirst({
          where: {
            api_key: hashApiKey(key),
          },
        })
      : await prisma.api_user.findFirst({
          where: {
            id: authResponse.userId,
          },
        });

  if (!user) {
    authResponse = {
      authenticated: false,
      failReason: REASON_INVALID_BEARER_TOKEN,
    };
  } else if (!user.enabled) {
    authResponse = {
      authenticated: false,
      failReason: REASON_DISABLED_USER,
    };
  } else {
    authResponse.userId = user.id;
  }

  return authResponse;
}

function hashApiKey(apiKey: string) {
  const hash = createHash(HASH_FN);
  hash.update(apiKey);
  return hash.digest("hex");
}

export async function generateJwt(
  userId: string,
  scope?: string | null,
  ttl?: number | null,
  siweData?: {
    address: string;
    chainId: string;
    nonce: string;
  } | null
): Promise<string> {
  const resolvedScope = scope || (await getScopeForUser(userId));
  const resolvedTtl = ttl || (await getExpiry());
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + resolvedTtl;

  const payload: JWTPayload = {
    sub: userId,
    scope: resolvedScope,
    siwe: siweData ? { ...siweData } : undefined,
  };

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET as string));
}

export async function getExpiry() {
  // TODO, depending on TTL policy
  return DEFAULT_JWT_TTL;
}

export async function getScopeForUser(userId: string) {
  // TODO, depending on user permissions
  return DEFAULT_USER_SCOPE;
}
