import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { SignJWT, type JWTPayload } from "jose";
import { PrismaClient } from "@prisma/client";

import {
  REASON_DISABLED_USER,
  REASON_INVALID_BEARER_TOKEN,
  ROLE_DEFAULT_USER,
  ROLE_BADGEHOLDER,
} from "@/app/lib/auth/constants";
import { isBadgeholder } from "@/app/api/common/badgeholders/getBadgeholders";
import { validateBearerToken } from "@/app/lib/auth/edgeAuth";
import { AuthInfo } from "@/app/lib/auth/types";

const HASH_FN = "sha256";
const DEFAULT_JWT_TTL = 60 * 60 * 24; // 24 hours

type SiweData = {
  address: string;
  chainId: string;
  nonce: string;
};

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
  siweData?: SiweData | null
): Promise<string> {
  const scopes = scope ? [scope] : [];
  const resolvedScopes = await getRolesForUser(userId, siweData);
  const resolvedScopesString = [...scopes, ...resolvedScopes].join(";");
  const resolvedTtl = ttl || (await getExpiry());
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + resolvedTtl;

  // scope is a semicolon separated string of roles associated with a user
  const payload: JWTPayload = {
    sub: userId,
    scope: resolvedScopesString,
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

/*
  Get roles for user finds the roles associated with a given user. The default 
  role gives the user access to reading public data like proposals, and delegates.

  Other roles can also be associated with the user to restrict access to writing or
  reading priviliged data. The roles associated with a given api user ID and their
  Sign In With Ethereum data are resolved in this function. 

  Arbitrary data can be included with a particular role, allowing for granular 
  authorization to access particular resources. 
*/
export async function getRolesForUser(
  userId: string,
  siweData?: SiweData | null
) {
  const defaultRoles = [ROLE_DEFAULT_USER];
  if (siweData) {
    const isBadge = await isBadgeholder(siweData.address);
    return isBadge
      ? [ROLE_BADGEHOLDER, ROLE_DEFAULT_USER]
      : [ROLE_DEFAULT_USER];
  }
}
