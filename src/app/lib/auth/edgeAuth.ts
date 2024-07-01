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
  ROLE_BADGEHOLDER,
  ROLE_PUBLIC_READER,
} from "@/app/lib/auth/constants";
import { AuthInfo } from "@/app/lib/auth/types";

// N.B. https://github.com/panva/jose/issues/114 for more information about selecting
// algorithm classes
export function extractBearerTokenFromHeader(
  authorizationHeader?: string | null
): string | null {
  if (authorizationHeader && authorizationHeader.split(" ")[0] === "Bearer") {
    return authorizationHeader.split(" ")[1];
  }
  return null;
}

export async function validateBearerToken(
  request: NextRequest
): Promise<AuthInfo> {
  const token = extractBearerTokenFromHeader(
    request.headers.get("Authorization")
  );
  let authResponse: AuthInfo = { authenticated: false, failReason: "" };

  if (!token) {
    authResponse = {
      authenticated: false,
      failReason: REASON_NO_TOKEN,
    };
  } else if (validateUuid(token)) {
    // This will fail API key validation against any non-public get routes
    // If we want to allow API Key access to private routes (e.g. ballots)
    // then we should either require API Key users to acquire a JWT with
    // the appropriate scope, or we remove the check below and perform it
    // on the server side.
    if (await validateScopeAgainstRoute(ROLE_PUBLIC_READER, request)) {
      authResponse = {
        authenticated: true,
        type: "api_key",
        token: token,
      };
    } else {
      authResponse.authenticated = false;
      authResponse.failReason = REASON_TOKEN_SCOPE_ROUTE_MISMATCH;
    }
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
          request
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

/*
  This function performs any stateless validations of the supplied scope 
  against the particular route being accessed in this request.

  Further validations may be performed on the server, with access to our
  database for further authorization information. Note that this implies 
  that a request which passes validation here may still be unauthorized 
  if the server-side validation fails.

  Anything supplied to the user in the JWT payload should be validated
  here to confirm authorized access to the requested route.
*/
export async function validateScopeAgainstRoute(
  scope: string,
  request: NextRequest
): Promise<boolean> {
  const roles = scope.split(";");
  const isBadge = roles.includes("badgeholder");
  const isPublic = roles.includes("reader:public");
  if (
    request.nextUrl.pathname.includes("/api/v1/retrofunding/ballots") ||
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "DELETE"
  ) {
    return isBadge;
  } else {
    return isPublic;
  }
}
