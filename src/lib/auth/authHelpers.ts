"use server";

import {
  verifySiwe,
  verifyJwtAndGetAddress,
} from "@/app/proposals/draft/actions/siweAuth";

/**
 * Standard auth parameters for server actions
 */
export interface AuthParams {
  address?: `0x${string}`;
  message?: string;
  signature?: `0x${string}`;
  jwt?: string;
}

/**
 * Result of authentication verification
 */
export type AuthResult =
  | { success: true; address: `0x${string}` }
  | { success: false; error: string };

/**
 * Verify JWT or SIWE authentication and return the authenticated address.
 *
 * @param auth - Authentication parameters (JWT or SIWE signature)
 * @param expectedAddress - Optional address to verify against (required for SIWE)
 * @returns AuthResult with success status and address or error message
 *
 * @example
 * ```ts
 * const authResult = await verifyAuth(auth, address);
 * if (!authResult.success) {
 *   return { success: false, error: authResult.error };
 * }
 * // Use authResult.address
 * ```
 */
export async function verifyAuth(
  auth: AuthParams,
  expectedAddress?: `0x${string}`
): Promise<AuthResult> {
  // JWT authentication
  if (auth.jwt) {
    const jwtAddress = await verifyJwtAndGetAddress(auth.jwt);
    if (!jwtAddress) {
      return { success: false, error: "Invalid token" };
    }

    // Verify address match if expected address provided
    if (
      expectedAddress &&
      jwtAddress.toLowerCase() !== expectedAddress.toLowerCase()
    ) {
      return { success: false, error: "Token address mismatch" };
    }

    return { success: true, address: jwtAddress };
  }

  // SIWE authentication
  if (auth.message && auth.signature) {
    if (!expectedAddress && !auth.address) {
      return {
        success: false,
        error: "Address required for signature verification",
      };
    }

    const addressToVerify = expectedAddress || auth.address!;
    const isValid = await verifySiwe({
      address: addressToVerify,
      message: auth.message,
      signature: auth.signature,
    });

    if (!isValid) {
      return { success: false, error: "Invalid signature" };
    }

    return { success: true, address: addressToVerify };
  }

  return { success: false, error: "Missing authentication credentials" };
}

/**
 * Verify authentication and throw an error if invalid.
 * Useful for server actions that want to throw instead of returning error objects.
 *
 * @param auth - Authentication parameters
 * @param expectedAddress - Optional address to verify against
 * @returns The authenticated address
 * @throws Error if authentication fails
 *
 * @example
 * ```ts
 * const address = await requireAuth(auth, expectedAddress);
 * // Continue with authenticated address
 * ```
 */
export async function requireAuth(
  auth: AuthParams,
  expectedAddress?: `0x${string}`
): Promise<`0x${string}`> {
  const result = await verifyAuth(auth, expectedAddress);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.address;
}

/**
 * Verify authentication for server actions that return { success, error } format.
 * Returns early with error object if auth fails, otherwise returns null to continue.
 *
 * @param auth - Authentication parameters
 * @param expectedAddress - Optional address to verify against
 * @returns Error object if auth failed, null if successful
 *
 * @example
 * ```ts
 * const authError = await checkAuth(auth, address);
 * if (authError) return authError;
 * // Continue with authenticated request
 * ```
 */
export async function checkAuth(
  auth: AuthParams,
  expectedAddress?: `0x${string}`
): Promise<{ success: false; error: string } | null> {
  const result = await verifyAuth(auth, expectedAddress);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return null;
}
