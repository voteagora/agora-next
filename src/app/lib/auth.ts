import jwt from "jsonwebtoken";

const DEFAULT_JWT_TTL = "1d";
const DEFAULT_USER_SCOPE = "";

// Note: this is not included in lib/middleware/auth.ts since that file will be 
// used in a non-node environment. This file is only intended to be used in/on node.
export async function generateJwt(userId: string) {
  const scope = await getScopeForUser(userId);
  return jwt.sign({ sub: userId, scope: scope }, process.env.JWT_SECRET as string, {
    expiresIn: await getExpiryForUser(userId),
  });
}

export async function getExpiryForUser(userId: string) {
  // TODO, depending on TTL policy
  return DEFAULT_JWT_TTL;
}

export async function getScopeForUser(userId: string) {
  // TODO, depending on user permissions
  return DEFAULT_USER_SCOPE;
}