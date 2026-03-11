/**
 * Alchemy API Key Configuration
 *
 * This module provides context-aware Alchemy API key selection:
 * - Client-side (browser): Uses NEXT_PUBLIC_ALCHEMY_ID (domain-whitelisted)
 * - Server-side (Node.js): Uses SERVERSIDE_ALCHEMY_ID_DEV or SERVERSIDE_ALCHEMY_ID_PROD (unrestricted)
 *
 * The system automatically detects the execution context using `typeof window`
 * and environment using NEXT_PUBLIC_AGORA_ENV.
 */

/**
 * Get Alchemy API key based on execution context and environment.
 * Automatically detects if running in browser or server, and dev or prod.
 *
 * - Browser: Returns NEXT_PUBLIC_ALCHEMY_ID (should be domain-whitelisted)
 * - Server (prod): Returns SERVERSIDE_ALCHEMY_ID_PROD
 * - Server (dev): Returns SERVERSIDE_ALCHEMY_ID_DEV
 * - Fallback: NEXT_PUBLIC_ALCHEMY_ID if server keys not configured
 *
 * This is the recommended function to use throughout the codebase.
 */
export const getAlchemyId = (): string => {
  // Check if running in browser
  if (typeof window !== "undefined") {
    const key = process.env.NEXT_PUBLIC_ALCHEMY_ID;
    if (!key) {
      throw new Error("NEXT_PUBLIC_ALCHEMY_ID is not defined");
    }
    return key;
  }

  // Running in server/Node.js - check environment
  const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
  const serverKeyProd = process.env.SERVERSIDE_ALCHEMY_ID_PROD;
  const serverKeyDev = process.env.SERVERSIDE_ALCHEMY_ID_DEV;
  const clientKey = process.env.NEXT_PUBLIC_ALCHEMY_ID;

  // Use environment-specific server key, with fallback from prod to dev
  let serverKey = isProd ? serverKeyProd : serverKeyDev;

  // If prod key is not configured, fall back to dev key
  // This is mainly for any previews which use prod environment
  // since prod key is a secret and not available in preview and previews will fail
  if (isProd && !serverKeyProd && serverKeyDev) {
    serverKey = serverKeyDev;
  }

  if (serverKey) {
    return serverKey;
  }

  if (clientKey) {
    const envName = isProd
      ? "SERVERSIDE_ALCHEMY_ID_PROD"
      : "SERVERSIDE_ALCHEMY_ID_DEV";
    console.warn(
      `${envName} not configured, falling back to NEXT_PUBLIC_ALCHEMY_ID. ` +
        `For production, set ${envName} to avoid exposing server-side key.`
    );
    return clientKey;
  }

  throw new Error("No Alchemy API key configured");
};
