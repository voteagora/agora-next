import {SignJWT, jwtVerify, type JWTPayload} from 'jose';

const DEFAULT_JWT_TTL = 60 * 60 * 24; // 24 hours
const DEFAULT_USER_SCOPE = "";

// Note: this is not included in lib/middleware/auth.ts since that file will be
// used in a non-node environment. This file is only intended to be used in/on node.
export async function generateJwt(
  userId: string,
  scope?: string | null,
  ttl?: number | null
): Promise<string> {
  const resolvedScope = scope || (await getScopeForUser(userId));
  const resolvedTtl = ttl || await getExpiryForUser(userId);
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + resolvedTtl; 

  const payload: JWTPayload = {
    sub: userId,
    scope: resolvedScope,
  };

  return new SignJWT({...payload})
      .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
      .setExpirationTime(exp)
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET as string));
}

export async function getExpiryForUser(userId: string) {
  // TODO, depending on TTL policy
  return DEFAULT_JWT_TTL;
}

export async function getScopeForUser(userId: string) {
  // TODO, depending on user permissions
  return DEFAULT_USER_SCOPE;
}
