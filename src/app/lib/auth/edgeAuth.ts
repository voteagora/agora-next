import { NextRequest } from "next/server";
import { validate as validateUuid } from "uuid";
import { jwtVerify } from "jose";

import {
  REASON_INVALID_TOKEN,
  REASON_NO_TOKEN,
  REASON_TOKEN_EXPIRED,
  REASON_TOKEN_NO_EXPIRY,
  REASON_TOKEN_NO_SCOPE,
  REASON_TOKEN_SCOPE_ROUTE_MISMATCH,
} from "@/app/lib/auth/constants";
import { AuthInfo } from "@/app/lib/auth/types";

// N.B. https://github.com/panva/jose/issues/114 for more information about selecting
// algorithm classes
export function extractBearerTokenFromHeader(
  authorizationHeader?: string | null
) {
  if (authorizationHeader && authorizationHeader.split(" ")[0] === "Bearer") {
    return authorizationHeader.split(" ")[1];
  }
  return null;
}

// TODO: add zod validations here
export async function validateBearerToken(
  request: NextRequest
): Promise<AuthInfo> {
  const token = extractBearerTokenFromHeader(
    request.headers.get("Authorization")
  );
  let authResponse: AuthInfo = { authenticated: true, failReason: "" };

  if (!token) {
    authResponse = {
      authenticated: false,
      failReason: REASON_NO_TOKEN,
    };
  } else if (validateUuid(token)) {
    // No further validations to do against API Key bearer tokens,
    // subsequent validations will be done in Node env
    authResponse = {
      authenticated: true,
      type: "api_key",
      token: token,
    };
  } else {
    // attempt to extract JWT payload
    try {
      const verifyResult = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      authResponse.type = "jwt";
      if (!verifyResult.payload.exp) {
        authResponse.authenticated = false;
        authResponse.failReason = REASON_TOKEN_NO_EXPIRY;
      } else if (
        Number(verifyResult.payload.exp) < Math.floor(Date.now() / 1000)
      ) {
        authResponse.authenticated = false;
        authResponse.failReason = REASON_TOKEN_EXPIRED;
      } else if (!verifyResult.payload.scope) {
        authResponse.authenticated = false;
        authResponse.failReason = REASON_TOKEN_NO_SCOPE;
      } else if (
        !validateScopeAgainstRoute(
          verifyResult.payload.scope as string,
          request.url
        )
      ) {
        authResponse.authenticated = false;
        authResponse.failReason = REASON_TOKEN_SCOPE_ROUTE_MISMATCH;
      } else {
        authResponse = {
          authenticated: true,
          type: "jwt",
          token: token,
          userId: verifyResult.payload.sub,
          scope: verifyResult.payload.scope as string,
        };
      }
    } catch (e: any) {
      authResponse = {
        authenticated: false,
        failReason: REASON_INVALID_TOKEN,
      };
    }
  }

  return authResponse;
}

export async function validateScopeAgainstRoute(
  scope: string,
  route: string
): Promise<boolean> {
  // TODO: Implement specific logic for route/scope validation
  return true;
}
