import { NextRequest } from "next/server";
import { validate as validateUuid } from "uuid";
import { jwtVerify, type JWTPayload } from "jose";

import { REASON_NO_TOKEN } from "@/app/lib/auth/constants";
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

export function extractBearerToken(request: NextRequest): AuthInfo {
  const token = extractBearerTokenFromHeader(
    request.headers.get("Authorization")
  );
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
      token: token,
    };
  } else {
    // attempt to extract JWT payload
    const payload = jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
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
